# Changelog

All notable changes to Chat Exporter are documented here.

## 2.0.2 — Safer full exports and widget control 2026-09-27

- Move the in-chat button outside the message composer and let users hide or restore it per service.
- Start a full scan before Download or Copy from either the widget or toolbar popup; clearly mark and confirm any unverified export.
- Preserve research-source links in Markdown and plain text, including icon-only links with accessible labels.
- Wait for lazy-loaded history at both boundaries, conservatively report uncertain window merges as partial, and reject ZIPs that exceed the ZIP32 format limit instead of creating corrupt files.

## 2.0.1 — Popup hotfix 2026-08-31

- Fixed the toolbar popup collapsing to header and footer only in Chromium browsers.
- Added a regression test that forbids viewport-relative popup height.

## 2.0.0 — Store submission candidate 2026-08-20

- Added an automatic in-chat quick action using the Chat Exporter icon, isolated Shadow DOM UI and light/dark theme support.
- Preserved legitimate repeated messages while removing duplicates caused by overlapping selectors and virtualized DOM windows.
- Added resumable full-conversation scanning with progress, cancellation and explicit Complete, Partial and Loaded states.
- Added ZIP splitting above 10 MiB with numbered Markdown/text parts, counts, SHA-256 hashes and `manifest.json`.
- Expanded local settings and release, privacy, security and regression verification.

## 1.0.0 — Released 2026-07-31

Available now on [Chrome](https://chromewebstore.google.com/detail/chat-exporter-by-tom-raz/ljgpghdicijmjojfnhmpefjpipfakoen), [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/chat-exporter-by-tom-raz/nmmpfdnapkfklcbfgcmkahcjcclophhk), and [Firefox](https://addons.mozilla.org/he/firefox/addon/chat-exporter-by-tom-raz/).

- Local export to Markdown, plain text, or the clipboard.
- Verified support for ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity.
- Optional full-conversation verification with complete, partial, and unknown status reporting.
- English and Hebrew (RTL) interface.
- No account, analytics, server, remote executable code, advertising, or donation prompts.
