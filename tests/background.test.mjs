import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../extension/", import.meta.url);
const platformSource = await readFile(new URL("src/platforms.js", root), "utf8");
const backgroundSource = await readFile(new URL("background.js", root), "utf8");

test("registers the in-chat widget for every service on a clean install", async () => {
  const listeners = {};
  const registrations = [];
  const removed = [];
  const stored = [];
  const chrome = {
    storage: { local: { get: async () => ({}), set: async (value) => { stored.push(value); } } },
    scripting: {
      getRegisteredContentScripts: async () => [{ id: "chat-exporter-widget-mistral" }],
      registerContentScripts: async (definitions) => { registrations.push(...definitions); },
      updateContentScripts: async () => {},
      unregisterContentScripts: async ({ ids }) => { removed.push(...ids); }
    },
    runtime: {
      onInstalled: { addListener: (listener) => { listeners.installed = listener; } },
      onStartup: { addListener: (listener) => { listeners.startup = listener; } },
      onMessage: { addListener: (listener) => { listeners.message = listener; } }
    }
  };
  const context = vm.createContext({ chrome, console });
  vm.runInContext(platformSource, context);
  vm.runInContext(backgroundSource, context);
  await listeners.installed();

  assert.equal(registrations.length, 6);
  assert.deepEqual(registrations.map((item) => item.id), [
    "chat-exporter-widget-chatgpt", "chat-exporter-widget-claude", "chat-exporter-widget-gemini",
    "chat-exporter-widget-copilot", "chat-exporter-widget-perplexity", "chat-exporter-widget-grok"
  ]);
  assert.ok(registrations.find((item) => item.id.endsWith("perplexity")).matches.includes("https://www.perplexity.ai/*"));
  assert.deepEqual(removed, ["chat-exporter-widget-mistral"]);
  assert.ok(Object.values(stored.at(-1).settingsV2.enabledSites).every(Boolean));
});

test("isolates a failed site registration and normalizes corrupt settings", async () => {
  const listeners = {};
  const registrations = [];
  const stored = [];
  const chrome = {
    storage: { local: { get: async () => ({ settingsV2: "invalid", language: "unexpected" }), set: async (value) => { stored.push(value); } } },
    scripting: {
      getRegisteredContentScripts: async () => [],
      registerContentScripts: async ([definition]) => {
        if (definition.id.endsWith("chatgpt")) throw new Error("permission denied");
        registrations.push(definition);
      },
      updateContentScripts: async () => {}, unregisterContentScripts: async () => {}
    },
    runtime: {
      onInstalled: { addListener: (listener) => { listeners.installed = listener; } },
      onStartup: { addListener: () => {} }, onMessage: { addListener: () => {} }
    }
  };
  const context = vm.createContext({ chrome, console: { warn: () => {} } });
  vm.runInContext(platformSource, context); vm.runInContext(backgroundSource, context);
  await listeners.installed();
  assert.equal(registrations.length, 5);
  assert.equal(stored.at(-1).settingsV2.language, "en");
  assert.equal(stored.at(-1).settingsV2.defaultFormat, "md");
});
