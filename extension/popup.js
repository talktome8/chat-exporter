(async function initializePopup() {
  "use strict";

  const elements = {
    loading: document.getElementById("loading-view"),
    result: document.getElementById("result-view"),
    empty: document.getElementById("empty-view"),
    settings: document.getElementById("settings-view"),
    progress: document.getElementById("progress-bar"),
    loadingTitle: document.querySelector('[data-i18n="loadingTitle"]'),
    loadingBody: document.querySelector('[data-i18n="loadingBody"]'),
    cancel: document.getElementById("cancel-button"),
    retry: document.getElementById("retry-button"),
    scan: document.getElementById("scan-button"),
    download: document.getElementById("download-button"),
    copy: document.getElementById("copy-button"),
    settingsButton: document.getElementById("settings-button"),
    settingsBack: document.getElementById("settings-back"),
    platformIcon: document.getElementById("platform-icon"),
    platform: document.getElementById("platform-name"),
    title: document.getElementById("conversation-title"),
    model: document.getElementById("model-name"),
    beta: document.getElementById("beta-badge"),
    completeness: document.getElementById("completeness-badge"),
    warning: document.getElementById("warning"),
    warningText: document.getElementById("warning-text"),
    warningDismiss: document.getElementById("warning-dismiss"),
    widgetTip: document.getElementById("widget-tip"),
    widgetTipDismiss: document.getElementById("widget-tip-dismiss"),
    userCount: document.getElementById("user-count"),
    assistantCount: document.getElementById("assistant-count"),
    emptyTitle: document.getElementById("empty-title"),
    emptyBody: document.getElementById("empty-body"),
    toast: document.getElementById("toast")
  };

  let language = "en";
  let settings = null;
  let activeTab = null;
  let extraction = null;
  let scanToken = 0;
  let progressTimer = null;
  let toastTimer = null;
  let nativeDialogOpen = false;
  let previousView = "loading";
  const darkMode = window.matchMedia("(prefers-color-scheme: dark)");

  function platformIcon(platform) {
    return darkMode.matches && platform?.iconDark ? platform.iconDark : (platform?.icon || "icons/icon48.png");
  }

  function dictionary() {
    return I18N[language] || I18N.en;
  }

  function translate(key) {
    return dictionary()[key] || I18N.en[key] || key;
  }

  function applyLanguage(nextLanguage) {
    language = nextLanguage === "he" ? "he" : "en";
    document.documentElement.lang = language;
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (key && translate(key)) node.textContent = translate(key);
    });
    elements.settingsButton.setAttribute("aria-label", translate("settings"));
    if (extraction) renderResult(extraction);
  }

  async function loadSettings() {
    try {
      const stored = await chrome.storage.local.get(["settingsV2", "language"]);
      const storedSettings = stored.settingsV2 && typeof stored.settingsV2 === "object" && !Array.isArray(stored.settingsV2) ? stored.settingsV2 : {};
      const enabledSites = Object.fromEntries(ChatExporterPlatforms.platforms.map((platform) => [
        platform.id,
        storedSettings.enabledSites?.[platform.id] !== false
      ]));
      settings = {
        language: (storedSettings.language || stored.language) === "he" ? "he" : "en",
        enabledSites,
        defaultFormat: storedSettings.defaultFormat === "txt" ? "txt" : "md",
        includeUser: storedSettings.includeUser !== false,
        includeAssistant: storedSettings.includeAssistant !== false,
        includeMetadata: storedSettings.includeMetadata !== false,
        includeUrl: storedSettings.includeUrl === true,
        defaultScanMode: storedSettings.defaultScanMode === "full" ? "full" : "quick",
        dismissedQuickWarning: storedSettings.dismissedQuickWarning === true,
        dismissedWidgetTip: storedSettings.dismissedWidgetTip === true
      };
      applyLanguage(settings.language);
      applySettingsToControls();
      await renderPlatformSettings();
    } catch {
      settings = { language: "en", enabledSites: Object.fromEntries(ChatExporterPlatforms.platforms.map((platform) => [platform.id, true])), defaultFormat: "md", includeUser: true, includeAssistant: true, includeMetadata: true, includeUrl: false, defaultScanMode: "quick", dismissedQuickWarning: false, dismissedWidgetTip: false };
      applyLanguage("en");
    }
  }

  async function saveSettings() {
    settings.language = language;
    await chrome.storage.local.set({ settingsV2: settings, language });
  }

  function applySettingsToControls() {
    document.querySelector(`input[name="language"][value="${settings.language}"]`).checked = true;
    document.getElementById("setting-include-user").checked = settings.includeUser;
    document.getElementById("setting-include-assistant").checked = settings.includeAssistant;
    document.getElementById("setting-include-meta").checked = settings.includeMetadata;
    document.getElementById("setting-include-url").checked = settings.includeUrl;
    document.getElementById("setting-format").value = settings.defaultFormat;
    document.getElementById("setting-scan").value = settings.defaultScanMode;
    document.getElementById("include-user").checked = settings.includeUser;
    document.getElementById("include-assistant").checked = settings.includeAssistant;
    document.getElementById("include-meta").checked = settings.includeMetadata;
    document.getElementById("include-url").checked = settings.includeUrl;
    const format = document.querySelector(`input[name="format"][value="${settings.defaultFormat}"]`);
    if (format) format.checked = true;
  }

  async function renderPlatformSettings() {
    const container = document.getElementById("platform-settings");
    container.replaceChildren();
    for (const platform of ChatExporterPlatforms.platforms) {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = settings.enabledSites[platform.id] !== false;
      input.addEventListener("change", async () => {
        settings.enabledSites[platform.id] = input.checked;
        await saveSettings();
        await chrome.runtime.sendMessage({ type: "syncWidgetRegistrations" });
      });
      const image = document.createElement("img");
      image.src = platformIcon(platform);
      image.alt = "";
      const name = document.createElement("strong");
      name.textContent = platform.name;
      const row = document.createElement("label");
      row.className = "platform-setting";
      row.append(image, name);
      if (platform.status === "beta") {
        const beta = document.createElement("small");
        beta.textContent = translate("beta");
        row.append(beta);
      }
      row.append(input);
      container.append(row);
    }
  }

  async function readSettingsControls() {
    settings.includeUser = document.getElementById("setting-include-user").checked;
    settings.includeAssistant = document.getElementById("setting-include-assistant").checked;
    settings.includeMetadata = document.getElementById("setting-include-meta").checked;
    settings.includeUrl = document.getElementById("setting-include-url").checked;
    settings.defaultFormat = document.getElementById("setting-format").value === "txt" ? "txt" : "md";
    settings.defaultScanMode = document.getElementById("setting-scan").value === "full" ? "full" : "quick";
    await saveSettings();
  }

  function showOnly(view) {
    if (view !== "settings") previousView = view;
    elements.loading.hidden = view !== "loading";
    elements.result.hidden = view !== "result";
    elements.empty.hidden = view !== "empty";
    elements.settings.hidden = view !== "settings";
  }

  function startProgress() {
    let progress = 14;
    elements.progress.style.width = `${progress}%`;
    clearInterval(progressTimer);
    progressTimer = setInterval(() => {
      progress = Math.min(91, progress + Math.max(1, (92 - progress) * 0.08));
      elements.progress.style.width = `${progress}%`;
    }, 260);
  }

  function finishProgress() {
    clearInterval(progressTimer);
    progressTimer = null;
    elements.progress.style.width = "100%";
  }

  async function cancelActiveExtraction() {
    scanToken += 1;
    finishProgress();
    if (activeTab?.id) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: () => { globalThis.__CHAT_EXPORTER_CANCEL__ = true; }
        });
      } catch {
        // Restricted pages cannot receive the cancellation flag.
      }
    }
    showEmpty("cancelled", "cancelledBody");
  }

  async function scanConversation(mode = "quick") {
    const token = ++scanToken;
    extraction = null;
    showOnly("loading");
    elements.loadingTitle.textContent = translate(mode === "full" ? "loadingTitle" : "quickLoadingTitle");
    elements.loadingBody.textContent = translate(mode === "full" ? "loadingBody" : "quickLoadingBody");
    elements.cancel.hidden = mode !== "full";
    startProgress();

    try {
      [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab?.id || !/^https?:/i.test(activeTab.url || "")) {
        throw new Error("access_error");
      }

      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: (requestedMode) => { globalThis.__CHAT_EXPORTER_MODE__ = requestedMode; globalThis.__CHAT_EXPORTER_RUN_ON_LOAD__ = true; },
        args: [mode]
      });

      const injected = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ["src/platforms.js", "src/extractor.js"]
      });
      if (token !== scanToken) return;

      finishProgress();
      const result = injected?.[0]?.result;
      if (!result?.ok) {
        if (result?.code === "cancelled") showEmpty("cancelled", "cancelledBody");
        else if (result?.code === "unsupported") showEmpty("noConversation", "noConversationBody");
        else showEmpty("genericError", "genericErrorBody");
        return;
      }

      extraction = result;
      renderResult(result);
      showOnly("result");
    } catch (error) {
      if (token !== scanToken) return;
      finishProgress();
      const restricted = error?.message === "access_error" || /cannot access|permission|chrome:\/\/|edge:\/\//i.test(String(error?.message));
      showEmpty(restricted ? "accessError" : "genericError", restricted ? "accessErrorBody" : "genericErrorBody");
    }
  }

  async function closeInChatWidget() {
    try {
      if (!activeTab?.id) {
        [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      }
      if (!activeTab?.id) return;
      await chrome.tabs.sendMessage(activeTab.id, { type: "chatExporterWidget", action: "close" });
    } catch {
      // The widget is optional and may not be registered on this page.
    }
  }

  function showEmpty(titleKey, bodyKey) {
    elements.emptyTitle.textContent = translate(titleKey);
    elements.emptyBody.textContent = translate(bodyKey);
    showOnly("empty");
  }

  function renderResult(result) {
    elements.platform.textContent = result.platform || "AI chat";
    const adapter = ChatExporterPlatforms.platforms.find((platform) => platform.id === result.adapter);
    elements.platformIcon.src = platformIcon(adapter);
    elements.title.textContent = result.title || `${result.platform || "AI"} conversation`;
    elements.model.textContent = result.model || "";
    elements.model.hidden = !result.model;
    elements.beta.hidden = result.supportStatus !== "beta";

    const completeness = ["complete", "partial", "loaded"].includes(result.completeness) ? result.completeness : "loaded";
    const badgeState = completeness;
    elements.completeness.className = `completeness-badge ${badgeState}`;
    elements.completeness.textContent = translate(badgeState);

    const messages = result.messages || [];
    elements.userCount.textContent = String(messages.filter((message) => message.role === "user").length);
    elements.assistantCount.textContent = String(messages.filter((message) => message.role === "assistant").length);

    const warningKeys = [];
    if (result.warnings?.includes("partial")) warningKeys.push("partialWarning");
    if (result.warnings?.includes("quick") && !settings.dismissedQuickWarning) warningKeys.push("quickWarning");
    if (result.warnings?.includes("beta")) warningKeys.push("betaWarning");
    if (result.warnings?.includes("fallback")) warningKeys.push("fallbackWarning");
    elements.warningText.textContent = warningKeys.map(translate).join(" ");
    elements.warning.hidden = warningKeys.length === 0;
    elements.warningDismiss.hidden = !warningKeys.includes("quickWarning");
    elements.widgetTip.hidden = settings.dismissedWidgetTip;
    elements.scan.textContent = result.scanMode === "quick" && completeness !== "complete"
      ? translate("checkFull")
      : translate("scanAgain");
  }

  function selectedFormat() {
    return document.querySelector('input[name="format"]:checked')?.value === "txt" ? "txt" : "md";
  }

  function exportOptions() {
    return {
      extraction,
      includeUser: document.getElementById("include-user").checked,
      includeAssistant: document.getElementById("include-assistant").checked,
      includeMeta: document.getElementById("include-meta").checked,
      includeUrl: document.getElementById("include-url").checked,
      currentUrl: activeTab?.url || "",
      format: selectedFormat(),
      language,
      date: new Date()
    };
  }

  function buildContent() {
    return ChatExporterFormat.buildContent(exportOptions());
  }

  function showToast(key) {
    clearTimeout(toastTimer);
    elements.toast.textContent = translate(key);
    elements.toast.hidden = false;
    toastTimer = setTimeout(() => { elements.toast.hidden = true; }, 2200);
  }

  function confirmUser(message) {
    nativeDialogOpen = true;
    try { return window.confirm(message); }
    finally { nativeDialogOpen = false; }
  }

  async function downloadExport() {
    try {
      const confirmPartial = extraction?.completeness !== "partial" || confirmUser(translate("partialConfirm"));
      if (!confirmPartial) return;
      const pack = await ChatExporterArchive.createExportPackage({ ...exportOptions(), confirmPartial });
      const url = URL.createObjectURL(pack.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = pack.filename;
      anchor.hidden = true;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast("downloaded");
    } catch (error) {
      showToast(error?.message === "empty_selection" ? "emptySelection" : "genericError");
    }
  }

  async function copyExport() {
    try {
      if (extraction?.completeness === "partial" && !confirmUser(translate("partialConfirm"))) return;
      await navigator.clipboard.writeText(buildContent());
      showToast("copied");
    } catch (error) {
      showToast(error?.message === "empty_selection" ? "emptySelection" : "genericError");
    }
  }

  elements.settingsButton.addEventListener("click", async () => {
    await renderPlatformSettings();
    showOnly("settings");
  });
  elements.settingsBack.addEventListener("click", async () => {
    if (!extraction) await scanConversation(settings.defaultScanMode);
    else showOnly(previousView === "settings" ? "result" : previousView);
  });
  document.querySelectorAll('input[name="language"]').forEach((input) => input.addEventListener("change", async () => {
    if (!input.checked) return;
    applyLanguage(input.value);
    settings.language = language;
    await saveSettings();
    await renderPlatformSettings();
  }));
  ["setting-include-user", "setting-include-assistant", "setting-include-meta", "setting-include-url", "setting-format", "setting-scan"].forEach((id) => {
    document.getElementById(id).addEventListener("change", readSettingsControls);
  });
  elements.cancel.addEventListener("click", cancelActiveExtraction);
  elements.retry.addEventListener("click", () => scanConversation("quick"));
  elements.scan.addEventListener("click", () => {
    const mode = extraction?.scanMode === "quick" && extraction?.completeness !== "complete" ? "full" : (extraction?.scanMode || "quick");
    scanConversation(mode);
  });
  elements.download.addEventListener("click", downloadExport);
  elements.copy.addEventListener("click", copyExport);
  elements.warningDismiss.addEventListener("click", async () => {
    settings.dismissedQuickWarning = true;
    await saveSettings();
    if (extraction) renderResult(extraction);
  });
  elements.widgetTipDismiss.addEventListener("click", async () => {
    settings.dismissedWidgetTip = true;
    await saveSettings();
    elements.widgetTip.hidden = true;
  });

  darkMode.addEventListener?.("change", async () => {
    if (extraction) renderResult(extraction);
    if (!elements.settings.hidden) await renderPlatformSettings();
  });

  chrome.runtime.onMessage?.addListener((message) => {
    if (message?.type === "chatExporterWidget" && message.action === "opened") window.close();
  });
  window.addEventListener("blur", () => { if (!nativeDialogOpen) window.close(); });
  document.addEventListener("visibilitychange", () => {
    if (!nativeDialogOpen && document.visibilityState === "hidden") window.close();
  });

  await loadSettings();
  await closeInChatWidget();
  await scanConversation(settings.defaultScanMode);
})();
