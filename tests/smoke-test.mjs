import { readFileSync } from "node:fs";
import { Script, runInNewContext } from "node:vm";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
assert.ok(scriptMatch, "index.html must contain the app script");
assert.doesNotThrow(() => new Script(scriptMatch[1]), "app JavaScript must parse");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "HTML element IDs must be unique");
const referencedIds = [...scriptMatch[1].matchAll(/\$\("([^"]+)"\)/g)].map((match) => match[1]);
const missingIds = [...new Set(referencedIds.filter((id) => !ids.includes(id)))];
assert.deepEqual(missingIds, [], "all JavaScript-referenced element IDs must exist in HTML");

for (const required of ["thought", "generate", "script", "enableCamera", "start", "stop", "playback"]) {
  assert.ok(ids.includes(required), "expected required app control: " + required);
}

const controls = Object.fromEntries(ids.map(id => [id, {
  value: "", textContent: "", disabled: false,
  focus() { this.focused = true; },
  classList: { add() {}, remove() {} },
  scrollIntoView() {}, addEventListener() {}
}]));
let fetchCalls = 0;
let failAI = false;
let sentBody;
const alerts = [];
runInNewContext(scriptMatch[1].split("const SR=")[0], {
  document: { getElementById: id => controls[id] },
  localStorage: { setItem() {} },
  alert: message => alerts.push(message),
  AbortController,
  setTimeout,
  clearTimeout,
  fetch: async (_url, options) => {
    fetchCalls++;
    sentBody = JSON.parse(options.body);
    return {
      ok: !failAI,
      status: failAI ? 502 : 200,
      text: async () => JSON.stringify(failAI
        ? { error: "Providers unavailable" }
        : {
            script: "Education helps people learn.",
            caption: "A simple, useful caption.",
            provider: "Gemini"
          })
    };
  }
});

controls.thought.value = "   Education   helps people learn.   ";
controls.contentType.value = "video";
await controls.generate.onclick();
assert.equal(fetchCalls, 1, "generation should call the server-side AI endpoint once");
assert.equal(sentBody.thought, "Education helps people learn.", "thought whitespace should be normalized");
assert.equal(controls.script.value, "Education helps people learn.", "AI script should be displayed");
assert.equal(controls.caption.value, "A simple, useful caption.", "AI caption should be displayed");
assert.equal(controls.count.textContent, "4 words · about 2 seconds", "word count should work");
assert.equal(controls.prompterText.textContent, "Education helps people learn.", "teleprompter should match the script");
assert.equal(controls.outputHint.textContent.includes("about 60 seconds"), true, "video output should show its intended duration");

failAI = true;
controls.thought.value = "I want to explain why saving money matters.";
await controls.generate.onclick();
assert.equal(fetchCalls, 2, "a second valid idea should retry the server endpoint");
assert.ok(controls.outputHint.textContent.includes("without an AI API"), "provider failure should switch to the on-device writer");
assert.ok(controls.script.value.includes("For example, take the idea"), "offline script should include a practical example");
assert.ok(controls.caption.value.includes("#ThoughtToVideo"), "offline mode should create a caption");

controls.thought.value = "   ";
await controls.generate.onclick();
assert.equal(fetchCalls, 2, "empty input must not call the AI endpoint");
assert.ok(controls.thought.focused, "empty input should focus the thought field");
assert.deepEqual(alerts, [], "valid input should not trigger error alerts");

console.log("Smoke tests passed: syntax, unique IDs, AI generation, offline fallback, whitespace cleanup, word count, captions, teleprompter, and empty input.");

const handlers = {};
const cachedPage = { offline: true };
const freshPage = { ok: true, clone: () => ({ fresh: true }) };
let offline = false;
let cachedUpdate;
runInNewContext(readFileSync(new URL("../sw.js", import.meta.url), "utf8"), {
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
async function navigate() {
  let response;
  handlers.fetch({
    request: { method: "GET", mode: "navigate", url: "https://example.com/" },
    respondWith: promise => { response = promise; }
  });
  return response;
}
assert.equal(await navigate(), freshPage, "online navigation should bypass stale cached HTML");
assert.ok(cachedUpdate.fresh, "latest page should refresh the offline copy");
offline = true;
assert.equal(await navigate(), cachedPage, "offline navigation should keep the app available");
console.log("Regression tests passed: fresh pages and offline fallback.");
