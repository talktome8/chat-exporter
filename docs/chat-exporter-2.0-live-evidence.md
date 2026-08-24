# Chat Exporter 2.0 — live-site evidence

Run date: 2026-08-07. Only synthetic QA prompts were used.

## Final 2.0.0 candidate gate — 2026-08-20

- `npm run check` passed end to end: 36/36 extension tests, 2/2 rendered-site tests, ESLint, Firefox `web-ext lint` with 0 errors/notices/warnings, deterministic packaging, byte-for-byte package verification, website production build and release-readiness assertions.
- Production dependency audit: 0 vulnerabilities after upgrading Next.js to 16.3.1 and PostCSS to 8.5.26. The development-only `web-ext` validation tool still inherits an `image-size` advisory with no non-breaking patched path; none of that tool or its dependencies is included in the submitted extension packages.
- Chrome 2.0.0 loaded in a temporary headless Chromium profile.
- Firefox 2.0.0 was explicitly reported installed as a temporary add-on in a clean headless profile.
- Edge's `web-ext` headless CDP connection closed before its own load acknowledgement. A direct temporary-profile Edge launch returned successfully, and the Chrome and Edge archives are byte-identical. This is recorded as a runner limitation, not misreported as a full interactive Edge pass.
- Final SHA-256: Chrome/Edge `86d6d6e711e71a2d50e9da2e793f79b6e4109c69e6bfe4f9594bc39a61018634`; Firefox `86e1741d50855c1d329d4599daa10d88a2af664b95d646dd2622d057687da6f6`.
- The final owner UAT remains the release-approval gate for authenticated live behavior. Existing blocked rows below are not silently converted to passes.

## Live DOM checks

| Service | Live result | Evidence and remaining limit |
| --- | --- | --- |
| ChatGPT | Pass | Created a short anonymous conversation with Hebrew, a list and a table; sent the same prompt twice; verified two unique user turns and two assistant turns. Confirmed the current `data-message-id` and `data-message-model-slug="gpt-5-5"` structure. |
| Gemini | Pass | Created a short QA conversation; verified `user-query`, `model-response`, repeated prompts, the shared stable turn-container ID, and the current `Flash` mode control. |
| Perplexity | Pass after fix | Created a short QA session with Hebrew, a list, table and code; verified two repeated queries and two responses. The live site had replaced the old user selector, assistant selector and composer anchor; Beta 3 uses the current `group/query`, `data-renderer="lm"` and contenteditable textbox structures. |
| Claude | Blocked by authentication | The isolated browser reached Claude's login page. No account credentials were entered. Fixture and regression coverage passes, but live extension behavior is not yet certified. |
| Copilot | Blocked by authentication | The isolated browser reached the account chooser and did not grant Microsoft/Google/Apple account access. Fixture and regression coverage passes, but live extension behavior is not yet certified. |
| Grok | Partial, remains Beta | The live user-message selector matched a synthetic prompt, but Grok required sign-up before returning an assistant response. |
| Mistral / Vibe | Deferred beyond 2.0 | Live extraction did not pass the release gate, so Mistral was removed from the 2.0 package and public compatibility claims. |

## Browser-channel status

- The Codex isolated browser was available for live DOM verification.
- Direct control of the user's personal Chrome and Edge profiles was unavailable, so the existing store installation and logged-in sessions were not touched.
- Beta 3 was loaded successfully into separate temporary profiles in Chrome 151, Edge 151 and Firefox 152. Firefox explicitly reported the temporary add-on installation; Chrome and Edge stayed running with the unpacked build until the isolated smoke sessions were stopped.
- These isolated install smokes plus automated popup/widget tests do not replace clicking the real extension UI against authenticated conversations in each browser.
- Do not submit Beta 3 to stores until the direct browser channels are connected and the remaining authenticated-service rows pass.

## Export artifact inspection

- Generated Markdown and filtered plain-text files through the production formatter/archive path.
- Generated and reopened a nine-part ZIP containing 60 messages.
- Verified every part's byte count and SHA-256 against `manifest.json`.
- Confirmed repeated prompts, Hebrew, code, tables, links, completeness and filtered role counts in the resulting files.
- Evidence is stored under `dist/qa-exports-2.0.0/qa-report.json` and can be regenerated with `npm run qa:exports`.

## Defects found by live testing

1. Perplexity's current DOM no longer matched the Beta 2 user selector or composer anchor.
2. ChatGPT's current model slug was not read from the assistant turn.
3. Gemini's current mode name was not read from the mode picker.
4. Gemini identifies a complete user/assistant turn on their shared ancestor rather than the message nodes themselves.
5. ZIP continuation headers needed reserved space to keep ordinary parts within the 10MiB limit.

All five findings are covered by Beta 3 regression tests.
