import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Window } from "happy-dom";

const root = new URL("../extension/", import.meta.url);
const html = await readFile(new URL("popup.html", root), "utf8");
const sources = await Promise.all(["src/platforms.js", "src/i18n.js", "src/format.js", "src/archive.js", "popup.js"].map((file) => readFile(new URL(file, root), "utf8")));

test("opens export first, promotes the widget once, and defaults every site on", async () => {
  const window = new Window({ url: "chrome-extension://test/popup.html" });
  window.document.write(html); window.document.close();
  const listeners = { added: [], removed: [], messages: [] };
  const saved = [];
  window.chrome = {
    storage: { local: { get: async () => ({ settingsV2: "invalid", language: "unexpected" }), set: async (value) => { saved.push(value); } } },
    tabs: { query: async () => [{ id: 1, url: "https://gemini.google.com/app/test" }], sendMessage: async (tabId, message) => { listeners.messages.push({ tabId, message }); } },
    scripting: {
      executeScript: async (request) => request.func
        ? (request.func(...(request.args || [])), [{ result: null }])
        : [{ result: { ok: true, adapter: "gemini", platform: "Gemini", supportStatus: "supported", title: "Test chat", model: "", messages: [{ role: "user", text: "Hello" }, { role: "assistant", text: "Hi" }], completeness: "loaded", warnings: ["quick"], scanMode: "quick" } }]
    },
    permissions: {
      contains: async () => false, request: async () => true, remove: async () => true,
      onAdded: { addListener: (listener) => listeners.added.push(listener) }, onRemoved: { addListener: (listener) => listeners.removed.push(listener) }
    },
    runtime: { sendMessage: async () => ({ ok: true }), getManifest: () => ({ version: "test" }), onMessage: { addListener: (listener) => listeners.messages.push({ listener }) } }
  };
  for (const source of sources.slice(0, -1)) window.eval(source);
  const initializing = window.eval(sources.at(-1));
  window.document.getElementById("settings-button").click();
  assert.equal(window.document.getElementById("settings-view").hidden, false, "settings opens immediately while extraction initializes");
  await initializing;
  assert.equal(window.document.getElementById("result-view").hidden, false);
  assert.equal(window.document.documentElement.lang, "en");
  assert.ok(listeners.messages.some(({ message }) => message?.action === "close"));
  assert.match(window.document.getElementById("platform-icon").getAttribute("src"), /gemini\.png$/);
  assert.equal(window.document.getElementById("widget-tip").hidden, false);
  assert.equal(window.document.getElementById("warning").hidden, false);
  window.document.getElementById("widget-tip-dismiss").click();
  window.document.getElementById("warning-dismiss").click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(window.document.getElementById("widget-tip").hidden, true);
  assert.equal(window.document.getElementById("warning").hidden, true);
  assert.ok(saved.some((value) => value.settingsV2?.dismissedWidgetTip === true));
  assert.ok(saved.some((value) => value.settingsV2?.dismissedQuickWarning === true));
  window.document.getElementById("settings-button").click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(window.document.getElementById("settings-view").hidden, false);
  assert.equal(window.document.querySelectorAll(".platform-setting").length, 6);
  assert.ok([...window.document.querySelectorAll(".platform-setting input")].every((input) => input.checked));
  assert.equal(window.document.getElementById("lang-button"), null);
  window.close();
});

test("popup supports live system theme changes and themed service logos", async () => {
  const css = await readFile(new URL("popup.css", root), "utf8");
  const popup = sources.at(-1);
  assert.match(css, /prefers-color-scheme:\s*dark/);
  assert.match(popup, /platform\?\.iconDark/);
  assert.match(popup, /darkMode\.addEventListener/);
  assert.match(popup, /chatExporterWidget/);
  assert.match(popup, /window\.addEventListener\("blur"/);
});
