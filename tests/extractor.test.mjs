import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Window } from "happy-dom";

const platforms = await readFile(new URL("../extension/src/platforms.js", import.meta.url), "utf8");
const extractor = await readFile(new URL("../extension/src/extractor.js", import.meta.url), "utf8");
const cases = [
  ["chatgpt", "https://chatgpt.com/c/test", "ChatGPT"],
  ["claude", "https://claude.ai/chat/test", "Claude"],
  ["gemini", "https://gemini.google.com/app/test", "Gemini"],
  ["copilot", "https://copilot.microsoft.com/chats/test", "Copilot"],
  ["perplexity", "https://www.perplexity.ai/search/test", "Perplexity"],
  ["grok", "https://grok.com/c/test", "Grok"],
  ["mistral", "https://chat.mistral.ai/chat/test", "Mistral"]
];

async function extractFixture(name, url, mode = "quick") {
  const html = await readFile(new URL(`fixtures/${name}.html`, import.meta.url), "utf8");
  const window = new Window({ url });
  window.document.write(html);
  window.document.close();
  window.__CHAT_EXPORTER_MODE__ = mode;
  window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms);
  const result = await window.eval(extractor);
  window.close();
  return result;
}

for (const [name, url, platform] of cases) {
  test(`extracts the anonymized ${platform} fixture`, async () => {
    const result = await extractFixture(name, url);
    assert.equal(result.ok, true);
    assert.equal(result.platform, platform);
    assert.equal(result.supportStatus, ["Grok", "Mistral"].includes(platform) ? "beta" : "supported");
    assert.equal(result.completeness, "loaded");
    assert.equal(result.scanMode, "quick");
    assert.equal(result.messages.length, 2);
    assert.deepEqual(Array.from(result.messages, (message) => String(message.role)), ["user", "assistant"]);
  });
}

test("marks beta adapters for manual review without changing message order", async () => {
  const result = await extractFixture("grok", "https://grok.com/c/test");
  assert.deepEqual(Array.from(result.messages, (message) => [String(message.role), String(message.text)]), [
    ["user", "Export this Grok test."],
    ["assistant", "The export stays local."]
  ]);
  assert.deepEqual(Array.from(result.warnings, String), ["quick", "beta"]);
});

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

test("uses progress-based scan termination instead of fixed step timeouts", async () => {
  assert.doesNotMatch(extractor, /(?:BACKWARD|FORWARD)_STEP_LIMIT/);
  assert.match(extractor, /NO_PROGRESS_LIMIT/);
  assert.match(extractor, /STABLE_PASSES_REQUIRED/);
});

test("removes Gemini speaker labels from exported message text", async () => {
  const html = '<!doctype html><title>Test</title><user-query><p>You said</p><p>Hello</p></user-query><model-response><p>Gemini said</p><p>Hi</p></model-response>';
  const window = new Window({ url: "https://gemini.google.com/app/test" });
  window.document.write(html);
  window.document.close();
  window.__CHAT_EXPORTER_MODE__ = "quick";
  window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms);
  const result = await window.eval(extractor);
  assert.equal(result.messages[0].text, "Hello");
  assert.equal(result.messages[1].text, "Hi");
  window.close();
});

test("uses a stable ancestor id for services that identify the full turn", async () => {
  const html = '<!doctype html><title>Test</title><div id="turn-123"><user-query><p>Hello</p></user-query><model-response><p>Hi</p></model-response></div>';
  const window = new Window({ url: "https://gemini.google.com/app/test" });
  window.document.write(html); window.document.close(); window.__CHAT_EXPORTER_MODE__ = "quick"; window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms); const result = await window.eval(extractor);
  assert.equal(result.messages[0].turnId, "id:turn-123");
  assert.equal(result.messages[1].turnId, "id:turn-123");
  window.close();
});

test("keeps Hebrew content intact", async () => {
  const result = await extractFixture("gemini", "https://gemini.google.com/app/test");
  assert.match(result.messages[0].text, /ייצא את השיחה/);
});

