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
