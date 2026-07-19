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

async function extractFixture(name, url, mode = "quick") {
  const html = await readFile(new URL(`fixtures/${name}.html`, import.meta.url), "utf8");
  const window = new Window({ url });
  window.document.write(html);
  window.document.close();
  window.__CHAT_EXPORTER_MODE__ = mode;
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
    assert.equal(result.scanMode, "quick");
    assert.equal(result.messages.length, 2);
    assert.deepEqual(Array.from(result.messages, (message) => String(message.role)), ["user", "assistant"]);
  });
}

test("preserves code and tables while removing unsafe link protocols", async () => {
  const result = await extractFixture("chatgpt", "https://chatgpt.com/c/test");
  assert.match(result.messages[1].text, /```js/);
  assert.match(result.messages[1].text, /\| Gate \| Status \|/);
});

test("accepts an explicit full-history scan mode", async () => {
  const result = await extractFixture("chatgpt", "https://chatgpt.com/c/test", "full");
  assert.equal(result.ok, true);
  assert.equal(result.scanMode, "full");
});

test("removes Gemini speaker labels from exported message text", async () => {
  const html = '<!doctype html><title>Test</title><user-query><p>You said</p><p>Hello</p></user-query><model-response><p>Gemini said</p><p>Hi</p></model-response>';
  const window = new Window({ url: "https://gemini.google.com/app/test" });
  window.document.write(html);
  window.document.close();
  window.__CHAT_EXPORTER_MODE__ = "quick";
  const result = await window.eval(extractor);
  assert.equal(result.messages[0].text, "Hello");
  assert.equal(result.messages[1].text, "Hi");
  window.close();
});

test("keeps Hebrew content intact", async () => {
  const result = await extractFixture("gemini", "https://gemini.google.com/app/test");
  assert.match(result.messages[0].text, /ייצא את השיחה/);
});
