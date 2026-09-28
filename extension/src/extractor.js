(function exposeExtractor(global) {
  "use strict";

  const NO_PROGRESS_LIMIT = 12;
  // Quiet time at both boundaries gives lazy-loaded history time to arrive.
  const STABLE_PASSES_REQUIRED = 12;
  const STEP_DELAY_MS = 260;
  let extractionMode = "quick";
  const nodeIdentities = new WeakMap();
  let nextNodeIdentity = 1;

  global.__CHAT_EXPORTER_CANCEL__ = false;
  const registry = global.ChatExporterPlatforms;
  if (!registry) throw new Error("platform_registry_missing");

  function cancelled() {
    return global.__CHAT_EXPORTER_CANCEL__ === true;
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function reportProgress(phase, messages, step) {
    try { global.__CHAT_EXPORTER_PROGRESS__?.({ phase, messageCount: messages.length, step }); } catch { /* Progress reporting is optional. */ }
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
    // Some sites reuse the same renderer for both roles; an explicit user
    // match takes precedence over a broad assistant selector.
    const assistantElements = querySelectors(adapter.assistant, adapter.deep)
      .filter((element) => !userElements.some((user) => user === element || user.contains(element)));
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
      .map(({ role, element }) => ({ role, text: normalizeMessageText(adapter, role, toMarkdown(element, adapter, role)), element, turnId: stableTurnId(element) }))
      .filter((message) => message.text.length > 0);
  }

  function stableTurnId(element) {
    let current = element;
    for (let depth = 0; current && depth < 5; depth += 1, current = current.parentElement) {
      for (const name of ["data-message-id", "data-chatgpt-search-message-ids", "data-turn-id", "data-testid", "id"]) {
        const rawValue = current.getAttribute?.(name);
        const value = name === "data-chatgpt-search-message-ids" ? rawValue?.trim().split(/\s+/)[0] : rawValue;
        if (!value || /^(?:(?:user|assistant|model|human)[-_ ]?)?(?:message|turn|query|response|answer)$/i.test(value)) continue;
        if (depth > 0 && (name === "id" || name === "data-testid") && !/(?:turn|message|query|response|answer)/i.test(value)) continue;
        return `${name}:${value}`;
      }
    }
    if (!nodeIdentities.has(element)) nodeIdentities.set(element, nextNodeIdentity++);
    return `node:${nodeIdentities.get(element)}`;
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

  function toMarkdown(element, adapter = null, role = null) {
    const root = element.shadowRoot || element;

    function walk(node, listIndex = null) {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
      if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return "";
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        return Array.from(node.childNodes).map((child) => walk(child)).join("");
      }

      const tag = node.tagName.toLowerCase();
      if (node.hidden || node.hasAttribute("inert")) return "";
      if (node !== root) {
        // Avoid forcing layout for every descendant during long-chat scans.
        // Inline-hidden duplicates are common in responsive chat markup.
        if (node.hasAttribute("style") || node.classList.contains("hidden") || node.classList.contains("sr-only")) {
          const style = getComputedStyle(node);
          if (style.display === "none" || style.visibility === "hidden") return "";
        }
        // Claude keeps its collapsible thinking/status UI inside the same
        // assistant turn as the final answer. Export the answer, not that UI.
        if (adapter?.id === "claude" && role === "assistant" &&
          node.matches('[data-cds="TurnStatus"], [data-testid="TurnStatus"], [data-testid*="thinking" i], [class*="thinking" i], [aria-label*="thinking" i]')) return "";
      }
      if (node.hasAttribute("data-message-attribution")) return "";
      // ChatGPT's anonymous transcript puts the user text in a button.
      // Other controls remain excluded from the exported conversation.
      if (tag === "button" && node.hasAttribute("data-user-message-bubble")) {
        return Array.from(node.childNodes).map((child) => walk(child)).join("");
      }
      // Gemini places generation-status text inside model-response, but it is
      // not part of the answer (for example, "You stopped this response").
      if (["script", "style", "svg", "button", "nav", "header", "footer", "textarea", "input", "response-info-line"].includes(tag)) return "";
      if (node.getAttribute("aria-hidden") === "true") return "";
      if (/^h[1-6]$/.test(tag) && (node.classList.contains("sr-only") || node.classList.contains("cdk-visually-hidden"))) return "";
      if (node.shadowRoot) return walk(node.shadowRoot);

      const inner = () => Array.from(node.childNodes).map((child) => walk(child)).join("");
      if (tag === "li" && node.hasAttribute("data-message-role")) return inner().trim();
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
        const label = inner().trim() || (node.getAttribute("aria-label") || node.getAttribute("title") || "").trim();
        const href = safeHref(node.getAttribute("href") || "");
        if (!href) return label;
        const fallback = new URL(href).hostname || href;
        return `[${label || fallback}](${href})`;
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
      .replace(/\n[ \t]+(?=\S)/g, "\n")
      .replace(/[ \t]+$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function tableToMarkdown(table) {
    const rows = Array.from(table.querySelectorAll("tr"));
    if (!rows.length) return "";
    const normalized = rows.map((row) => Array.from(row.querySelectorAll("th, td")).map((cell) => toMarkdown(cell).replace(/\n+/g, "<br>").replace(/\|/g, "\\|")));
    const width = Math.max(...normalized.map((row) => row.length));
    if (!width) return "";
    const lines = normalized.map((row) => `| ${row.concat(Array(Math.max(0, width - row.length)).fill("")).join(" | ")} |`);
    lines.splice(1, 0, `| ${Array(width).fill("---").join(" | ")} |`);
    return `\n\n${lines.join("\n")}\n\n`;
  }

  function findScrollContainer(messages) {
    for (const message of messages.slice(0, 4)) {
      let current = message.element?.parentElement;
      while (current && current !== document.body) {
        const style = getComputedStyle(current);
        if (/(auto|scroll)/.test(style.overflowY) && scrollRange(current) > 24) return current;
        current = current.parentElement;
      }
    }
    return document.scrollingElement || document.documentElement;
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

  function authoritativeTurnId(message) {
    return message.turnId && !message.turnId.startsWith("node:") ? message.turnId : "";
  }

  function sameTurn(a, b) {
    const idA = authoritativeTurnId(a);
    const idB = authoritativeTurnId(b);
    if (idA && idB) return idA === idB && messageSignature(a) === messageSignature(b);
    return messageSignature(a) === messageSignature(b);
  }

  function mergeMessageWindows(existing, incoming) {
    if (!existing.length) return incoming.map(stripElement);
    if (!incoming.length) return existing.slice();
    const overlap = windowOverlap(existing, incoming);
    return existing.concat(incoming.slice(overlap).map(stripElement));
  }

  function windowOverlap(existing, incoming) {
    const max = Math.min(existing.length, incoming.length);
    for (let size = max; size > 0; size -= 1) {
      let matches = true;
      for (let index = 0; index < size; index += 1) {
        if (!sameTurn(existing[existing.length - size + index], incoming[index])) { matches = false; break; }
      }
      const pairs = incoming.slice(0, size).map((message, index) => [existing[existing.length - size + index], message]);
      const hasAuthoritativeIdentity = pairs.some(([left, right]) => authoritativeTurnId(left) && authoritativeTurnId(left) === authoritativeTurnId(right));
      const hasExactNodeIdentity = pairs.some(([left, right]) => left.turnId?.startsWith("node:") && left.turnId === right.turnId);
      if (matches && (size >= 2 || hasAuthoritativeIdentity || hasExactNodeIdentity || existing.length === incoming.length)) {
        return size;
      }
    }
    return 0;
  }

  function overlapHasIdentity(existing, incoming, size) {
    for (let index = 0; index < size; index += 1) {
      const left = existing[existing.length - size + index];
      const right = incoming[index];
      const stable = authoritativeTurnId(left);
      if (stable && stable === authoritativeTurnId(right)) return true;
      if (left.turnId?.startsWith("node:") && left.turnId === right.turnId) return true;
    }
    return false;
  }

  function snapshotKey(messages, container) {
    const first = messages[0]?.text.slice(0, 160) || "";
    const last = messages.at(-1)?.text || "";
    return `${messages.length}|${first}|${last.length}:${last.slice(-160)}|${container.scrollHeight}|${Math.round(getScrollTop(container))}`;
  }

  function conversationBusy(messages) {
    return messages.some(({ element }) => element?.matches?.('[data-is-streaming="true"], [aria-busy="true"]') ||
      element?.querySelector?.('[data-is-streaming="true"], [aria-busy="true"]'));
  }

  async function loadAndExtract(adapter) {
    let initial = extractWithAdapter(adapter);
    const container = findScrollContainer(initial);
    const range = scrollRange(container);
    if (extractionMode === "quick") {
      return {
        messages: initial.map(stripElement),
        completeness: "loaded",
        warnings: ["quick"]
      };
    }
    const savedBottomDistance = range - getScrollTop(container);
    let stablePasses = 0;
    let previousKey = "";
    let reachedTop = false;

    for (let step = 0; ; step += 1) {
      if (cancelled()) throw new Error("cancelled");
      setScrollTop(container, 0);
      await wait(STEP_DELAY_MS);
      const current = extractWithAdapter(adapter);
      reportProgress("loading-start", current, step + 1);
      const key = snapshotKey(current, container);
      stablePasses = key === previousKey ? stablePasses + 1 : 0;
      previousKey = key;
      if (getScrollTop(container) <= 1 && stablePasses >= STABLE_PASSES_REQUIRED && !conversationBusy(current)) {
        reachedTop = true;
        break;
      }
      if (stablePasses >= NO_PROGRESS_LIMIT) break;
    }

    let ordered = [];
    let reachedBottom = false;
    let mergeVerified = true;
    let noProgressPasses = 0;
    let stableBottomPasses = 0;
    let previousBottomKey = "";
    setScrollTop(container, 0);
    await wait(STEP_DELAY_MS);

    for (let step = 0; ; step += 1) {
      if (cancelled()) throw new Error("cancelled");
      const current = extractWithAdapter(adapter);
      const max = scrollRange(container);
      const top = getScrollTop(container);
      const key = snapshotKey(current, container);
      const unchanged = key === previousBottomKey;
      if (!unchanged) {
        if (ordered.length > 0 && current.length > 0) {
          const overlap = windowOverlap(ordered, current);
          if (overlap === 0 || !overlapHasIdentity(ordered, current, overlap)) mergeVerified = false;
        }
        ordered = mergeMessageWindows(ordered, current);
      }
      reportProgress("collecting", ordered, step + 1);
      noProgressPasses = unchanged ? noProgressPasses + 1 : 0;
      previousBottomKey = key;
      if (top >= max - 2) {
        stableBottomPasses = noProgressPasses;
        if (stableBottomPasses >= STABLE_PASSES_REQUIRED && !conversationBusy(current)) {
          reachedBottom = true;
          break;
        }
      } else {
        stableBottomPasses = 0;
      }
      if (noProgressPasses >= NO_PROGRESS_LIMIT) break;
      setScrollTop(container, Math.min(max, top + Math.max(120, container.clientHeight * 0.5)));
      await wait(STEP_DELAY_MS);
    }

    const restoredTop = Math.max(0, scrollRange(container) - savedBottomDistance);
    setScrollTop(container, restoredTop);
    const initialTail = initial.at(-1);
    if (initialTail && !ordered.some((message) => sameTurn(message, initialTail))) mergeVerified = false;
    const complete = reachedTop && reachedBottom && mergeVerified && ordered.length > 0;
    return {
      messages: ordered.length >= initial.length ? ordered : initial.map(stripElement),
      completeness: complete ? "complete" : "partial",
      partialReason: complete ? "" : (!reachedTop ? "start_not_verified" : !reachedBottom ? "end_not_verified" : "merge_not_verified"),
      warnings: complete ? [] : ["partial"]
    };
  }

  function stripElement(message) {
    return { role: message.role, text: message.text, ...(message.turnId ? { turnId: message.turnId } : {}) };
  }

  function detectModel(adapter) {
    for (const source of adapter.modelAttributes || []) {
      const elements = querySelectors([source.selector], adapter.deep).reverse();
      for (const element of elements) {
        const value = (element.getAttribute(source.attribute) || "").trim();
        if (value) return formatModelValue(adapter, value);
      }
    }
    const elements = querySelectors(adapter.model || [], adapter.deep);
    for (const element of elements) {
      const value = ((element.textContent || element.getAttribute("aria-label") || "").split("\n")[0] || "").trim();
      if (!value || value.length >= 64 || value.toLocaleLowerCase() === adapter.name.toLocaleLowerCase()) continue;
      if (adapter.id === "gemini" && /^(flash|pro|thinking|advanced)\b/i.test(value)) return value;
      if (/^(claude|gpt|chatgpt|gemini|llama|sonnet|haiku|opus|o[134]|4o|5)/i.test(value)) return value;
    }
    return "";
  }

  function formatModelValue(adapter, value) {
    if (adapter.id === "chatgpt") {
      const decimal = value.match(/^gpt-(\d+)-(\d+)$/i);
      if (decimal) return `GPT-${decimal[1]}.${decimal[2]}`;
      return value.replace(/^gpt-/i, "GPT-");
    }
    return value;
  }

  function cleanTitle(value) {
    return (value || "")
      .replace(/^(ChatGPT|Claude|Gemini|Microsoft Copilot|Perplexity)\s[-–|]\s/i, "")
      .replace(/\s[-–|]\s(ChatGPT|Claude|Gemini|Microsoft Copilot|Perplexity).*$/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  }

  async function run(mode = "quick") {
   extractionMode = mode === "full" ? "full" : "quick";
   global.__CHAT_EXPORTER_CANCEL__ = false;
   try {
    const host = location.hostname.replace(/^www\./, "");
    const adapter = registry.select(host);
    let extraction = await loadAndExtract(adapter);

    if (adapter === registry.generic && extraction.messages.length < 2) {
      return { ok: false, code: "unsupported" };
    }

    const warnings = [...extraction.warnings];
    if (adapter.status === "beta") warnings.push("beta");
    if (adapter.status === "experimental") warnings.push("fallback");

    return {
      ok: extraction.messages.length > 0,
      platform: adapter === registry.generic ? host : adapter.name,
      adapter: adapter.id,
      supportStatus: adapter.status,
      model: detectModel(adapter),
      title: cleanTitle(document.title) || `${adapter.name} conversation`,
      filenameTitle: cleanTitle(document.title) || `${adapter.name} conversation`,
      messages: extraction.messages,
      completeness: extraction.completeness,
      partialReason: extraction.partialReason || "",
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
  }

  global.ChatExporterExtractor = { run, mergeMessageWindows };
  if (global.__CHAT_EXPORTER_RUN_ON_LOAD__) return run(global.__CHAT_EXPORTER_MODE__);
  return null;
})(globalThis);
