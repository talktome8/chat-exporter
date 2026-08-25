# Chat Exporter 2.0 release test matrix

Record browser, browser version, AI platform version/date, tester, result and evidence for every row.

## Current evidence

| Check | Result | Evidence |
|---|---|---|
| v1.0 historical evidence | Pass | `docs/QA_EVIDENCE.md` |
| 2.0 automated release gate | Pass (2026-08-20) | 36/36 extension tests, 2/2 rendered-site tests, Firefox lint 0/0/0, three verified packages and release-readiness PASS |
| 2.0 isolated install smoke | Pass with noted Edge runner limitation | Chrome and Firefox temporary-profile loads passed; Edge launched the byte-identical Chromium build directly after web-ext's headless CDP connection closed |
| 2.0 live browser matrix | Owner UAT remains | Use `docs/chat-exporter-2.0-uat.md`; authenticated Claude/Copilot and Beta-service live rows are not represented as passed |

## Automated gate

- JavaScript syntax and manifest parse.
- Exact declared permissions and supported-site host access; no cookies, history, identity or network interception.
- Adapter fixtures for ChatGPT, Claude, Gemini, Copilot and Perplexity.
- Default widget registration, single-widget reinjection, first-screen behavior and persistent dismiss controls.
- Repeated-message preservation and overlapping-selector collapse.
- Large-conversation splitting, counts, hashes and ZIP manifest integrity.
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

Repeat the same matrix for ChatGPT, Claude, Gemini, Copilot and Perplexity. Record live testing only with anonymous test conversations.

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
