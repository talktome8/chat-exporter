import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../extension/src/format.js", import.meta.url), "utf8");
const context = vm.createContext({ Intl, Date });
vm.runInContext(source, context);
const { buildContent, safeFilename, stripMarkdown } = context.ChatExporterFormat;
const extraction = {
  platform: "ChatGPT",
  title: "Launch / review",
  model: "GPT-5",
  completeness: "complete",
  messages: [
    { role: "user", text: "שלום **עולם**" },
    { role: "assistant", text: "```js\nconsole.log('ok')\n```\n\n| A | B |\n| --- | --- |\n| 1 | 2 |" }
  ]
};

test("builds stable Markdown with metadata and mixed-direction content", () => {
  const result = buildContent({ extraction, includeUser: true, includeAssistant: true, includeMeta: true, includeUrl: true, currentUrl: "https://chatgpt.com/c/example", format: "md", language: "en", date: new Date("2026-07-19T12:00:00Z") });
  assert.match(result, /^# Launch \/ review/m);
  assert.match(result, /שלום \*\*עולם\*\*/);
  assert.match(result, /```js/);
  assert.match(result, /https:\/\/chatgpt\.com\/c\/example/);
});

test("plain text strips common Markdown", () => {
  const result = buildContent({ extraction, includeUser: false, includeAssistant: true, includeMeta: false, includeUrl: false, currentUrl: "", format: "txt", language: "he", date: new Date("2026-07-19T12:00:00Z") });
  assert.doesNotMatch(result, /```|\*\*|^##/m);
  assert.match(result, /console\.log/);
  assert.match(result, /\[עוזר\]/);
});

test("rejects an empty role selection and sanitizes filenames", () => {
  assert.throws(() => buildContent({ extraction, includeUser: false, includeAssistant: false, includeMeta: false, includeUrl: false, currentUrl: "", format: "md", language: "en" }), /empty_selection/);
  assert.equal(safeFilename('Launch: review / "final"?'), "Launch-review-final");
  assert.equal(stripMarkdown("**Bold** and [link](https://example.com)"), "Bold and link");
});
