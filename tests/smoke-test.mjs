import { readFileSync } from "node:fs";
import { Script } from "node:vm";
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
  assert.ok(ids.includes(required), \`expected required app control: \${required}\`);
}

console.log("Smoke tests passed: JavaScript syntax, unique IDs, and referenced controls.");
