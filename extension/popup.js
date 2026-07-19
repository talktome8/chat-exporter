(async function initializePopup() {
  "use strict";

  const elements = {
    loading: document.getElementById("loading-view"),
    result: document.getElementById("result-view"),
    empty: document.getElementById("empty-view"),
    progress: document.getElementById("progress-bar"),
    loadingTitle: document.querySelector('[data-i18n="loadingTitle"]'),
    loadingBody: document.querySelector('[data-i18n="loadingBody"]'),
    cancel: document.getElementById("cancel-button"),
    retry: document.getElementById("retry-button"),
    scan: document.getElementById("scan-button"),
    download: document.getElementById("download-button"),
    copy: document.getElementById("copy-button"),
    language: document.getElementById("lang-button"),
    platform: document.getElementById("platform-name"),
    title: document.getElementById("conversation-title"),
    model: document.getElementById("model-name"),
    beta: document.getElementById("beta-badge"),
    completeness: document.getElementById("completeness-badge"),
    warning: document.getElementById("warning"),
    userCount: document.getElementById("user-count"),
    assistantCount: document.getElementById("assistant-count"),
    emptyTitle: document.getElementById("empty-title"),
    emptyBody: document.getElementById("empty-body"),
    toast: document.getElementById("toast")
  };

  let language = "en";
  let activeTab = null;
  let extraction = null;
  let scanToken = 0;
  let progressTimer = null;
  let toastTimer = null;

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
    elements.language.textContent = language === "he" ? "EN" : "עב";
    elements.language.setAttribute("aria-label", language === "he" ? "Switch to English" : "מעבר לעברית");
    if (extraction) renderResult(extraction);
  }

  async function loadLanguage() {
    try {
      const stored = await chrome.storage.local.get("language");
      applyLanguage(stored.language || "en");
    } catch {
      applyLanguage("en");
    }
  }

  function showOnly(view) {
    elements.loading.hidden = view !== "loading";
    elements.result.hidden = view !== "result";
    elements.empty.hidden = view !== "empty";
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
    showEmpty("cancelled", "noConversationBody");
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
        func: (requestedMode) => { globalThis.__CHAT_EXPORTER_MODE__ = requestedMode; },
        args: [mode]
      });

      const injected = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ["src/extractor.js"]
      });
      if (token !== scanToken) return;

      finishProgress();
      const result = injected?.[0]?.result;
      if (!result?.ok) {
        if (result?.code === "cancelled") showEmpty("cancelled", "noConversationBody");
        else if (result?.code === "unsupported") showEmpty("noConversation", "noConversationBody");
        else showEmpty("genericError", "noConversationBody");
        return;
      }

      extraction = result;
      renderResult(result);
      showOnly("result");
    } catch (error) {
      if (token !== scanToken) return;
      finishProgress();
      const restricted = error?.message === "access_error" || /cannot access|permission|chrome:\/\/|edge:\/\//i.test(String(error?.message));
      showEmpty(restricted ? "accessError" : "genericError", "noConversationBody");
    }
  }

  function showEmpty(titleKey, bodyKey) {
    elements.emptyTitle.textContent = translate(titleKey);
    elements.emptyBody.textContent = translate(bodyKey);
    showOnly("empty");
  }

  function renderResult(result) {
    elements.platform.textContent = result.platform || "AI chat";
    elements.title.textContent = result.title || `${result.platform || "AI"} conversation`;
    elements.model.textContent = result.model || "";
    elements.model.hidden = !result.model;
    elements.beta.hidden = result.supportStatus !== "beta";

    const completeness = ["complete", "partial"].includes(result.completeness) ? result.completeness : "unknown";
    elements.completeness.className = `completeness-badge ${completeness}`;
    elements.completeness.textContent = translate(completeness);

    const messages = result.messages || [];
    elements.userCount.textContent = String(messages.filter((message) => message.role === "user").length);
    elements.assistantCount.textContent = String(messages.filter((message) => message.role === "assistant").length);

    const warningKeys = [];
    if (result.warnings?.includes("partial")) warningKeys.push("partialWarning");
    if (result.warnings?.includes("quick")) warningKeys.push("quickWarning");
    if (result.warnings?.includes("beta")) warningKeys.push("betaWarning");
    if (result.warnings?.includes("fallback")) warningKeys.push("fallbackWarning");
    elements.warning.textContent = warningKeys.map(translate).join(" ");
    elements.warning.hidden = warningKeys.length === 0;
    elements.scan.textContent = result.scanMode === "quick" && completeness !== "complete"
      ? translate("checkFull")
      : translate("scanAgain");
  }

  function selectedFormat() {
    return document.querySelector('input[name="format"]:checked')?.value === "txt" ? "txt" : "md";
  }

  function buildContent() {
    return ChatExporterFormat.buildContent({
      extraction,
      includeUser: document.getElementById("include-user").checked,
      includeAssistant: document.getElementById("include-assistant").checked,
      includeMeta: document.getElementById("include-meta").checked,
      includeUrl: document.getElementById("include-url").checked,
      currentUrl: activeTab?.url || "",
      format: selectedFormat(),
      language
    });
  }

  function dateSlug() {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }

  function showToast(key) {
    clearTimeout(toastTimer);
    elements.toast.textContent = translate(key);
    elements.toast.hidden = false;
    toastTimer = setTimeout(() => { elements.toast.hidden = true; }, 2200);
  }

  function downloadExport() {
    try {
      const content = buildContent();
      const format = selectedFormat();
      const blob = new Blob(["\uFEFF", content], { type: format === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${ChatExporterFormat.safeFilename(extraction.title)}-${dateSlug()}.${format}`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast("downloaded");
    } catch (error) {
      showToast(error?.message === "empty_selection" ? "emptySelection" : "genericError");
    }
  }

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(buildContent());
      showToast("copied");
    } catch (error) {
      showToast(error?.message === "empty_selection" ? "emptySelection" : "genericError");
    }
  }

  elements.language.addEventListener("click", async () => {
    const next = language === "en" ? "he" : "en";
    applyLanguage(next);
    try { await chrome.storage.local.set({ language: next }); } catch { /* Preference remains session-only. */ }
  });
  elements.cancel.addEventListener("click", cancelActiveExtraction);
  elements.retry.addEventListener("click", () => scanConversation("quick"));
  elements.scan.addEventListener("click", () => {
    const mode = extraction?.scanMode === "quick" && extraction?.completeness !== "complete" ? "full" : (extraction?.scanMode || "quick");
    scanConversation(mode);
  });
  elements.download.addEventListener("click", downloadExport);
  elements.copy.addEventListener("click", copyExport);

  await loadLanguage();
  await scanConversation("quick");
})();
