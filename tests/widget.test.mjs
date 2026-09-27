import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Window } from "happy-dom";

const root = new URL("../extension/", import.meta.url);
const files = ["src/platforms.js", "src/extractor.js", "src/format.js", "src/archive.js", "content/widget.js"];
const sources = await Promise.all(files.map((file) => readFile(new URL(file, root), "utf8")));

test("mounts one isolated widget on a supported chat and survives reinjection", async () => {
  const window = new Window({ url: "https://gemini.google.com/app/test" });
  window.document.write('<!doctype html><main><user-query id="u1"><p>Hello</p></user-query><model-response id="a1"><p>Hi</p></model-response></main><input-area-v2></input-area-v2>');
  window.document.close();
  window.document.documentElement.style.backgroundColor = "rgb(255, 255, 255)";
  window.document.body.style.backgroundColor = "transparent";
  window.chrome = {
    storage: {
      local: { get: async () => ({ settingsV2: { language: "en", defaultFormat: "md", includeUser: true, includeAssistant: true, includeMetadata: true, includeUrl: false, defaultScanMode: "quick" } }) },
      onChanged: { addListener: () => {} }
    },
    runtime: { getURL: (path) => `chrome-extension://test/${path}`, getManifest: () => ({ version: "test" }), sendMessage: () => {}, onMessage: { addListener: () => {} } }
  };
  for (const source of sources) window.eval(source);
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(window.document.querySelectorAll("#chat-exporter-widget-host").length, 1);
  assert.equal(window.document.getElementById("chat-exporter-widget-host").dataset.ceTheme, "light");
  assert.equal(window.document.getElementById("chat-exporter-widget-host").style.top, "72px");
  assert.doesNotMatch(sources.at(-1), /extraction\?\.model|class: "ce-head"/);
  assert.match(sources.at(-1), /class: "ce-status"/);
  assert.match(sources.at(-1), /getURL\("icons\/icon48\.png"\)/);
  assert.doesNotMatch(sources.at(-1), /getURL\(adapter\.icon\)/);
  assert.match(sources.at(-1), /data-ce-theme/);
  assert.match(sources.at(-1), /filenameTitle/);
  assert.match(sources.at(-1), /event\.composedPath\(\)\.includes\(host\)/);
  assert.match(sources.at(-1), /action: "opened"/);
  assert.match(sources.at(-1), /scheduleThemeSync/);
  assert.match(sources.at(-1), /capturePanelChoices/);
  window.eval(sources.at(-1));
  assert.equal(window.document.querySelectorAll("#chat-exporter-widget-host").length, 1);
  window.close();
});

test("places the action outside the composer and lets the user hide it", async () => {
  const window = new Window({ url: "https://chatgpt.com/c/layout" });
  window.document.write('<!doctype html><div data-message-author-role="user">Hello</div><div data-message-author-role="assistant">Hi</div><form data-type="unified-composer"><textarea></textarea></form>');
  window.document.close();
  Object.defineProperty(window, "innerWidth", { value: 1000 });
  Object.defineProperty(window, "innerHeight", { value: 800 });
  const composer = window.document.querySelector("form");
  let composerTop = 600;
  let composerHeight = 80;
  let triggerResize;
  composer.getBoundingClientRect = () => ({ left: 100, right: 900, top: composerTop, bottom: composerTop + composerHeight, width: 800, height: composerHeight });
  window.ResizeObserver = class {
    constructor(callback) { triggerResize = callback; }
    observe() {}
    disconnect() {}
  };
  const attachShadow = window.HTMLElement.prototype.attachShadow;
  window.HTMLElement.prototype.attachShadow = function (options) { return attachShadow.call(this, { ...options, mode: "open" }); };
  const saved = [];
  window.chrome = {
    storage: {
      local: { get: async () => ({ settingsV2: { language: "en", enabledSites: { chatgpt: true } } }), set: async (value) => { saved.push(value); } },
      onChanged: { addListener: () => {} }
    },
    runtime: { getURL: (path) => `chrome-extension://test/${path}`, sendMessage: async () => ({ ok: true }), onMessage: { addListener: () => {} } }
  };
  for (const source of sources) window.eval(source);
  await new Promise((resolve) => setTimeout(resolve, 130));
  const host = window.document.getElementById("chat-exporter-widget-host");
  assert.ok(Number.parseFloat(host.style.left) >= 910, "the button sits outside the typing area");
  assert.ok(Number.parseFloat(host.style.top) + 42 - Number.parseFloat(host.style.getPropertyValue("--ce-panel-offset")) <= 590, "the open panel also stays above the composer");
  composerTop = 550;
  composerHeight = 130;
  triggerResize();
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.ok(Number.parseFloat(host.style.left) >= 910, "a growing composer cannot be covered by the button");
  assert.ok(Number.parseFloat(host.style.top) + 42 - Number.parseFloat(host.style.getPropertyValue("--ce-panel-offset")) <= 540, "the panel follows the composer as it grows");
  host.shadowRoot.querySelector(".ce-button").click();
  await new Promise((resolve) => setTimeout(resolve, 20));
  host.shadowRoot.querySelector(".ce-hide").click();
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.ok(saved.some((value) => value.settingsV2?.enabledSites?.chatgpt === false));
  assert.equal(window.document.getElementById("chat-exporter-widget-host"), null);
  window.close();
});
