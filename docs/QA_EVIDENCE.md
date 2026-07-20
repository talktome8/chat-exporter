# QA evidence — release candidate 1.0.0

## Automated evidence

Run date: 2026-07-20

- `npm run check`: passed.
- JavaScript, manifest, formatter and extractor tests: 16 passed, 0 failed.
- `web-ext lint --warnings-as-errors`: 0 errors, 0 warnings, 0 notices.
- Production dependency audit: 0 vulnerabilities.
- Verified artifact: `dist/chat-exporter-by-tom-raz-1.0.0.zip`.
- SHA-256: `6e868ee25492bf505b04e1e44c80d7f3f3d196b43704a11ec5b8e5584dc89997`.

## Firefox evidence

- Firefox executable detected: `C:\Program Files\Mozilla Firefox\firefox.exe`.
- 2026-07-20: `web-ext run` opened Firefox with a new temporary profile and installed `extension/` as a temporary add-on.
- Live platform checks are pending a user sign-in to non-personal test conversations. No personal chat, credential or session content is recorded as release evidence.

## Remaining manual gate

Complete the verified-platform matrix in Chrome, Edge and Firefox using anonymous test conversations before tagging or submitting the release.
