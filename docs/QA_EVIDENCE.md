# QA evidence — release candidate 1.0.0

## Automated evidence

Run date: 2026-07-21

- `npm run check`: passed.
- JavaScript, manifest, formatter and extractor tests: 19 passed, 0 failed.
- `web-ext lint --warnings-as-errors`: 0 errors, 0 warnings, 0 notices.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities.
- Static product-site build and rendered-page checks: passed.
- Verified artifact: `dist/chat-exporter-by-tom-raz-1.0.0.zip`.
- SHA-256: `e4b9a7872207ed3a15d2583e3ae30be359da7fb15a485f70eb7e21f8fbf8dbf7`.
- Package source, manifest, permissions and generated ZIP were compared byte-for-byte by `npm run extension:verify`.
- Repository scan found no tracked build output, archive, log, `node_modules` directory or common secret pattern.

## Firefox evidence

- Firefox executable detected: `C:\Program Files\Mozilla Firefox\firefox.exe`.
- 2026-07-20: `web-ext run` opened Firefox with a new temporary profile and installed `extension/` as a temporary add-on.
- 2026-07-20: an anonymous short ChatGPT conversation was detected, exported as Markdown and shown as Complete in the temporary Firefox profile. Copy, plain-text export, filters, metadata and RTL were also confirmed in the same test session.
- 2026-07-21: an anonymous Grok conversation was detected in Firefox, marked Complete and copied successfully to the clipboard. The result remained clearly labelled Beta for manual accuracy review.
- 2026-07-21: an anonymous Grok conversation was detected in Firefox, marked Complete and copied successfully to the clipboard. The result remained clearly labelled Beta for manual accuracy review.

## Remaining live gate

Run the verified-platform matrix in Chrome, Edge and Firefox using anonymous test conversations before tagging or submitting the release. Grok and Mistral are not included in public support material until their live tests pass.
