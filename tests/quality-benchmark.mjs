import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import assert from "node:assert/strict";

const engineSource = readFileSync(new URL("../content-engine.js", import.meta.url), "utf8");
const corpus = JSON.parse(readFileSync(new URL("./quality-corpus.json", import.meta.url), "utf8"));
const window = {};
runInNewContext(engineSource, { window, globalThis: window });
const engine = window.TTVContentEngine;
assert.ok(engine, "content engine must expose TTVContentEngine");

const requiredSections = {
  video: ["For example"],
  story: ["THE SITUATION", "THE TENSION", "THE TURNING POINT", "THE LESSON"],
  lesson: ["LEARNING GOAL", "EXPLAIN", "DEMONSTRATE", "PRACTISE", "CHECK UNDERSTANDING"],
  mini: ["LESSON 1", "LESSON 2", "LESSON 3", "FINAL PROJECT"],
  course: ["LESSON 1", "LESSON 6", "FINAL PROJECT", "CHECK FOR UNDERSTANDING"],
  caption: ["#ThoughtToVideo"]
};
const rows = [];
for (const item of corpus) {
  const format = item.format === "caption" ? "video" : item.format;
  const result = item.format === "caption"
    ? { script: engine.caption(item.thought), caption: engine.caption(item.thought) }
    : engine.generate({ thought: item.thought, format, tone: "helpful" });
  const text = result.script || "";
  const lower = text.toLowerCase();
  const missingIdeaTerms = item.mustContain.filter(term => !lower.includes(term.toLowerCase()));
  const missingSections = (requiredSections[item.format] || []).filter(section => !text.toLowerCase().includes(section.toLowerCase()));
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const genericLines = ["A thought worth sharing", "What’s your take?", "Demonstrate the lesson using an ordinary, realistic situation."];
  const genericPhraseHits = genericLines.filter(phrase => lower.includes(phrase.toLowerCase())).length;
  const passed = text.length > 40 && missingIdeaTerms.length === 0 && missingSections.length === 0;
  rows.push({ id: item.id, format: item.format, words, passed, missingIdeaTerms, missingSections, genericPhraseHits });
  assert.ok(text.length > 40, item.id + ": output is too short");
  assert.deepEqual(missingIdeaTerms, [], item.id + ": output lost required concepts from the user's idea");
  assert.deepEqual(missingSections, [], item.id + ": required format structure is missing");
}
const videoRows = rows.filter(row => row.format === "video");
const avgVideoWords = videoRows.reduce((sum, row) => sum + row.words, 0) / Math.max(1, videoRows.length);
const passRate = rows.filter(row => row.passed).length / rows.length;
console.log(JSON.stringify({
  benchmarkVersion: "1.0.0",
  engineVersion: engine.version,
  componentCount: engine.componentCount,
  corpusCases: corpus.length,
  passRate: Number((passRate * 100).toFixed(1)),
  averageVideoWords: Math.round(avgVideoWords),
  targetVideoWords: "about 120–150; pace and idea complexity vary",
  genericPhraseHits: rows.reduce((sum, row) => sum + row.genericPhraseHits, 0),
  cases: rows
}, null, 2));
console.log("Quality benchmark passed: required idea terms and format structures retained for all corpus cases.");
