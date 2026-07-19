# Chat Exporter by Tom Raz

Chat Exporter is a local-first Manifest V3 browser extension for exporting AI conversations to Markdown or plain text. It is prepared for Chrome, Microsoft Edge and Firefox.

## Release status

Version `1.0.0` is a release candidate, not yet published in a browser store.

- Verified launch targets: ChatGPT, Claude, Gemini, Microsoft Copilot and Perplexity.
- Beta targets: Grok and Mistral.
- Export options: Markdown, plain text and copy to clipboard.
- Data handling: local only; no analytics, account, server or remote executable code.
- Permissions: `activeTab`, `scripting`, `storage`.

## Repository layout

- `extension/` — store-ready extension source.
- `app/` — bilingual product and privacy website.
- `docs/` — review notes, store copy, test matrix and release checklist.
- `scripts/` — deterministic icon and package generation plus package verification.
- `tests/` — manifest, formatter, extractor and rendered-site checks.
- `archive/` — ignored local backup of the original prototype.

## Local installation

### Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose **Load unpacked** and select the `extension` directory.

### Microsoft Edge

1. Open `edge://extensions`.
2. Enable Developer mode.
3. Choose **Load unpacked** and select the `extension` directory.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Choose **Load Temporary Add-on**.
3. Select `extension/manifest.json`.

## Quality commands

```text
npm test
npm run extension:lint
npm run extension:package
npm run extension:verify
npm run build
```

`npm run check` runs the complete automated release gate.

## Privacy and security

Read [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md). Conversation content is read only after a user click, processed locally, and never transmitted by the extension.

## License

MIT © 2026 Tom Raz. See [LICENSE](LICENSE).
