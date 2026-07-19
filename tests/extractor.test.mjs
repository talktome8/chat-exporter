import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Window } from "happy-dom";

const extractor = await readFile(new URL("../extension/src/extractor.js", import.meta.url), "utf8");
const cases = [
  ["chatgpt", "https://chatgpt.com/c/test", "ChatGPT"],
  ["claude", "https://claude.ai/chat/test", "Claude"],
  ["gemini", "https://gemini.google.com/app/test", "Gemini"],
  ["copilot", "https://copilot.microsoft.com/chats/test", "Copilot"],
  ["perplexity", "https://www.perplexity.ai/search/test", "Perplexity"]
];

async function extractFixture(name, url) {
  const html = await readFile(new URL(`fixtures/${name}.html`, import.meta.url), "utf8");
  const window = new Window({ url });
  window.document.write(html);
  window.document.close();
  const result = await window.eval(extractor);
  window.close();
  return result;
}

for (const [name, url, platform] of cases) {
  test(`extracts the anonymized ${platform} fixture`, async () => {
    const result = await extractFixture(name, url);
    assert.equal(result.ok, true);
    assert.equal(result.platform, platform);
    assert.equal(result.supportStatus, "supported");
    assert.equal(result.completeness, "complete");
    assert.equal(result.messages.length, 2);
    assert.deepEqual(Array.from(result.messages, (message) => String(message.role)), ["user", "assistant"]);
  });
}

test("preserves code and tables while removing unsafe link protocols", async () => {
  const result = await extractFixture("chatgpt", "https://chatgpt.com/c/test");
  assert.match(result.messages[1].text, /```js/);
  assert.match(result.messages[1].text, /\| Gate \| Status \|/);
});

test("keeps Hebrew content intact", async () => {
  const result = await extractFixture("gemini", "https://gemini.google.com/app/test");
  assert.match(result.messages[0].text, /ייצא את השיחה/);
});
