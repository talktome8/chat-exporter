# Security Policy

## Supported version

Security fixes are provided for the latest published version. Version `2.0.2` is the current store-submission candidate; store publication status may differ until review is complete.

## Architecture

- Manifest V3 with a background service worker for widget registration.
- Host access is limited to the supported AI-chat domains; no wildcard access to all browsing activity.
- No remote executable code, `eval`, dynamic script loading, analytics or network client.
- User-triggered toolbar access uses `activeTab`; the optional per-service widget uses the listed host permissions.
- Exported website content is handled as text; the popup does not inject it with `innerHTML`.
- Links in exported Markdown are limited to HTTP, HTTPS and mailto protocols.

## Reporting

Report vulnerabilities privately through the repository's [Security advisories](https://github.com/talktome8/chat-exporter/security/advisories/new). Use [GitHub Issues](https://github.com/talktome8/chat-exporter/issues) only for non-sensitive bugs, and never include private conversation content, credentials or access tokens.
