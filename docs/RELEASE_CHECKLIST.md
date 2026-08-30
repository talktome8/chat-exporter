# Release record and maintenance checklist

## v2.0.1 popup hotfix

Version source of truth: `extension/manifest.json` and `package.json`, both exactly `2.0.1`.

Store upload files:

- Chrome: `dist/chat-exporter-by-tom-raz-2.0.1-chrome.zip`
- Microsoft Edge: `dist/chat-exporter-by-tom-raz-2.0.1-edge.zip`
- Firefox: `dist/chat-exporter-by-tom-raz-2.0.1-firefox.zip`

Use [STORE_SUBMISSION_2.0.md](STORE_SUBMISSION_2.0.md) for copy-and-paste listing fields and [chat-exporter-2.0-uat.md](chat-exporter-2.0-uat.md) for owner acceptance.

### Technical gate

- [ ] `npm run check` passes from the current release tree.
- [ ] The release-readiness output says `Chat Exporter 2.0.1` and prints three hashes.
- [ ] `dist/SHA256SUMS-2.0.1.txt` matches those exact ZIPs.
- [ ] Chrome and Edge archives contain a root Manifest V3 file with `background.service_worker` and no Firefox-only background scripts entry.
- [ ] Firefox archive contains a root Manifest V3 file with `background.scripts`, Gecko ID and `data_collection_permissions: none`.
- [ ] Firefox `web-ext lint --warnings-as-errors` reports zero errors and warnings.
- [ ] Website build and rendered privacy-page checks pass.
- [ ] Store screenshots are 1280×800; promotional tiles and icon have their declared dimensions.
- [ ] No Critical or High production/package security finding remains. Development-tool-only findings must be documented and excluded from submitted archives.

### Product gate

- [ ] Quick export reports Loaded, not Complete.
- [ ] Full scan reports Complete only after both ends are verified; blocked scans report Partial with a reason.
- [ ] An intentionally repeated message remains twice and an overlapping selector remains once.
- [ ] Markdown, text, Copy and all content filters work.
- [ ] Exports above 10MiB produce a ZIP whose parts, counts and SHA-256 values match its manifest.
- [ ] The widget appears automatically, remains singular across SPA navigation, follows light/dark mode, and can be disabled per service.
- [ ] Popup first screen is the export screen; settings and both one-time notices behave correctly.

### Submission gate

- [ ] Tom Raz completes the final UAT and approves the UI and exported content.
- [ ] The exact browser-specific ZIP is uploaded to each existing store item.
- [ ] Permission, data handling, remote-code and privacy answers match [PRIVACY.md](../PRIVACY.md).
- [ ] Reviewer notes and assets are uploaded.
- [ ] The dashboard shows version `2.0.1` before final submission.
- [ ] After store acceptance, commit the final release record and tag `v2.0.1`.

## v1.0.0 launch record

Version 1.0.0 remains publicly available until the stores accept the update:

- [Chrome Web Store](https://chromewebstore.google.com/detail/chat-exporter-by-tom-raz/ljgpghdicijmjojfnhmpefjpipfakoen)
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/chat-exporter-by-tom-raz/nmmpfdnapkfklcbfgcmkahcjcclophhk)
- [Firefox Add-ons](https://addons.mozilla.org/he/firefox/addon/chat-exporter-by-tom-raz/)

Historical v1 evidence remains in [QA_EVIDENCE.md](QA_EVIDENCE.md). It is not a promise that third-party AI sites will never change their page structure.
