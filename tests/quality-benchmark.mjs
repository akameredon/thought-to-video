import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import assert from "node:assert/strict";

const engineSource = readFileSync(new URL("../content-engine.js", import.meta.url), "utf8");
const corpus = JSON.parse(readFileSync(new URL("./quality-corpus.json", import.meta.url), "utf8"));
const window = {};
runInNewContext(engineSource, { window, globalThis: window });
const engine = window.TTVContentEngine;
assert.ok(engine, "content engine must expose TTVContentEngine");
assert.equal(engine.componentCount, 1000, "expected 1,000 registered components");
for (const family of ["hook", "explanation", "story", "example", "transition", "conclusion", "lesson", "course", "caption", "quality"]) {
  assert.equal(engine.component(family, "benchmark-seed").family, family, "component lookup must return the requested family");
}

const requiredSections = {
  video: [],
  story: ["THE REAL STARTING POINT", "THE TENSION", "THE TURNING POINT", "THE LESSON"],
  lesson: ["LEARNING GOAL", "EXPLAIN", "DEMONSTRATE", "PRACTISE", "CHECK UNDERSTANDING"],
  mini: ["LESSON 1", "LESSON 2", "LESSON 3", "FINAL PROJECT"],
  course: ["LESSON 1", "LESSON 6", "FINAL PROJECT", "ASSESSMENT CHECKLIST"],
  caption: ["#ThoughtToVideo"]
};
const rows = [];
for (const item of corpus) {
  const result = item.format === "caption"
    ? { script: engine.caption(item.thought), caption: engine.caption(item.thought) }
    : engine.generate({ thought: item.thought, format: item.format, tone: "helpful" });
  const text = result.script || "";
  const lower = text.toLowerCase();
  const missingIdeaTerms = item.mustContain.filter(term => !lower.includes(term.toLowerCase()));
  const missingSections = (requiredSections[item.format] || []).filter(section => !lower.includes(section.toLowerCase()));
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const genericLines = [
    "A thought worth sharing",
    "What’s your take? Share it in the comments.",
    "Demonstrate the lesson using an ordinary, realistic situation."
  ];
  const genericPhraseHits = genericLines.filter(phrase => lower.includes(phrase.toLowerCase())).length;
  const videoMarkers = ["For a shop using WhatsApp status", "For a simple weekly money review", "Instead of asking an AI tool", "If daily posting is unrealistic", "For a local business", "Before opening messages or tutorials", "Before starting a freelance job", "Residents could agree on a collection day", "Choose one real situation where this idea applies", "For example, if you are learning a new skill"];
  const missingConcreteExample = item.format === "video" && !videoMarkers.some(marker => text.includes(marker));
  const passed = text.length > 40 && missingIdeaTerms.length === 0 && missingSections.length === 0 && genericPhraseHits === 0 && !missingConcreteExample;
  rows.push({ id: item.id, format: item.format, words, passed, missingIdeaTerms, missingSections, genericPhraseHits });
  assert.ok(text.length > 40, item.id + ": output is too short");
  assert.deepEqual(missingIdeaTerms, [], item.id + ": output lost required concepts from the user's idea");
  assert.deepEqual(missingSections, [], item.id + ": required format structure is missing");
  assert.equal(genericPhraseHits, 0, item.id + ": known boilerplate phrase remains");
  assert.equal(missingConcreteExample, false, item.id + ": video must contain a concrete, topic-aware example");
  if (item.format === "story") assert.ok(text.includes("STORY BUILDER"), item.id + ": story template must be clearly labelled as a builder");
  if (item.format === "lesson" && /price|pricing|service|cost/i.test(item.thought)) {
    assert.ok(text.includes("Worked example:"), item.id + ": pricing lesson should include a worked calculation");
  }
  if (item.format === "mini" || item.format === "course") {
    assert.ok(text.includes("Demonstration: Sample:") || text.includes("Demonstration: Worked example:"), item.id + ": course must include a concrete demonstration");
    assert.ok(text.includes("Practice: "), item.id + ": course must include a practice task");
    const practices = Array.from(text.matchAll(/Practice: ([^\n]+)/g), match => match[1]);
    const demonstrations = Array.from(text.matchAll(/Demonstration: ([^\n]+)/g), match => match[1]);
    assert.equal(new Set(practices).size, practices.length, item.id + ": lesson practice tasks must be distinct");
    assert.equal(new Set(demonstrations).size, demonstrations.length, item.id + ": lesson demonstrations must be distinct");
  }
  if (item.format === "caption") {
    assert.ok(text.toLowerCase().includes("small businesses"), "caption should preserve the user's specific audience");
    assert.ok(!text.includes("…"), "caption should not silently truncate the user's idea");
  }
}
const videoRows = rows.filter(row => row.format === "video");
const avgVideoWords = videoRows.reduce((sum, row) => sum + row.words, 0) / Math.max(1, videoRows.length);
const passRate = rows.filter(row => row.passed).length / rows.length;
console.log(JSON.stringify({
  benchmarkVersion: "1.4.3",
  engineVersion: engine.version,
  componentCount: engine.componentCount,
  corpusCases: corpus.length,
  passRate: Number((passRate * 100).toFixed(1)),
  averageVideoWords: Math.round(avgVideoWords),
  targetVideoWords: "about 120–150; pace and idea complexity vary",
  genericPhraseHits: rows.reduce((sum, row) => sum + row.genericPhraseHits, 0),
  cases: rows
}, null, 2));
console.log("Quality benchmark passed: selected idea terms, format structures, component family selection, and boilerplate checks passed.");
