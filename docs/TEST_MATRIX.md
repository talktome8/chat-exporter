# Release test matrix

Record browser, browser version, AI platform version/date, tester, result and evidence for every row.

## Current evidence

| Check | Result | Evidence |
|---|---|---|
| Automated release gate | Pass | `docs/QA_EVIDENCE.md` |
| Firefox temporary installation | Pass | `web-ext run`, 2026-07-20 |
| Firefox live platform matrix | Waiting for test-account sign-in | No personal conversations used |

## Automated gate

- JavaScript syntax and manifest parse.
- Exact minimal permissions; no host permissions or web-accessible resources.
- Adapter fixtures for ChatGPT, Claude, Gemini, Copilot and Perplexity.
- Markdown, plain text, Hebrew, code, links and tables.
- Firefox `web-ext lint` with warnings treated as errors.
- Deterministic ZIP contents and SHA-256 equality with source files.
- Website build and server-rendered metadata/content.

## Manual browser matrix

Run each verified platform in current stable Chrome, Microsoft Edge and Firefox on Windows:

| Scenario | Chrome | Edge | Firefox |
|---|---|---|---|
| Short conversation | Pending | Pending | Pending |
| Instant export of loaded messages | Pending | Pending | Pending |
| Long conversation / earlier-message loading | Pending | Pending | Pending |
| Complete status | Pending | Pending | Pending |
| Partial status on timeout/block | Pending | Pending | Pending |
| Cancel and restore scroll position | Pending | Pending | Pending |
| Markdown download | Pending | Pending | Pending |
| Plain-text download | Pending | Pending | Pending |
| Copy to clipboard | Pending | Pending | Pending |
| User/assistant filters | Pending | Pending | Pending |
| Optional metadata and URL | Pending | Pending | Pending |
| English/Hebrew and RTL | Pending | Pending | Pending |
| Restricted browser page | Pending | Pending | Pending |
| Empty/unsupported page | Pending | Pending | Pending |

Repeat the same matrix for ChatGPT, Claude, Gemini, Copilot and Perplexity. Grok and Mistral require smoke tests but remain Beta until all rows pass. Record live testing only with anonymous test conversations.

## Content fixtures

- Headings, bold and italic text.
- Ordered and unordered lists.
- Inline code and fenced code blocks.
- Safe HTTP/HTTPS/mailto links and a rejected unsafe protocol.
- Tables with pipes and missing cells.
- Hebrew, English and mixed-direction content.
- Duplicate-looking messages and empty messages.
- Very long answers and rapidly changing streaming content.

## Release acceptance

- No Critical or High security finding.
- No broken verified adapter.
- No undocumented permission or network request.
- No contradiction among behavior, privacy policy and store disclosures.
- Submitted ZIP hash equals the verified release artifact.
- Both testers sign the release checklist.
