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
    assert.equal(result.supportStatus, "supported");
    assert.equal(result.completeness, "loaded");
    assert.equal(result.scanMode, "quick");
    assert.equal(result.messages.length, 2);
    assert.deepEqual(Array.from(result.messages, (message) => String(message.role)), ["user", "assistant"]);
  });
}

test("Claude export omits thinking UI and hidden duplicate text but keeps the answer", async () => {
  const html = '<!doctype html><title>QA - Claude</title><main>' +
    '<section data-testid="human-turn"><p>Give a source</p></section>' +
    '<section data-testid="assistant-message" data-is-streaming="false">' +
    '<div data-cds="TurnStatus" data-testid="TurnStatus" data-step-key="thinking-0"><span>Weighing the response</span><span class="sr-only">Weighing the response</span></div>' +
    '<div style="display:none">Weighing the response</div>' +
    '<div class="prose"><p>Final answer: <a href="https://example.com/source">Source</a>.</p></div>' +
    '</section></main>';
  const window = new Window({ url: "https://claude.ai/chat/qa" });
  window.document.write(html); window.document.close();
  window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms); const result = await window.eval(extractor);
  assert.equal(result.messages.length, 2);
  assert.equal(result.messages[1].text, "Final answer: [Source](https://example.com/source).");
  window.close();
});

