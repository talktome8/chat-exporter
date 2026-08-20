# Chat Exporter 2.0 — UAT checklist

Do not submit the release to a store until every required row passes in Chrome, Edge, and Firefox and the owner signs off.

## Install and first use

1. Load the matching unpacked folder from `dist/extension-builds/<browser>`.
2. Open a supported AI chat and reload it once after installing the unpacked extension.
3. Confirm the colored Chat Exporter button appears automatically near the composer. No per-site activation should be required.
4. Open the extension popup. Confirm it opens directly on the current conversation, not on Settings.
5. Confirm the one-time widget tip is visible. Click **Got it**, reopen the popup, and confirm it stays dismissed.
6. Confirm Quick export shows its completeness warning. Click **Dismiss**, reopen the popup, and confirm that warning stays dismissed.
7. In Settings, disable one service and reload its site; confirm its widget is absent. Re-enable it and reload; confirm it returns.
8. Confirm all seven service toggles are enabled by default on a clean install.

## Required platforms

| Platform | Status for 2.0 | Short chat | Long chat | Widget anchor | Floating fallback | Hebrew | Repeated prompt |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ChatGPT | Required | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Claude | Required | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Gemini | Required | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Copilot | Required | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Perplexity | Required | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Grok | Beta | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Mistral | Beta | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

## Conversation scenarios

For each platform:

1. Create at least 12 turns containing English, Hebrew, a numbered list, a table, a code block, and a link.
2. Send the exact same user prompt twice. The export must contain both occurrences in their original positions.
3. Compare the visible user/assistant turns with the popup and widget counts and the exported file, in order.
4. Check the exported metadata: total messages, user messages, and AI responses must match the selected content filters.
5. Run Quick. It must say Loaded, not Complete.
6. Run Verify full conversation. Complete is allowed only after the beginning and end were reached.
7. Navigate to another conversation without reloading. Exactly one widget must remain and its previous result must be cleared.
8. Test Markdown and text with every content toggle, including URL disabled and enabled.
9. Force an interrupted scan. A partial export must require confirmation and identify itself as partial.

## Large export

1. Run `npm test` and confirm the 3,000-turn stress case passes.
2. Use the generated large test conversation and confirm a single ZIP is downloaded.
3. Confirm every part is at most 10MiB unless it contains one oversized message.
4. Confirm messages are not split, repeated, skipped, or reordered across part boundaries.
5. Open `manifest.json`; verify counts, part ranges, settings, completeness, and SHA-256 values.

## Release gate

- [ ] `npm run check` passes.
- [ ] Chrome package verified and manually approved.
- [ ] Edge package verified and manually approved.
- [ ] Firefox package verified and manually approved.
- [ ] Tom Raz approves the UI and exported content.
- [ ] Grok and Mistral remain Beta unless every row passes.
- [ ] Confirm the manifest, all three ZIPs, store copy, privacy page and website report `2.0.0`, then submit the exact verified archives.