test("keeps legitimately repeated messages while collapsing overlapping selectors", async () => {
  const html = '<!doctype html><title>Repeat - Gemini</title><user-query id="u1" class="user-query"><p>Repeat me</p></user-query><model-response id="a1" class="model-response"><p>Done</p></model-response><user-query id="u2" class="user-query"><p>Repeat me</p></user-query><model-response id="a2" class="model-response"><p>Done again</p></model-response>';
  const window = new Window({ url: "https://gemini.google.com/app/test" });
  window.document.write(html); window.document.close();
  window.__CHAT_EXPORTER_MODE__ = "quick"; window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms);
  const result = await window.eval(extractor);
  assert.deepEqual(Array.from(result.messages, (message) => String(message.text)), ["Repeat me", "Done", "Repeat me", "Done again"]);
  window.close();
});

test("does not repeat the platform name as a Gemini model", async () => {
  const html = '<!doctype html><title>Model - Gemini</title><button data-test-id="model-picker">Gemini</button><user-query><p>Hello</p></user-query><model-response><p>Hi</p></model-response>';
  const window = new Window({ url: "https://gemini.google.com/app/test" });
  window.document.write(html); window.document.close();
  window.__CHAT_EXPORTER_MODE__ = "quick"; window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms);
  const result = await window.eval(extractor);
  assert.equal(result.model, "");
  window.close();
});

test("detects current ChatGPT and Gemini model indicators", async () => {
  const chatWindow = new Window({ url: "https://chatgpt.com/c/test" });
  chatWindow.document.write('<!doctype html><title>Model</title><div data-message-author-role="user">Hello</div><div data-message-author-role="assistant" data-message-model-slug="gpt-5-5">Hi</div>');
  chatWindow.document.close(); chatWindow.__CHAT_EXPORTER_MODE__ = "quick"; chatWindow.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  chatWindow.eval(platforms); const chatResult = await chatWindow.eval(extractor);
  assert.equal(chatResult.model, "GPT-5.5"); chatWindow.close();

  const geminiWindow = new Window({ url: "https://gemini.google.com/app/test" });
  geminiWindow.document.write('<!doctype html><title>Model</title><button aria-label="Open mode picker, currently Flash">Flash</button><user-query>Hello</user-query><model-response>Hi</model-response>');
  geminiWindow.document.close(); geminiWindow.__CHAT_EXPORTER_MODE__ = "quick"; geminiWindow.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  geminiWindow.eval(platforms); const geminiResult = await geminiWindow.eval(extractor);
  assert.equal(geminiResult.model, "Flash"); geminiWindow.close();
});

test("extracts repeated turns from the current Perplexity structure", async () => {
  const html = '<!doctype html><title>QA - Perplexity</title><main><section role="tabpanel"><div class="group/query">Repeat me</div><div data-renderer="lm">First answer</div></section><section role="tabpanel"><div class="group/query">Repeat me</div><div data-renderer="lm">Second answer</div></section><div contenteditable="true" role="textbox"></div></main>';
  const window = new Window({ url: "https://www.perplexity.ai/search/test" });
  window.document.write(html); window.document.close(); window.__CHAT_EXPORTER_MODE__ = "quick"; window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms); const result = await window.eval(extractor);
  assert.deepEqual(Array.from(result.messages, (message) => String(message.text)), ["Repeat me", "First answer", "Repeat me", "Second answer"]);
  window.close();
});

test("merges overlapping windows without dropping repeated turns with stable ids", () => {
  const window = new Window({ url: "https://chatgpt.com/c/test" });
  window.eval(platforms); window.eval(extractor);
  const merge = window.ChatExporterExtractor.mergeMessageWindows;
  const first = [{ role: "user", text: "same", turnId: "1" }, { role: "assistant", text: "answer", turnId: "2" }];
  const second = [{ role: "assistant", text: "answer", turnId: "2" }, { role: "user", text: "same", turnId: "3" }];
  const merged = merge(first, second);
  assert.deepEqual(Array.from(merged, (message) => message.turnId), ["1", "2", "3"]);
  window.close();
});
