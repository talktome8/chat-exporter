(async function chatExporterExtract() {
  "use strict";

  const LOAD_TIMEOUT_MS = 10000;
  const BACKWARD_STEP_LIMIT = 24;
  const FORWARD_STEP_LIMIT = 80;
  const STABLE_PASSES_REQUIRED = 3;
  const STEP_DELAY_MS = 260;
  const extractionMode = globalThis.__CHAT_EXPORTER_MODE__ === "full" ? "full" : "quick";

  globalThis.__CHAT_EXPORTER_CANCEL__ = false;

  const adapters = [
    {
      id: "chatgpt",
      platform: "ChatGPT",
      hosts: ["chatgpt.com", "chat.openai.com"],
      status: "supported",
      user: ['[data-message-author-role="user"]'],
      assistant: ['[data-message-author-role="assistant"]']
    },
    {
      id: "claude",
      platform: "Claude",
      hosts: ["claude.ai"],
      status: "supported",
      user: ['[data-testid="human-turn"]', '[data-testid="user-message"]'],
      assistant: ['[data-testid="assistant-turn"]', '[data-is-streaming]']
    },
    {
      id: "gemini",
      platform: "Gemini",
      hosts: ["gemini.google.com"],
      status: "supported",
      deep: true,
      user: ["user-query", '.user-query', '[data-test-id="user-query"]'],
      assistant: ["model-response", '.model-response', '[data-test-id="model-response"]']
    },
    {
      id: "copilot",
      platform: "Copilot",
      hosts: ["copilot.microsoft.com"],
      status: "supported",
      user: ['[data-role="user"]', '[data-content="user-message"]', '[data-testid*="user-message"]'],
      assistant: ['[data-role="assistant"]', '[data-content="ai-message"]', '[data-testid*="assistant-message"]']
    },
    {
      id: "perplexity",
      platform: "Perplexity",
      hosts: ["perplexity.ai"],
      status: "supported",
      user: ['[data-testid="user-query"]', '[data-scope="web"] .break-words', '[class*="UserMessage"]'],
      assistant: ['[data-testid="answer"]', '[data-testid*="assistant"]', 'main .prose']
    },
    {
      id: "grok",
      platform: "Grok",
      hosts: ["grok.com", "x.ai"],
      status: "beta",
      user: ['[data-message-author-role="user"]', '[data-role="user"]'],
      assistant: ['[data-message-author-role="assistant"]', '[data-role="assistant"]']
    },
    {
      id: "mistral",
      platform: "Mistral",
      hosts: ["chat.mistral.ai"],
      status: "beta",
      user: ['[class*="UserMessage"]', '[data-role="user"]'],
      assistant: ['[class*="AssistantMessage"]', '[data-role="assistant"]']
    }
  ];

  const genericAdapter = {
    id: "generic",
    platform: "AI chat",
    hosts: [],
    status: "experimental",
    user: [
      '[data-message-author-role="user"]', '[data-role="user"]',
      '[data-testid*="human"]', '[data-testid*="user-message"]',
      '[class*="UserMessage"]', '[class*="user-message"]', '[class*="human-message"]'
    ],
    assistant: [
      '[data-message-author-role="assistant"]', '[data-role="assistant"]',
      '[data-testid*="assistant"]', '[class*="AssistantMessage"]',
      '[class*="assistant-message"]', '[class*="model-response"]'
    ]
  };

  function cancelled() {
    return globalThis.__CHAT_EXPORTER_CANCEL__ === true;
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function hostMatches(host, candidate) {
    return host === candidate || host.endsWith(`.${candidate}`);
  }

  function selectAdapter(host) {
    return adapters.find((adapter) => adapter.hosts.some((candidate) => hostMatches(host, candidate))) || genericAdapter;
  }

  function queryAllDeep(selector, root = document) {
    const results = [];
    const seen = new Set();

    function visit(scope) {
      let matches = [];
      try { matches = scope.querySelectorAll(selector); } catch { return; }
      for (const element of matches) {
        if (!seen.has(element)) {
          seen.add(element);
          results.push(element);
        }
      }

      let descendants = [];
      try { descendants = scope.querySelectorAll("*"); } catch { return; }
      for (const element of descendants) {
        if (element.shadowRoot) visit(element.shadowRoot);
      }
    }

    visit(root);
    return results;
  }

  function querySelectors(selectors, deep = false) {
    const elements = [];
    const seen = new Set();
    for (const selector of selectors) {
      let matches = [];
      try { matches = deep ? queryAllDeep(selector) : document.querySelectorAll(selector); } catch { continue; }
      for (const element of matches) {
        if (!seen.has(element) && isReadable(element)) {
          seen.add(element);
          elements.push(element);
        }
      }
    }
    return elements;
  }

  function isReadable(element) {
    if (!(element instanceof Element)) return false;
    const text = (element.innerText || element.textContent || "").trim();
    if (!text) return false;
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function elementTop(element) {
    const rect = element.getBoundingClientRect();
    return rect.top + (window.scrollY || document.documentElement.scrollTop || 0);
  }

  function extractWithAdapter(adapter) {
    const userElements = querySelectors(adapter.user, adapter.deep);
    const assistantElements = querySelectors(adapter.assistant, adapter.deep);
    const tagged = [
      ...userElements.map((element) => ({ role: "user", element })),
      ...assistantElements.map((element) => ({ role: "assistant", element }))
    ];

    tagged.sort((a, b) => {
      if (a.element === b.element) return 0;
      const position = a.element.compareDocumentPosition?.(b.element) || 0;
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return elementTop(a.element) - elementTop(b.element);
    });

    return tagged
      .filter(({ element }, index, list) => !list.some((other, otherIndex) => otherIndex !== index && other.element.contains(element)))
      .map(({ role, element }) => ({ role, text: normalizeMessageText(adapter, role, toMarkdown(element)), element }))
      .filter((message) => message.text.length > 0);
  }

  function normalizeMessageText(adapter, role, value) {
    if (adapter.id !== "gemini") return value;
    const label = role === "user" ? "You said" : "Gemini said";
    return value.replace(new RegExp(`^${label}\\s*`, "i"), "").trim();
  }

  function safeHref(value) {
    try {
      const url = new URL(value, location.href);
      return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function toMarkdown(element) {
    const root = element.shadowRoot || element;

    function walk(node, listIndex = null) {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
      if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return "";
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        return Array.from(node.childNodes).map((child) => walk(child)).join("");
      }

      const tag = node.tagName.toLowerCase();
      if (["script", "style", "svg", "button", "nav", "header", "footer", "textarea", "input"].includes(tag)) return "";
      if (node.getAttribute("aria-hidden") === "true") return "";
      if (node.shadowRoot) return walk(node.shadowRoot);

      const inner = () => Array.from(node.childNodes).map((child) => walk(child)).join("");
      if (tag === "pre") {
        const code = node.querySelector("code");
        const language = (code?.className.match(/language-([\w-]+)/) || [])[1] || "";
        return `\n\n\`\`\`${language}\n${(code?.textContent || node.textContent || "").trim()}\n\`\`\`\n\n`;
      }
      if (tag === "code") return `\`${(node.textContent || "").replace(/\`/g, "\\\`")}\``;
      if (tag === "strong" || tag === "b") return `**${inner()}**`;
      if (tag === "em" || tag === "i") return `*${inner()}*`;
      if (/^h[1-6]$/.test(tag)) return `\n\n${"#".repeat(Number(tag[1]))} ${inner().trim()}\n\n`;
      if (tag === "p") return `\n\n${inner()}\n\n`;
      if (tag === "br") return "\n";
      if (tag === "hr") return "\n\n---\n\n";
      if (tag === "blockquote") return `\n\n> ${inner().trim().replace(/\n/g, "\n> ")}\n\n`;
      if (tag === "li") {
        const parent = node.parentElement;
        const index = parent?.tagName.toLowerCase() === "ol" ? Array.from(parent.children).indexOf(node) + 1 : listIndex;
        return `\n${index ? `${index}.` : "-"} ${inner().trim()}`;
      }
      if (tag === "ul" || tag === "ol") return `\n${inner()}\n`;
      if (tag === "a") {
        const label = inner().trim();
        const href = safeHref(node.getAttribute("href") || "");
        return href && label ? `[${label}](${href})` : label;
      }
      if (tag === "img") {
        const alt = (node.getAttribute("alt") || "").trim();
        return alt ? `[Image: ${alt}]` : "";
      }
      if (tag === "table") return tableToMarkdown(node);
      return inner();
    }

    return walk(root)
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function tableToMarkdown(table) {
    const rows = Array.from(table.querySelectorAll("tr"));
    if (!rows.length) return "";
    const normalized = rows.map((row) => Array.from(row.querySelectorAll("th, td")).map((cell) => (cell.textContent || "").trim().replace(/\|/g, "\\|")));
    const width = Math.max(...normalized.map((row) => row.length));
    if (!width) return "";
    const lines = normalized.map((row) => `| ${row.concat(Array(Math.max(0, width - row.length)).fill("")).join(" | ")} |`);
    lines.splice(1, 0, `| ${Array(width).fill("---").join(" | ")} |`);
    return `\n\n${lines.join("\n")}\n\n`;
  }

  function findScrollContainer(messages) {
    const candidates = new Set([document.scrollingElement || document.documentElement]);
    for (const message of messages.slice(0, 4)) {
      let current = message.element?.parentElement;
      while (current && current !== document.body) {
        const style = getComputedStyle(current);
        if (/(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight + 24) candidates.add(current);
        current = current.parentElement;
      }
    }
    return Array.from(candidates).sort((a, b) => scrollRange(b) - scrollRange(a))[0];
  }

  function scrollRange(container) {
    return Math.max(0, container.scrollHeight - container.clientHeight);
  }

  function getScrollTop(container) {
    return container === document.scrollingElement ? window.scrollY : container.scrollTop;
  }

  function setScrollTop(container, top) {
    if (container === document.scrollingElement) window.scrollTo({ top, behavior: "instant" });
    else container.scrollTo({ top, behavior: "instant" });
    container.dispatchEvent(new Event("scroll", { bubbles: true }));
  }

  function messageSignature(message) {
    return `${message.role}\u0000${message.text}`;
  }

  function snapshotKey(messages, container) {
    const first = messages[0]?.text.slice(0, 160) || "";
    return `${messages.length}|${first}|${container.scrollHeight}|${Math.round(getScrollTop(container))}`;
  }

  async function loadAndExtract(adapter) {
    const startedAt = Date.now();
    let initial = extractWithAdapter(adapter);
    if (initial.length < 2) return { messages: initial, completeness: "unknown", warnings: [] };

    const container = findScrollContainer(initial);
    const range = scrollRange(container);
    if (range < 32) return { messages: initial.map(stripElement), completeness: "complete", warnings: [] };

    if (extractionMode === "quick") {
      return {
        messages: initial.map(stripElement),
        completeness: "unknown",
        warnings: ["quick"]
      };
    }

    const savedBottomDistance = range - getScrollTop(container);
    let stablePasses = 0;
    let previousKey = "";
    let reachedTop = false;

    for (let step = 0; step < BACKWARD_STEP_LIMIT; step += 1) {
      if (cancelled()) throw new Error("cancelled");
      if (Date.now() - startedAt > LOAD_TIMEOUT_MS) break;
      setScrollTop(container, 0);
      await wait(STEP_DELAY_MS);
      const current = extractWithAdapter(adapter);
      const key = snapshotKey(current, container);
      stablePasses = key === previousKey ? stablePasses + 1 : 0;
      previousKey = key;
      if (getScrollTop(container) <= 1 && stablePasses >= STABLE_PASSES_REQUIRED) {
        reachedTop = true;
        break;
      }
    }

    const ordered = [];
    const seen = new Set();
    let reachedBottom = false;
    setScrollTop(container, 0);
    await wait(STEP_DELAY_MS);

    for (let step = 0; step < FORWARD_STEP_LIMIT; step += 1) {
      if (cancelled()) throw new Error("cancelled");
      if (Date.now() - startedAt > LOAD_TIMEOUT_MS * 2) break;
      const current = extractWithAdapter(adapter);
      for (const message of current) {
        const signature = messageSignature(message);
        if (!seen.has(signature)) {
          seen.add(signature);
          ordered.push(stripElement(message));
        }
      }

      const max = scrollRange(container);
      const top = getScrollTop(container);
      if (top >= max - 2) {
        reachedBottom = true;
        break;
      }
      setScrollTop(container, Math.min(max, top + Math.max(240, container.clientHeight * 0.72)));
      await wait(STEP_DELAY_MS);
    }

    const restoredTop = Math.max(0, scrollRange(container) - savedBottomDistance);
    setScrollTop(container, restoredTop);
    const complete = reachedTop && reachedBottom;
    return {
      messages: ordered.length >= initial.length ? ordered : initial.map(stripElement),
      completeness: complete ? "complete" : "partial",
      warnings: complete ? [] : ["partial"]
    };
  }

  function stripElement(message) {
    return { role: message.role, text: message.text };
  }

  function detectModel() {
    const elements = document.querySelectorAll('button, [role="button"], [aria-label], option');
    for (const element of elements) {
      const value = ((element.textContent || element.getAttribute("aria-label") || "").split("\n")[0] || "").trim();
      if (/^(claude|gpt|chatgpt|gemini|grok|mistral|llama|sonnet|haiku|opus|o[134]|4o|5)/i.test(value) && value.length < 64) return value;
    }
    return "";
  }

  function cleanTitle(value) {
    return (value || "")
      .replace(/\s[-–|]\s(ChatGPT|Claude|Gemini|Microsoft Copilot|Perplexity|Grok|Mistral).*$/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  }

  try {
    const host = location.hostname.replace(/^www\./, "");
    const adapter = selectAdapter(host);
    let extraction = await loadAndExtract(adapter);

    if (adapter === genericAdapter && extraction.messages.length < 2) {
      return { ok: false, code: "unsupported" };
    }

    const warnings = [...extraction.warnings];
    if (adapter.status === "beta") warnings.push("beta");
    if (adapter.status === "experimental") warnings.push("fallback");

    return {
      ok: extraction.messages.length > 0,
      platform: adapter === genericAdapter ? host : adapter.platform,
      adapter: adapter.id,
      supportStatus: adapter.status,
      model: detectModel(),
      title: cleanTitle(document.title) || `${adapter.platform} conversation`,
      messages: extraction.messages,
      completeness: extraction.completeness,
      scanMode: extractionMode,
      warnings: Array.from(new Set(warnings))
    };
  } catch (error) {
    return {
      ok: false,
      code: error?.message === "cancelled" ? "cancelled" : "extract_failed",
      error: String(error?.message || error)
    };
  }
})();
