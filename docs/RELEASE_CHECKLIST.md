# Release record and maintenance checklist

## v1.0.0 launch record

Chat Exporter v1.0.0 is publicly available from the following stores:

- [Chrome Web Store](https://chromewebstore.google.com/detail/chat-exporter-by-tom-raz/ljgpghdicijmjojfnhmpefjpipfakoen)
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/chat-exporter-by-tom-raz/nmmpfdnapkfklcbfgcmkahcjcclophhk)
- [Firefox Add-ons](https://addons.mozilla.org/he/firefox/addon/chat-exporter-by-tom-raz/)

Historical QA material is retained in [QA_EVIDENCE.md](QA_EVIDENCE.md) and [TEST_MATRIX.md](TEST_MATRIX.md). It records the evidence available during the v1.0.0 launch process; it is not a promise that third-party AI sites will never change their page structure.

## For the next update

1. Update the extension version, changelog, and store-facing text as needed.
2. Run `npm run check` from a clean working tree.
3. Upload the resulting `dist/chat-exporter-by-tom-raz-<version>.zip` to each applicable store.
4. Confirm the store listing, permissions, privacy disclosure, screenshots, and support links match the submitted build.
5. Compute SHA-256 for the exact ZIP submitted, commit the release documentation, tag the release, then publish the corresponding GitHub Release.

Do not claim universal compatibility or complete exports unless the current build can demonstrate it for the active conversation.
