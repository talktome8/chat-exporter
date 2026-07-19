# Security Policy

## Supported version

Security fixes are provided for the latest published version. Version `1.0.0` is currently a release candidate.

## Architecture

- Manifest V3 with no background service worker.
- No host permissions and no access to all browsing activity.
- No remote executable code, `eval`, dynamic script loading, analytics or network client.
- User-triggered access through `activeTab` only.
- Exported website content is handled as text; the popup does not inject it with `innerHTML`.
- Links in exported Markdown are limited to HTTP, HTTPS and mailto protocols.

## Reporting

Report vulnerabilities privately through the repository's [Security advisories](https://github.com/talktome8/chat-exporter/security/advisories/new). Use [GitHub Issues](https://github.com/talktome8/chat-exporter/issues) only for non-sensitive bugs, and never include private conversation content, credentials or access tokens.
