# Chat Exporter project notes

- Extension source is in `extension/`; `src/platforms.js` defines supported site adapters, `src/extractor.js` scans and merges turns, `src/format.js` renders MD/TXT, and `src/archive.js` creates split ZIP exports. The toolbar UI is `popup.*`; the in-chat UI is `content/widget.js` and is registered by `background.js`.
- The website is a static Next.js app in `app/`. Store submission text is in `docs/STORE_SUBMISSION_2.0.md`.
- Keep package, extension manifest, release-readiness script, store text and website version synchronized for each release. Never edit generated `dist/` archives by hand.
- Run `npm run check` before handing off release ZIPs. It covers lint, tests, Firefox extension lint, browser packages, website build, store kit and SHA-256 verification.
- After packaging, `npm run qa:firefox-smoke` temporarily installs the Firefox ZIP in an isolated profile and checks an actual download. It does not replace live Chrome/Edge or authenticated long-chat UAT.
- Download and Copy in both extension UIs must attempt a full scan. If the page cannot establish completeness, require explicit confirmation and mark the file and ZIP manifest as incomplete. Never drop legitimate repeated messages or claim completeness from a quick preview.
- Research-source URLs should be preserved only when exposed as safe HTTP(S) or mailto links in the rendered chat; do not infer hidden service data or make remote requests.
- `dist/`, user conversation content and credentials are not committed. A verified code change does not authorize publishing to the stores or deploying the website.
