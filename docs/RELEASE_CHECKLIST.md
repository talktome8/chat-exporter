# Release checklist

## Product

- [ ] Chrome manual matrix signed by Tom Raz.
- [ ] Edge manual matrix signed by Tom Raz.
- [ ] Firefox installed and manual matrix signed by Tom Raz.
- [ ] Second review confirms all automated and manual evidence.
- [ ] Generated store screenshots are compared with the verified build and accurately reflect its behavior.
- [ ] Chrome, Edge and Firefox store descriptions match actual behavior.

## Privacy and policy

- [ ] Privacy URL is public and matches `PRIVACY.md`.
- [ ] Support and source URLs are public and no longer placeholders.
- [ ] Store privacy answers disclose local website-content processing.
- [ ] Google account two-step verification is enabled.
- [ ] Publisher independently confirms Trader or Non-trader status. Because the extension promotes a professional brand, do not rely on the existing Non-trader selection without reviewing the official definition.
- [ ] No secrets, private chats, cookies, tokens, PEM files or personal screenshots are included.

## Artifact

- [ ] `npm run check` passes from a clean checkout.
- [ ] `dist/chat-exporter-by-tom-raz-1.0.0.zip` is the reviewed artifact.
- [ ] The SHA-256 printed by package verification is stored with the release notes.
- [ ] Git tag `v1.0.0` is created only after both approvals.

## Publication order

1. Publish the GitHub repository and its privacy document.
2. Submit Chrome listing.
3. Submit Microsoft Edge listing.
4. Submit Firefox AMO listing and source/build instructions if requested.
5. Replace Coming soon controls with live, browser-specific store links.
