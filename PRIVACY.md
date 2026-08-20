# Privacy Policy

Effective: August 20, 2026

Chat Exporter by Tom Raz processes AI conversation content locally in the user's browser.

## Data accessed

The extension runs only on the explicitly listed AI-chat domains so its in-chat quick action can appear automatically. On those pages it can temporarily read loaded prompts, AI responses, links, code, tables, the page title, the detected model and the current conversation URL. The URL is included in an export only when the user selects that option. Users can disable the in-chat widget for any service in Settings.

This access is used only to show local message counts and to create the export requested by the user.

## Local storage and transmission

- Conversation content, exported text and conversation URLs are not stored by the extension.
- `settingsV2` is stored in `storage.local`: language, enabled services, default format, selected message roles, metadata and URL choices, default scan mode, and dismissed help notices.
- Conversation content, page URLs and browsing activity are not transmitted to Tom Raz or a third party.
- The extension makes no network requests and contains no analytics, ads or remote executable code.
- Exported files are saved locally through the browser; clipboard access occurs only after the user presses Copy.

## Permissions and site access

- `activeTab`: supports toolbar-popup export after the user invokes the extension.
- `scripting`: runs the bundled extractor and registers the in-chat widget.
- `storage`: remembers local interface and export preferences.
- Required host access is limited to the listed ChatGPT, Claude, Gemini, Copilot, Perplexity, Grok and Mistral domains so the widget can appear automatically. The extension requests no wildcard access to other websites.

Chat Exporter does not sell, share or use user data for advertising, profiling, credit decisions or unrelated purposes. Material changes will be recorded in the changelog and store privacy disclosures.

Non-sensitive bugs can be reported through [GitHub Issues](https://github.com/talktome8/chat-exporter/issues). Security reports must use the private [Security Advisory form](https://github.com/talktome8/chat-exporter/security/advisories/new).
