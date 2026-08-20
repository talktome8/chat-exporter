"use strict";

if (!globalThis.ChatExporterPlatforms && typeof importScripts === "function") importScripts("src/platforms.js");

const WIDGET_FILES = ["src/platforms.js", "src/extractor.js", "src/format.js", "src/archive.js", "content/widget.js"];
const DEFAULT_SETTINGS = {
  language: "en",
  enabledSites: Object.fromEntries(ChatExporterPlatforms.platforms.map((platform) => [platform.id, true])),
  defaultFormat: "md",
  includeUser: true,
  includeAssistant: true,
  includeMetadata: true,
  includeUrl: false,
  defaultScanMode: "quick",
  dismissedQuickWarning: false,
  dismissedWidgetTip: false
};

async function loadSettings() {
  const stored = await chrome.storage.local.get(["settingsV2", "language"]);
  const storedSettings = stored.settingsV2 || {};
  const enabledSites = Object.fromEntries(ChatExporterPlatforms.platforms.map((platform) => [
    platform.id,
    storedSettings.enabledSites?.[platform.id] !== false
  ]));
  return {
    ...DEFAULT_SETTINGS,
    ...storedSettings,
    language: storedSettings.language || stored.language || "en",
    enabledSites
  };
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ settingsV2: settings, language: settings.language });
}

async function syncWidgetRegistrations() {
  const settings = await loadSettings();
  const registered = await chrome.scripting.getRegisteredContentScripts();
  const registeredIds = new Set(registered.map((script) => script.id));

  for (const platform of ChatExporterPlatforms.platforms) {
    const id = `chat-exporter-widget-${platform.id}`;
    const enabled = settings.enabledSites[platform.id] !== false;
    const definition = {
        id,
        matches: ChatExporterPlatforms.origins(platform),
        js: WIDGET_FILES,
        runAt: "document_idle",
        persistAcrossSessions: true
      };
    if (enabled && !registeredIds.has(id)) {
      await chrome.scripting.registerContentScripts([definition]);
    } else if (enabled) {
      await chrome.scripting.updateContentScripts([definition]);
    } else if (!enabled && registeredIds.has(id)) {
      await chrome.scripting.unregisterContentScripts({ ids: [id] });
    }
  }
  return settings;
}

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await loadSettings();
  await saveSettings(settings);
  await syncWidgetRegistrations();
});

chrome.runtime.onStartup.addListener(() => { syncWidgetRegistrations().catch(() => {}); });

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "syncWidgetRegistrations") return false;
  syncWidgetRegistrations().then((settings) => sendResponse({ ok: true, settings })).catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
  return true;
});
