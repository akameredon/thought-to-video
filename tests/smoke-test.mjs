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

console.log("Smoke tests passed: JavaScript syntax, unique IDs, and referenced controls.");

const controls = Object.fromEntries(ids.map(id => [id, {
  value: "", textContent: "", focus() { this.focused = true; },
  classList: { remove() {} }, scrollIntoView() {}, addEventListener() {}
}]));
runInNewContext(scriptMatch[1].split("const SR=")[0], {
  document: { getElementById: id => controls[id] },
  localStorage: { setItem() {} }
});
for (const type of ["video", "mini", "course"]) {
  controls.contentType.value = type;
  controls.thought.value = "Education";
  controls.generate.onclick();
  assert.ok(controls.script.value.includes("Education"), `${type} accepts a short idea`);
}
controls.thought.value = "   ";
const previousScript = controls.script.value;
controls.generate.onclick();
assert.equal(controls.script.value, previousScript, "empty input preserves the draft");
assert.ok(controls.thought.focused, "empty input focuses the thought field");

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
    open: async () => ({ put: async (key, value) => { cachedUpdate = value; } })
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
assert.equal(await navigate(), freshPage, "online navigation bypasses stale cached HTML");
assert.ok(cachedUpdate.fresh, "latest page refreshes the offline copy");
offline = true;
assert.equal(await navigate(), cachedPage, "offline navigation keeps the app available");
console.log("Regression tests passed: short ideas, empty input, fresh pages, and offline fallback.");