test("preserves code and tables while removing unsafe link protocols", async () => {
  const result = await extractFixture("chatgpt", "https://chatgpt.com/c/test");
  assert.match(result.messages[1].text, /```js/);
  assert.match(result.messages[1].text, /\| Gate \| Status \|/);
});

test("extracts current ChatGPT search-unit markup without duplicate speaker headings", async () => {
  const html = '<!doctype html><title>Current ChatGPT</title><main>' +
    '<div data-chatgpt-search-unit-key="fallback-turn-0:0:user" data-chatgpt-search-message-ids="user-1"><div>Same question</div><button>Copy</button></div>' +
    '<div data-chatgpt-search-unit-key="fallback-turn-0:2:assistant" data-chatgpt-search-message-ids="assistant-1 assistant-1"><h4 class="sr-only">ChatGPT said:</h4><div><p>First answer</p><a href="https://example.org/source">Source</a></div></div>' +
    '<div data-chatgpt-search-unit-key="fallback-turn-1:0:user" data-chatgpt-search-message-ids="user-2"><div>Same question</div></div>' +
    '<div data-chatgpt-search-unit-key="fallback-turn-1:2:assistant" data-chatgpt-search-message-ids="assistant-2 assistant-2"><h4 class="sr-only">ChatGPT said:</h4><div><p>Second answer</p></div></div>' +
    '</main>';
  const window = new Window({ url: "https://chatgpt.com/c/current" });
  window.document.write(html); window.document.close();
  window.__CHAT_EXPORTER_MODE__ = "quick"; window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms); const result = await window.eval(extractor);
  assert.equal(result.ok, true);
  assert.deepEqual(Array.from(result.messages, (message) => message.role), ["user", "assistant", "user", "assistant"]);
  assert.deepEqual(Array.from(result.messages, (message) => message.turnId), ["data-chatgpt-search-message-ids:user-1", "data-chatgpt-search-message-ids:assistant-1", "data-chatgpt-search-message-ids:user-2", "data-chatgpt-search-message-ids:assistant-2"]);
  assert.deepEqual(Array.from(result.messages, (message) => message.text.includes("Same question")), [true, false, true, false]);
  assert.match(result.messages[1].text, /\[Source\]\(https:\/\/example\.org\/source\)/);
  assert.doesNotMatch(result.messages[1].text, /ChatGPT said/);
  window.close();
});

test("extracts anonymous ChatGPT transcript turns with repeated prompts", async () => {
  const html = '<!doctype html><title>Anonymous ChatGPT</title><ol data-conversation-transcript>' +
    '<li id="user-1" data-message-role="user"><h4 data-message-attribution>You said:</h4><div><button data-user-message-bubble><p>Same question</p></button></div></li>' +
    '<li id="assistant-1" data-message-role="assistant"><h4 data-message-attribution>ChatGPT said:</h4><div><p>First answer</p></div><div data-assistant-message-actions><button>Copy</button></div></li>' +
    '<li id="user-2" data-message-role="user"><h4 data-message-attribution>You said:</h4><div><button data-user-message-bubble><p>Same question</p></button></div></li>' +
    '<li id="assistant-2" data-message-role="assistant"><h4 data-message-attribution>ChatGPT said:</h4><div><p>Second answer</p></div></li>' +
    '</ol>';
  const window = new Window({ url: "https://chatgpt.com/uc/test" });
  window.document.write(html); window.document.close();
  window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms); const result = await window.eval(extractor);
  assert.equal(result.ok, true);
  assert.deepEqual(Array.from(result.messages, (message) => [message.role, message.text]), [
    ["user", "Same question"], ["assistant", "First answer"],
    ["user", "Same question"], ["assistant", "Second answer"]
  ]);
  assert.deepEqual(Array.from(result.messages, (message) => message.turnId), [
    "id:user-1", "id:assistant-1", "id:user-2", "id:assistant-2"
  ]);
  window.close();
});

test("includes research links that are shown as citation icons", async () => {
  const window = new Window({ url: "https://chatgpt.com/c/sources" });
  window.document.write('<!doctype html><title>Research - ChatGPT</title><div data-message-author-role="user">Find a study</div><div data-message-author-role="assistant">Read the paper <a href="https://example.org/paper/7" aria-label="Research source"><svg></svg></a><a href="javascript:alert(1)">unsafe</a><table><tr><th>Source</th></tr><tr><td><a href="https://example.org/table-source">Study</a></td></tr></table></div>');
  window.document.close(); window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms); const result = await window.eval(extractor);
  assert.match(result.messages[1].text, /\[Research source\]\(https:\/\/example\.org\/paper\/7\)/);
  assert.match(result.messages[1].text, /\[Study\]\(https:\/\/example\.org\/table-source\)/);
  assert.doesNotMatch(result.messages[1].text, /javascript:/);
  window.close();
});

test("accepts an explicit full-history scan mode", async () => {
  const result = await extractFixture("chatgpt", "https://chatgpt.com/c/test", "full");
  assert.equal(result.ok, true);
  assert.equal(result.scanMode, "full");
});

test("full scan waits for delayed earlier turns and both stable scroll boundaries", async () => {
  const window = new Window({ url: "https://chatgpt.com/c/long" });
  window.document.write('<!doctype html><title>Long</title><div id="scroll" style="overflow-y:auto"><div data-message-author-role="user" data-message-id="u2">Later question</div><div data-message-author-role="assistant" data-message-id="a2">Later answer</div></div>');
  window.document.close();
  const container = window.document.getElementById("scroll");
  let top = 300;
  let inserted = false;
  Object.defineProperty(container, "clientHeight", { value: 100 });
  Object.defineProperty(container, "scrollHeight", { value: 400 });
  Object.defineProperty(container, "scrollTop", { get: () => top, set: (value) => { top = value; } });
  container.scrollTo = ({ top: value }) => {
    top = value;
    if (value === 0 && !inserted) {
      inserted = true;
      setTimeout(() => {
        container.innerHTML = '<div data-message-author-role="user" data-message-id="u1">Earlier question</div><div data-message-author-role="assistant" data-message-id="a1">Earlier answer</div>' + container.innerHTML;
      }, 1200);
    }
  };
  window.__CHAT_EXPORTER_MODE__ = "full";
  window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms);
  const result = await window.eval(extractor);
  assert.equal(result.completeness, "complete");
  assert.deepEqual(Array.from(result.messages, (message) => message.text), ["Earlier question", "Earlier answer", "Later question", "Later answer"]);
  window.close();
});

test("an active streamed answer cannot be marked complete", async () => {
  const window = new Window({ url: "https://chatgpt.com/c/stream" });
  window.document.write('<!doctype html><title>Streaming</title><div data-message-author-role="user">Question</div><div data-message-author-role="assistant" data-is-streaming="true">Still writing</div>');
  window.document.close(); window.__CHAT_EXPORTER_MODE__ = "full"; window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms);
  const result = await window.eval(extractor);
  assert.equal(result.completeness, "partial");
  assert.equal(result.partialReason, "start_not_verified");
  window.close();
});

test("a rebuilt virtual window without stable overlap is reported as partial", async () => {
  const window = new Window({ url: "https://chatgpt.com/c/virtual" });
  window.document.write('<!doctype html><title>Virtual</title><div id="scroll" style="overflow-y:auto"><div data-message-author-role="user">First</div><div data-message-author-role="assistant">Second</div></div>');
  window.document.close();
  const container = window.document.getElementById("scroll");
  let top = 0;
  let rebuilt = false;
  Object.defineProperty(container, "clientHeight", { value: 100 });
  Object.defineProperty(container, "scrollHeight", { value: 300 });
  Object.defineProperty(container, "scrollTop", { get: () => top, set: (value) => { top = value; } });
  container.scrollTo = ({ top: value }) => {
    top = value;
    if (value >= 120 && !rebuilt) {
      rebuilt = true;
      container.innerHTML = '<div data-message-author-role="assistant">Second</div><div data-message-author-role="user">Third</div>';
    }
  };
  window.__CHAT_EXPORTER_MODE__ = "full"; window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms);
  const result = await window.eval(extractor);
  assert.equal(result.completeness, "partial");
  assert.equal(result.partialReason, "merge_not_verified");
  window.close();
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

test("ignores current Gemini screen-reader headings that duplicate visible messages", async () => {
  const html = '<!doctype html><title>Simple Math QA Test - Google Gemini</title>' +
    '<user-query><h5 class="cdk-visually-hidden screen-reader-user-query-label">You said QA test: What is 2 + 2?</h5><span class="user-query-container"><p>QA test: What is 2 + 2?</p></span></user-query>' +
    '<model-response><h6 class="cdk-visually-hidden screen-reader-model-response-label">Gemini said</h6><div><p>2 + 2 equals 4.</p></div></model-response>';
  const window = new Window({ url: "https://gemini.google.com/app/current" });
  window.document.write(html); window.document.close();
  window.__CHAT_EXPORTER_MODE__ = "quick"; window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms); const result = await window.eval(extractor);
  assert.deepEqual(Array.from(result.messages, (message) => message.text), ["QA test: What is 2 + 2?", "2 + 2 equals 4."]);
  window.close();
});

test("excludes Gemini generation status from the assistant answer", async () => {
  const html = '<!doctype html><title>Test - Google Gemini</title>' +
    '<user-query><p>What is 5 + 6?</p></user-query>' +
    '<model-response><div><p>5 + 6 equals 11.</p></div>' +
    '<div class="response-footer"><response-info-line role="status"><span>You stopped this response</span></response-info-line></div></model-response>';
  const window = new Window({ url: "https://gemini.google.com/app/current" });
  window.document.write(html); window.document.close();
  window.__CHAT_EXPORTER_MODE__ = "quick"; window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms); const result = await window.eval(extractor);
  assert.deepEqual(Array.from(result.messages, (message) => message.text), ["What is 5 + 6?", "5 + 6 equals 11."]);
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

test("separates current Perplexity user bubbles from answer renderers", async () => {
  const html = '<!doctype html><title>QA - Perplexity</title><main>' +
    '<div class="group/user-bubble"><div data-renderer="lm"><p>Same question</p></div></div>' +
    '<div data-renderer="lm" class="prose"><p>First answer</p></div>' +
    '<div class="group/user-bubble"><div data-renderer="lm"><p>Same question</p></div></div>' +
    '<div data-renderer="lm" class="prose"><p>Second answer</p></div>' +
    '</main>';
  const window = new Window({ url: "https://www.perplexity.ai/search/current" });
  window.document.write(html); window.document.close();
  window.__CHAT_EXPORTER_MODE__ = "quick"; window.__CHAT_EXPORTER_RUN_ON_LOAD__ = true;
  window.eval(platforms); const result = await window.eval(extractor);
  assert.deepEqual(Array.from(result.messages, (message) => message.role), ["user", "assistant", "user", "assistant"]);
  assert.deepEqual(Array.from(result.messages, (message) => message.text), ["Same question", "First answer", "Same question", "Second answer"]);
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
  const sameNodeOverlap = merge([{ role: "user", text: "same", turnId: "node:1" }], [{ role: "user", text: "same", turnId: "node:1" }, { role: "assistant", text: "next", turnId: "node:2" }]);
  assert.deepEqual(Array.from(sameNodeOverlap, (message) => message.turnId), ["node:1", "node:2"]);
  const legitimateRepeat = merge([{ role: "user", text: "same", turnId: "node:1" }], [{ role: "user", text: "same", turnId: "node:2" }, { role: "assistant", text: "next", turnId: "node:3" }]);
  assert.deepEqual(Array.from(legitimateRepeat, (message) => message.turnId), ["node:1", "node:2", "node:3"]);
  const rebuiltTwoTurnOverlap = merge(
    [{ role: "user", text: "a", turnId: "node:1" }, { role: "assistant", text: "b", turnId: "node:2" }],
    [{ role: "user", text: "a", turnId: "node:3" }, { role: "assistant", text: "b", turnId: "node:4" }, { role: "user", text: "c", turnId: "node:5" }]
  );
  assert.deepEqual(Array.from(rebuiltTwoTurnOverlap, (message) => message.text), ["a", "b", "c"]);
  const rebuiltFullWindow = merge(
    [{ role: "user", text: "a", turnId: "node:1" }, { role: "assistant", text: "b", turnId: "node:2" }, { role: "user", text: "c", turnId: "node:3" }],
    [{ role: "user", text: "a", turnId: "node:4" }, { role: "assistant", text: "b", turnId: "node:5" }, { role: "user", text: "c", turnId: "node:6" }, { role: "assistant", text: "d", turnId: "node:7" }]
  );
  assert.deepEqual(Array.from(rebuiltFullWindow, (message) => message.text), ["a", "b", "c", "d"]);
  window.close();
});
