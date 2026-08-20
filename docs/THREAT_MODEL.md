# Threat model

## Protected assets

- Conversation content and page URLs.
- Browser history outside the active tab.
- User credentials, cookies and AI-service sessions.
- Integrity of the exported file and reviewed extension package.

## Trust boundaries

- AI website DOM: untrusted input.
- Extension package: reviewed local code.
- Popup DOM: trusted extension UI; untrusted conversation values are assigned using text APIs.
- Downloaded Markdown/text: local user-controlled output that may still contain links from the conversation.

## Controls

- `activeTab` supports popup export, while narrowly enumerated AI-chat host permissions enable the automatic in-chat widget.
- Users can disable the widget per service; no wildcard access outside the listed AI-chat hosts is requested.
- No cookies, identity, history, tabs or web-request permissions.
- No network client, analytics or remote executable code.
- Safe-link allowlist for Markdown output.
- No `innerHTML`, `eval`, `new Function` or dynamic script tags.
- Deterministic package verification against source hashes.
- Completeness warnings prevent silent partial-export claims.

## Residual risks

- AI sites can change their DOM without notice and break or degrade extraction.
- Virtualized conversations may prevent a provably complete export; the extension reports Partial or Loaded with a clear verification option.
- A user can open an exported Markdown link that originated in conversation content.
- A compromised AI page can influence the content being exported, but cannot obtain broader extension permissions through the extractor.
