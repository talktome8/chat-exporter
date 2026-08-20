# Chat Exporter — post-2.0 roadmap

These ideas are intentionally not part of the stabilization beta. They should be implemented only after the 2.0 UAT gate passes.

## 2.1 — local navigation helpers

- Optional favorites for selected AI services and conversations.
- A recent-exports list containing only platform, title, export time, and source URL; never conversation content unless the user explicitly opts in.
- A clear **Open source conversation** action in the extension UI and exported metadata when URL export is enabled.
- Safari Web Extension conversion, signing, packaging, and a separate Safari UAT matrix.

## 3.0 — local agent bridge

- An optional local companion using Native Messaging or MCP.
- Explicit per-action consent before a local agent reads or exports a conversation.
- A local encrypted index for user-selected exports, with retention and deletion controls.
- Search across selected chats by platform, title, date, and local content, with direct links back to the source.
- No cloud backend and no automatic collection of browser conversations.

## Architecture guardrails

- Keep DOM adapters and the export engine independent from popup, widget, and future agent interfaces.
- Prefer documented page structures and rendered accessibility/DOM content. Framework-internal React state may be considered only as a versioned, tested fallback because it is private and unstable.
- Any new interface must reuse the same completeness, deduplication, filtering, splitting, and manifest rules as the current popup and widget.
