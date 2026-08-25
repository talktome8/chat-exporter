# Chat Exporter by Tom Raz

**Export AI conversations to Markdown or plain text — locally in your browser.**

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Available-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/chat-exporter-by-tom-raz/ljgpghdicijmjojfnhmpefjpipfakoen)
[![Microsoft Edge Add-ons](https://img.shields.io/badge/Edge-Available-0078D7?logo=microsoftedge&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/chat-exporter-by-tom-raz/nmmpfdnapkfklcbfgcmkahcjcclophhk)
[![Firefox Add-ons](https://img.shields.io/badge/Firefox-Available-FF7139?logo=firefoxbrowser&logoColor=white)](https://addons.mozilla.org/he/firefox/addon/chat-exporter-by-tom-raz/)
[![Version](https://img.shields.io/badge/version-2.0.0-1769E0)](https://github.com/talktome8/chat-exporter/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-087A4F.svg)](LICENSE)

| Install | Browser |
| --- | --- |
| [Install from Chrome Web Store](https://chromewebstore.google.com/detail/chat-exporter-by-tom-raz/ljgpghdicijmjojfnhmpefjpipfakoen) | Chrome |
| [Install from Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/chat-exporter-by-tom-raz/nmmpfdnapkfklcbfgcmkahcjcclophhk) | Microsoft Edge |
| [Install from Firefox Add-ons](https://addons.mozilla.org/he/firefox/addon/chat-exporter-by-tom-raz/) | Firefox |

![Chat Exporter product preview](store-assets/promo-marquee-1400x560.png)

## What it does

Open a supported AI conversation and use the automatic in-chat quick action or the toolbar popup. Choose the content and format, then download or copy the result. Chat Exporter can export messages already loaded on the page or scan a full conversation when completeness matters.

Everything is processed on the device. The extension has no account, analytics, server, remote executable code, advertising, or donation prompts.

## Support at a glance

| Area | v2.0.0 support |
| --- | --- |
| Supported platforms | ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity |
| Supported platforms | ChatGPT, Claude, Gemini, Copilot and Perplexity |
| Export formats | Markdown (`.md`), plain text (`.txt`), copy to clipboard |
| Processing | Local only — conversation content is not sent to Tom Raz or a third party |
| Languages | English and Hebrew (RTL) |

## Features

- Choose user messages, AI responses, or both.
- Include optional title, model, date, and conversation URL metadata.
- Export immediately from the messages already loaded on the page.
- Use **Check full conversation** when you need the extension to load earlier messages and report a complete, partial, or loaded result.
- Preserve readable Markdown, including code blocks, lists, links, and tables where they are available in the page.
- Package exports above 10 MiB into one ZIP with numbered parts, counts and SHA-256 verification.
- Preserve intentionally repeated prompts while collapsing duplicates caused by overlapping page selectors.

## Privacy and permissions

The extension requests `activeTab`, `scripting`, `storage`, and access limited to seven listed AI-chat services and their fixed domains:

- `activeTab` supports export after a toolbar click.
- `scripting` runs the packaged extractor and registers the in-chat widget.
- `storage` remembers interface and export preferences locally.
- Listed host access lets the widget appear automatically. No wildcard website access is requested.

Read the full [Privacy Policy](PRIVACY.md) and [Security Policy](SECURITY.md).

## Development

```bash
npm install
npm run check
```

`npm run check` runs linting, unit tests, extension linting, deterministic packaging, package verification, the static-site build, and rendered-page checks.

To load the extension locally, use `dist/extension-builds/chrome` or `dist/extension-builds/edge` after packaging. For Firefox development, use `dist/extension-builds/firefox` with `web-ext run`.

## Release assets

Store-specific 2.0.0 ZIPs are produced under `dist/`. `npm run release:verify` confirms the version inside every archive and prints its SHA-256 checksum.

## Support and contributions

- Report a reproducible issue through [GitHub Issues](https://github.com/talktome8/chat-exporter/issues).
- Review [CONTRIBUTING.md](CONTRIBUTING.md) before proposing a change.
- See [CHANGELOG.md](CHANGELOG.md) for release history.

Chat Exporter is open source under the [MIT License](LICENSE).
