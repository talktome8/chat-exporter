(function mountChatExporterWidget(global) {
  "use strict";

  if (global.__CHAT_EXPORTER_WIDGET__) return;
  global.__CHAT_EXPORTER_WIDGET__ = true;

  const adapter = global.ChatExporterPlatforms?.select(location.hostname);
  if (!adapter || adapter.id === "generic") return;

  const copy = {
    en: { export: "Export chat", scan: "Verify full chat", resume: "Resume full scan", cancel: "Cancel", download: "Download", copy: "Copy", user: "User messages", assistant: "AI responses", meta: "Title, model & date", url: "Conversation URL", loaded: "Loaded", complete: "Complete", partial: "Partial", scanning: "Scanning conversation…", copied: "Copied", partialConfirm: "The full conversation could not be verified. Download a clearly marked partial export?" },
    he: { export: "ייצוא שיחה", scan: "אימות שיחה מלאה", resume: "המשך סריקה מלאה", cancel: "ביטול", download: "הורדה", copy: "העתקה", user: "הודעות משתמש", assistant: "תגובות AI", meta: "כותרת, מודל ותאריך", url: "כתובת השיחה", loaded: "נטען", complete: "מלא", partial: "חלקי", scanning: "סורק את השיחה…", copied: "הועתק", partialConfirm: "לא ניתן היה לאמת את מלוא השיחה. להוריד ייצוא חלקי שמסומן בבירור?" }
  };

  let settings;
  let extraction = null;
  let scanning = false;
  let progressCount = 0;
  let route = location.href;
  let observer;
  let positionTimer;
  let themeTimer;
  let panelChoices = null;
  const systemTheme = global.matchMedia?.("(prefers-color-scheme: dark)");

  function text() { return copy[settings?.language === "he" ? "he" : "en"]; }
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else if (value !== undefined) node.setAttribute(key, value);
    }
    for (const child of children) node.append(child);
    return node;
  }

  async function loadSettings() {
    const stored = await chrome.storage.local.get(["settingsV2", "language"]);
    const saved = stored.settingsV2 && typeof stored.settingsV2 === "object" && !Array.isArray(stored.settingsV2) ? stored.settingsV2 : {};
    settings = {
      language: (saved.language || stored.language) === "he" ? "he" : "en",
      defaultFormat: saved.defaultFormat === "txt" ? "txt" : "md",
      includeUser: saved.includeUser !== false,
      includeAssistant: saved.includeAssistant !== false,
      includeMetadata: saved.includeMetadata !== false,
      includeUrl: saved.includeUrl === true,
      defaultScanMode: saved.defaultScanMode === "full" ? "full" : "quick",
      enabled: saved.enabledSites?.[adapter.id] !== false
    };
  }

  function detectTheme() {
    const root = document.documentElement;
    const body = document.body;
    const signal = [
      root?.getAttribute("data-theme"), root?.getAttribute("data-color-mode"), root?.getAttribute("data-mode"),
      root?.className, body?.getAttribute("data-theme"), body?.className, root?.style?.colorScheme
    ].filter(Boolean).join(" ").toLowerCase();
    if (/(^|\s|[-_:])dark(\s|$|[-_:])/.test(signal)) return "dark";
    if (/(^|\s|[-_:])light(\s|$|[-_:])/.test(signal)) return "light";
    for (const node of [body, root]) {
      const background = global.getComputedStyle?.(node)?.backgroundColor || "";
      const rgb = background.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/i);
      if (!rgb || (rgb[4] !== undefined && Number(rgb[4]) === 0)) continue;
      const luminance = (Number(rgb[1]) * 299 + Number(rgb[2]) * 587 + Number(rgb[3]) * 114) / 1000;
      if (luminance < 90) return "dark";
      if (luminance > 190) return "light";
    }
    return systemTheme?.matches ? "dark" : "light";
  }

  function syncTheme() { host.dataset.ceTheme = detectTheme(); }
  function scheduleThemeSync() {
    clearTimeout(themeTimer);
    themeTimer = setTimeout(syncTheme, 100);
  }

  const host = el("div", { id: "chat-exporter-widget-host" });
  Object.assign(host.style, { position: "fixed", right: "24px", bottom: "24px", zIndex: "2147483646", direction: "ltr" });
  const shadow = host.attachShadow({ mode: "closed" });
  const style = el("style", { text: `
    :host{all:initial;--ce-bg:#fff;--ce-elevated:#fff;--ce-panel:#f8fafc;--ce-ink:#101828;--ce-muted:#667085;--ce-line:#dfe3e8;--ce-line-soft:#eef0f2;--ce-secondary:#344054;--ce-shadow:rgba(16,24,40,.22)}
    :host([data-ce-theme="dark"]){--ce-bg:#151719;--ce-elevated:#202326;--ce-panel:#1b1e21;--ce-ink:#f5f7fa;--ce-muted:#aab2bd;--ce-line:#3a4047;--ce-line-soft:#2c3137;--ce-secondary:#e5e9ef;--ce-shadow:rgba(0,0,0,.5)}
    *{box-sizing:border-box}.ce-button,.ce-panel{font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
    .ce-button{display:grid;width:42px;height:42px;padding:0;place-items:center;border:1px solid ${adapter.accent};border-radius:13px;background:var(--ce-elevated);box-shadow:0 10px 30px var(--ce-shadow);cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}
    .ce-button:hover{transform:translateY(-1px);box-shadow:0 13px 34px var(--ce-shadow)}.ce-button img{width:27px;height:27px;border-radius:7px}.ce-panel{position:absolute;right:0;bottom:50px;width:320px;max-height:min(560px,calc(100vh - 90px));overflow:auto;border:1px solid var(--ce-line);border-radius:15px;background:var(--ce-bg);color:var(--ce-ink);box-shadow:0 22px 60px var(--ce-shadow)}
    .ce-status{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid var(--ce-line-soft);background:var(--ce-panel)}.ce-badge{flex:none;padding:3px 7px;border-radius:99px;background:var(--ce-line-soft);color:var(--ce-muted);font-size:10px;font-weight:700}.ce-badge.complete{background:#153b2b;color:#69dda7}.ce-badge.partial{background:#493715;color:#ffd37a}
    :host([data-ce-theme="light"]) .ce-badge.complete{background:#e8f7ef;color:#067647}:host([data-ce-theme="light"]) .ce-badge.partial{background:#fff4d6;color:#9a5b00}
    .ce-progress{color:var(--ce-muted);font-size:11px}.ce-options{display:grid;gap:7px;padding:12px 14px}.ce-options label{display:flex;align-items:center;gap:7px}.ce-options input{accent-color:${adapter.accent}}.ce-format{display:grid;grid-template-columns:1fr 1fr;gap:6px}.ce-actions{display:grid;grid-template-columns:1.25fr 1fr;gap:7px;padding:0 14px 8px}.ce-actions button,.ce-scan{min-height:35px;border-radius:8px;font-weight:750;cursor:pointer}.ce-primary{border:1px solid ${adapter.accent};background:${adapter.accent};color:#fff}.ce-secondary{border:1px solid var(--ce-line);background:var(--ce-elevated);color:var(--ce-secondary)}.ce-scan{display:block;width:calc(100% - 28px);margin:0 14px 13px;border:0;background:var(--ce-panel);color:var(--ce-muted)}.ce-toast{padding:0 14px 12px;color:#38b980;font-size:11px}[hidden]{display:none!important}
    @media(prefers-reduced-motion:reduce){.ce-button{transition:none}}
  ` });
  const icon = chrome.runtime.getURL("icons/icon48.png");
  const toggle = el("button", { class: "ce-button", type: "button", "aria-label": "Chat Exporter" }, [el("img", { src: icon, alt: "" })]);
  const panel = el("section", { class: "ce-panel", hidden: "" });
  shadow.append(style, toggle, panel);
  document.documentElement.append(host);
  syncTheme();

  function option(id, label, checked) {
    return el("label", {}, [el("input", { id: `ce-${id}`, type: "checkbox", ...(checked ? { checked: "" } : {}) }), document.createTextNode(label)]);
  }

  function currentOptions() {
    return {
      extraction,
      filenameTitle: extraction?.filenameTitle || extraction?.title || "conversation",
      includeUser: shadow.getElementById("ce-user")?.checked ?? settings.includeUser,
      includeAssistant: shadow.getElementById("ce-assistant")?.checked ?? settings.includeAssistant,
      includeMeta: shadow.getElementById("ce-meta")?.checked ?? settings.includeMetadata,
      includeUrl: shadow.getElementById("ce-url")?.checked ?? settings.includeUrl,
      currentUrl: location.href,
      format: shadow.getElementById("ce-txt")?.checked ? "txt" : "md",
      language: settings.language,
      date: new Date()
    };
  }

  function capturePanelChoices() {
    if (!shadow.getElementById("ce-user")) return;
    panelChoices = {
      includeUser: shadow.getElementById("ce-user").checked,
      includeAssistant: shadow.getElementById("ce-assistant").checked,
      includeMetadata: shadow.getElementById("ce-meta").checked,
      includeUrl: shadow.getElementById("ce-url").checked,
      format: shadow.getElementById("ce-txt")?.checked ? "txt" : "md"
    };
  }

  function render() {
    capturePanelChoices();
    const t = text();
    panel.replaceChildren();
    panel.dir = settings.language === "he" ? "rtl" : "ltr";
    const badgeState = extraction?.completeness || "loaded";
    const counts = extraction?.messages || [];
    const progress = el("div", { class: "ce-progress", text: scanning ? `${t.scanning} ${progressCount}` : `${counts.filter((message) => message.role === "user").length} ${t.user} · ${counts.filter((message) => message.role === "assistant").length} ${t.assistant}` });
    const status = el("div", { class: "ce-status" }, [progress, el("span", { class: `ce-badge ${badgeState}`, text: t[badgeState] || t.loaded })]);
    const options = el("div", { class: "ce-options" }, [
      option("user", t.user, panelChoices?.includeUser ?? settings.includeUser), option("assistant", t.assistant, panelChoices?.includeAssistant ?? settings.includeAssistant), option("meta", t.meta, panelChoices?.includeMetadata ?? settings.includeMetadata), option("url", t.url, panelChoices?.includeUrl ?? settings.includeUrl),
      el("div", { class: "ce-format" }, [
        el("label", {}, [el("input", { id: "ce-md", type: "radio", name: "ce-format", value: "md", ...((panelChoices?.format || settings.defaultFormat) !== "txt" ? { checked: "" } : {}) }), document.createTextNode("Markdown")]),
        el("label", {}, [el("input", { id: "ce-txt", type: "radio", name: "ce-format", value: "txt", ...((panelChoices?.format || settings.defaultFormat) === "txt" ? { checked: "" } : {}) }), document.createTextNode("Text")])
      ])
    ]);
    const download = el("button", { class: "ce-primary", type: "button", text: t.download, onclick: downloadExport });
    const copyButton = el("button", { class: "ce-secondary", type: "button", text: t.copy, onclick: copyExport });
    download.disabled = copyButton.disabled = scanning || !extraction;
    const actions = el("div", { class: "ce-actions" }, [download, copyButton]);
    const scan = el("button", { class: "ce-scan", type: "button", text: scanning ? t.cancel : extraction?.completeness === "partial" ? t.resume : t.scan, onclick: () => scanning ? cancelScan() : scanConversation("full") });
    const toast = el("div", { class: "ce-toast", hidden: "" });
    panel.append(status, options, actions, scan, toast);
  }

  async function scanConversation(mode) {
    scanning = true;
    progressCount = 0;
    global.__CHAT_EXPORTER_PROGRESS__ = (progress) => { progressCount = progress.messageCount || 0; render(); };
    render();
    extraction = await global.ChatExporterExtractor.run(mode);
    delete global.__CHAT_EXPORTER_PROGRESS__;
    scanning = false;
    if (!extraction?.ok) extraction = null;
    render();
  }

  function cancelScan() { global.__CHAT_EXPORTER_CANCEL__ = true; }

  function toast(message) {
    const node = panel.querySelector(".ce-toast");
    if (!node) return;
    node.textContent = message; node.hidden = false;
    setTimeout(() => { node.hidden = true; }, 2200);
  }

  async function downloadExport() {
    const t = text();
    const confirmPartial = extraction.completeness !== "partial" || global.confirm(t.partialConfirm);
    if (!confirmPartial) return;
    const pack = await global.ChatExporterArchive.createExportPackage({ ...currentOptions(), confirmPartial });
    const url = URL.createObjectURL(pack.blob);
    const anchor = el("a", { href: url, download: pack.filename, hidden: "" });
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  async function copyExport() {
    const t = text();
    if (extraction.completeness === "partial" && !global.confirm(t.partialConfirm)) return;
    await navigator.clipboard.writeText(global.ChatExporterFormat.buildContent(currentOptions()));
    toast(t.copied);
  }

  function findComposer() {
    for (const selector of adapter.composer || []) {
      try { const node = document.querySelector(selector); if (node) return node; } catch { /* Unsupported selector. */ }
    }
    return null;
  }

  function positionWidget() {
    clearTimeout(positionTimer);
    positionTimer = setTimeout(() => {
      const composer = findComposer();
      if (!composer) {
        Object.assign(host.style, { right: "24px", bottom: "24px" });
        return;
      }
      const rect = composer.getBoundingClientRect();
      const right = Math.max(12, global.innerWidth - rect.right + 12);
      const bottom = Math.max(12, global.innerHeight - rect.top + 8);
      Object.assign(host.style, { right: `${right}px`, bottom: `${bottom}px` });
    }, 80);
  }

  function closePanel() {
    panel.hidden = true;
  }

  function notifyPopup() {
    try {
      const delivery = chrome.runtime.sendMessage({ type: "chatExporterWidget", action: "opened" });
      delivery?.catch?.(() => {});
    } catch { /* The toolbar popup may be closed. */ }
  }

  toggle.addEventListener("click", async () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) {
      notifyPopup();
      if (!extraction && !scanning) await scanConversation(settings.defaultScanMode);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!panel.hidden && !event.composedPath().includes(host)) closePanel();
  }, true);

  chrome.runtime.onMessage?.addListener((message) => {
    if (message?.type === "chatExporterWidget" && message.action === "close") closePanel();
  });

  loadSettings().then(() => {
    if (!settings.enabled) {
      host.remove();
      global.__CHAT_EXPORTER_WIDGET__ = false;
      return;
    }
    render();
    positionWidget();
    observer = new MutationObserver(() => {
      if (route !== location.href) { route = location.href; extraction = null; render(); }
      scheduleThemeSync();
      positionWidget();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    global.addEventListener("resize", positionWidget, { passive: true });
    global.addEventListener("scroll", positionWidget, { passive: true });
    systemTheme?.addEventListener?.("change", scheduleThemeSync);
  });

  chrome.storage.onChanged?.addListener((changes, area) => {
    if (area !== "local" || changes.settingsV2?.newValue?.enabledSites?.[adapter.id] !== false) return;
    observer?.disconnect();
    clearTimeout(positionTimer);
    clearTimeout(themeTimer);
    host.remove();
    global.__CHAT_EXPORTER_WIDGET__ = false;
  });
})(globalThis);
