(function exposePlatforms(global) {
  "use strict";

  const platforms = [
    {
      id: "chatgpt", name: "ChatGPT", hosts: ["chatgpt.com", "chat.openai.com"], status: "supported",
      icon: "platforms/chatgpt.png", iconDark: "platforms/chatgpt-dark.png", accent: "#10a37f",
      user: ['[data-message-author-role="user"]'], assistant: ['[data-message-author-role="assistant"]'],
      modelAttributes: [{ selector: '[data-message-author-role="assistant"][data-message-model-slug]', attribute: "data-message-model-slug" }],
      model: ['button[data-testid*="model"]', '[aria-label*="model" i]'],
      composer: ['form[data-type="unified-composer"]', 'form:has(textarea)', '#prompt-textarea']
    },
    {
      id: "claude", name: "Claude", hosts: ["claude.ai"], status: "supported",
      icon: "platforms/claude.png", accent: "#d97757",
      user: ['[data-testid="human-turn"]', '[data-testid="user-message"]'],
      assistant: ['[data-testid="assistant-turn"]', '[data-is-streaming]'],
      model: ['button[aria-haspopup="menu"]', '[data-testid*="model"]'],
      composer: ['fieldset', 'form:has([contenteditable="true"])', '[contenteditable="true"]']
    },
    {
      id: "gemini", name: "Gemini", hosts: ["gemini.google.com"], status: "supported", deep: true,
      icon: "platforms/gemini.png", accent: "#4285f4",
      user: ["user-query", '.user-query', '[data-test-id="user-query"]'],
      assistant: ["model-response", '.model-response', '[data-test-id="model-response"]'],
      model: ['button[aria-label^="Open mode picker" i]', '[data-test-id*="model"]', 'button[aria-label*="model" i]'],
      composer: ['input-area-v2', 'rich-textarea', 'form:has([contenteditable="true"])']
    },
    {
      id: "copilot", name: "Copilot", hosts: ["copilot.microsoft.com"], status: "supported",
      icon: "platforms/copilot.png", accent: "#7c3aed",
      user: ['[data-role="user"]', '[data-content="user-message"]', '[data-testid*="user-message"]'],
      assistant: ['[data-role="assistant"]', '[data-content="ai-message"]', '[data-testid*="assistant-message"]'],
      model: ['[data-testid*="model"]', 'button[aria-label*="model" i]'],
      composer: ['form:has(textarea)', '[data-testid*="composer"]', 'textarea']
    },
    {
      id: "perplexity", name: "Perplexity", hosts: ["perplexity.ai", "www.perplexity.ai"], status: "supported",
      icon: "platforms/perplexity.png", accent: "#20808d",
      user: ['[class*="group/query"]', '[data-testid="user-query"]', '[data-scope="web"] .break-words', '[class*="UserMessage"]'],
      assistant: ['[data-renderer="lm"]', '[data-testid="answer"]', '[data-testid*="assistant"]', 'main .prose'],
      model: ['[data-testid*="model"]', 'button[aria-label*="model" i]'],
      composer: ['[contenteditable="true"][role="textbox"]', 'form:has(textarea)', '[data-testid*="composer"]', 'textarea']
    },
    {
      id: "grok", name: "Grok", hosts: ["grok.com", "x.ai"], status: "supported",
      icon: "platforms/grok.png", iconDark: "platforms/grok-dark.png", accent: "#111827",
      turns: ['[data-message-author-role]', '[data-role="user"]', '[data-role="assistant"]', '[data-testid="conversation-turn-user"]', '[data-testid="conversation-turn-assistant"]', '[data-testid="user-message"]', '[data-testid="assistant-message"]', '.message-bubble'],
      user: ['[data-testid="conversation-turn-user"]', '[data-testid="user-message"]', '[data-testid*="user-message"]', '[data-message-author-role="user"]', '[data-role="user"]', '[class*="user-message"]', '[class*="userMessage"]'],
      assistant: ['[data-testid="conversation-turn-assistant"]', '[data-testid="assistant-message"]', '[data-testid*="assistant-message"]', '[data-message-author-role="assistant"]', '[data-role="assistant"]', '[class*="assistant-message"]', '[class*="assistantMessage"]'],
      model: ['[data-testid*="model"]', 'button[aria-label*="model" i]'],
      composer: ['form:has(textarea)', '[contenteditable="true"]', 'textarea']
    }
  ];

  const generic = {
    id: "generic", name: "AI chat", hosts: [], status: "experimental", icon: "icons/icon48.png", accent: "#1769e0",
    user: ['[data-message-author-role="user"]', '[data-role="user"]', '[data-testid*="human"]', '[data-testid*="user-message"]', '[class*="UserMessage"]', '[class*="user-message"]', '[class*="human-message"]'],
    assistant: ['[data-message-author-role="assistant"]', '[data-role="assistant"]', '[data-testid*="assistant"]', '[class*="AssistantMessage"]', '[class*="assistant-message"]', '[class*="model-response"]'],
    model: [], composer: ['form:has(textarea)', '[contenteditable="true"]', 'textarea']
  };

  function hostMatches(host, candidate) {
    return host === candidate || host.endsWith(`.${candidate}`);
  }

  function select(host) {
    const normalized = String(host || "").replace(/^www\./, "");
    return platforms.find((platform) => platform.hosts.some((candidate) => hostMatches(normalized, candidate))) || generic;
  }

  function origins(platform) {
    return platform.hosts.map((host) => `https://${host}/*`);
  }

  global.ChatExporterPlatforms = { platforms, generic, select, origins };
})(globalThis);
