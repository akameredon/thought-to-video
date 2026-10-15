import { readFileSync } from "node:fs";
import { Script, runInNewContext } from "node:vm";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const engineSource = readFileSync(new URL("../content-engine.js", import.meta.url), "utf8");
const swSource = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const appMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
assert.ok(appMatch, "index.html must contain the app script");
assert.doesNotThrow(() => new Script(engineSource), "content engine JavaScript must parse");
assert.doesNotThrow(() => new Script(appMatch[1]), "app JavaScript must parse");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, "HTML element IDs must be unique");
const refs = [...appMatch[1].matchAll(/\$\("([^"]+)"\)/g)].map(match => match[1]);
assert.deepEqual([...new Set(refs.filter(id => !ids.includes(id)))], [], "all JavaScript-referenced IDs must exist");
for (const format of ["video", "story", "lesson", "mini", "course"]) {
  assert.ok(html.includes('value="' + format + '"'), "UI should offer " + format + " format");
}

const window = {};
runInNewContext(engineSource, { window, globalThis: window });
const engine = window.TTVContentEngine;
assert.ok(engine, "engine should expose its public interface");
assert.equal(engine.componentCount, 1000, "engine should register 1,000 reusable logic components");
assert.equal(new Set(engine.components.map(item => item.id)).size, 1000, "component IDs should be unique");
assert.equal(new Set(engine.components.map(item => item.family)).size, 10, "components should span ten families");

const sample = "I want to explain why saving money matters.";
for (const format of ["video", "story", "lesson", "mini", "course"]) {
  const result = engine.generate({ thought: sample, tone: "helpful", format });
  assert.ok(result.script.length > 100, format + " should produce a useful draft");
  assert.ok(result.caption.includes("#ThoughtToVideo"), format + " should include a caption");
  assert.equal(result.componentCount, 1000);
}
assert.ok(engine.generate({ thought: sample, format: "story" }).script.includes("THE TURNING POINT"), "story format should include a turning point");
assert.ok(engine.generate({ thought: sample, format: "lesson" }).script.includes("LEARNING GOAL"), "lesson format should include a learning goal");
assert.ok(engine.generate({ thought: sample, format: "course" }).script.includes("LESSON 6"), "full course should include six lessons");
assert.equal(engine.generate({ thought: "  ", format: "video" }).script, "", "empty input should return an empty script");

const controls = Object.fromEntries(ids.map(id => [id, {
  value: "", textContent: "", disabled: false,
  focus() { this.focused = true; },
  classList: { add() {}, remove() {} },
  scrollIntoView() {}, addEventListener() {}
}]));
let localStorageWrites = 0;
const context = {
  window,
  document: { getElementById: id => controls[id] },
  localStorage: { setItem() { localStorageWrites++; } },
  navigator: { onLine: false },
  console
};
runInNewContext(appMatch[1].split("const SR=")[0], context);
controls.thought.value = "   Education   helps people learn.   ";
controls.contentType.value = "video";
controls.tone.value = "helpful";
await controls.generate.onclick();
assert.equal(controls.outputTitle.textContent, "Your talking script");
assert.ok(controls.script.value.includes("For example"), "video draft should include a practical example");
assert.ok(controls.caption.value.includes("#ThoughtToVideo"), "app should show a generated caption");
assert.ok(controls.outputHint.textContent.includes("without an AI API"), "app should explain local generation");
assert.ok(localStorageWrites > 0, "draft should be saved locally");
assert.equal(controls.count.textContent.includes("words"), true, "word count should update");
assert.equal(controls.prompterText.textContent, controls.script.value, "teleprompter should match the script");

for (const [format, title] of [
  ["story", "Your story structure"],
  ["lesson", "Your teaching lesson"],
  ["mini", "Your mini-course"],
  ["course", "Your course outline"]
]) {
  controls.contentType.value = format;
  await controls.generate.onclick();
  assert.equal(controls.outputTitle.textContent, title, "app title should match " + format);
  assert.ok(controls.script.value.length > 100, "app should generate " + format + " locally");
}
assert.ok(html.includes('src="./content-engine.js"'), "app must load the content engine");
assert.ok(!html.includes('fetch("/.netlify/functions/generate"'), "default generation must not require a remote API");

const handlers = {};
const cachedPage = { offline: true };
const freshPage = { ok: true, clone: () => ({ fresh: true }) };
let offline = false;
let cachedUpdate;
runInNewContext(swSource, {
  URL,
  self: {
    location: { origin: "https://example.com" },
    addEventListener: (name, handler) => { handlers[name] = handler; }
  },
  caches: {
    match: async () => cachedPage,
    open: async () => ({ put: async (_key, value) => { cachedUpdate = value; } })
  },
  fetch: async () => { if (offline) throw new Error("Offline"); return freshPage; }
});
assert.ok(swSource.includes("./content-engine.js"), "service worker should precache the engine");
assert.ok(swSource.includes("thought-to-video-v5"), "service worker cache version should be bumped");
async function navigate() {
  let response;
  handlers.fetch({
    request: { method: "GET", mode: "navigate", url: "https://example.com/" },
    respondWith: promise => { response = promise; }
  });
  return response;
}
assert.equal(await navigate(), freshPage, "online navigation should use the latest page");
assert.ok(cachedUpdate.fresh, "latest page should refresh the offline copy");
offline = true;
assert.equal(await navigate(), cachedPage, "offline navigation should use the cached shell");

console.log("Smoke tests passed: 1,000 components, five formats, local-first generation, captions, draft saving, teleprompter, syntax, IDs, and offline cache.");
