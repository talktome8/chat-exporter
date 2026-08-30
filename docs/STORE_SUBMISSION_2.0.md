# Chat Exporter 2.0.1 — store submission copy kit

Use this document with the exact ZIP for each store. Do not rename or rebuild a ZIP after its checksum has been recorded.

## Upload files

| Store | Upload this file |
| --- | --- |
| Chrome Web Store | `dist/chat-exporter-by-tom-raz-2.0.1-chrome.zip` |
| Microsoft Edge Add-ons | `dist/chat-exporter-by-tom-raz-2.0.1-edge.zip` |
| Firefox Add-ons (AMO) | `dist/chat-exporter-by-tom-raz-2.0.1-firefox.zip` |

Checksums are recorded in `dist/SHA256SUMS-2.0.1.txt` after the final release gate.

## URLs

- Homepage: `https://chat-exporter.raztom.com/`
- Privacy policy: `https://chat-exporter.raztom.com/privacy`
- Support: `https://github.com/talktome8/chat-exporter/issues`
- Source code: `https://github.com/talktome8/chat-exporter`
- Security reports: `https://github.com/talktome8/chat-exporter/security/advisories/new`

## English listing — copy and paste

### Name

Chat Exporter by Tom Raz

### Short description / summary

Export AI chats to Markdown or text locally, with full-chat verification and safe ZIPs for long conversations.

### Detailed description

Chat Exporter creates a clean local copy of an AI conversation without repetitive copy and paste.

Use the Chat Exporter quick action directly inside a supported AI chat, or open the toolbar popup as a full fallback. Choose user messages, AI responses, metadata and the conversation URL, then export to Markdown, plain text or the clipboard.

When completeness matters, run a full-conversation scan. Chat Exporter reports Loaded, Complete or Partial instead of silently claiming that every message was captured. A partial export requires explicit confirmation and is clearly marked.

Long conversations are supported. When the selected UTF-8 content exceeds 10 MiB, the extension creates one ZIP containing numbered parts. Messages are split only between turns, never in the middle. The ZIP includes a manifest with message counts, part ranges, byte sizes, settings and SHA-256 hashes.

Supported services:
- ChatGPT
- Claude
- Gemini
- Microsoft Copilot
- Perplexity

Key features:
- Automatic in-chat quick action plus a complete toolbar popup
- Markdown and plain-text export
- Copy to clipboard
- User/AI role filters and optional metadata or URL
- Full-conversation progress, cancellation and completeness reporting
- Legitimate repeated prompts are preserved
- Overlapping page selectors are collapsed without duplicating turns
- Large-conversation ZIPs with counts and SHA-256 verification
- English and Hebrew interface with RTL support
- Light and dark theme support
- Local processing with no account, analytics, advertising or remote executable code

AI websites can change their page structure. If a site prevents the extension from proving completeness, Chat Exporter marks the result Partial or Loaded and explains why.

### Single purpose

Export conversations from supported AI-chat websites to local Markdown or plain-text files, the clipboard, or a verified multi-part ZIP for very large conversations.

### Release notes

Version 2.0.1 fixes the toolbar popup collapsing to its header and footer in Chromium browsers. All 2.0 export, verification, ZIP, widget and privacy features remain unchanged.

### Reviewer notes

1. Open a conversation on ChatGPT, Claude, Gemini, Copilot or Perplexity. The extension does not implement or bypass the service login; reviewers may use their own test account.
2. Reload the chat page once after installing the update. The Chat Exporter icon should appear automatically near the composer; if an anchor is unavailable, it appears as a floating button.
3. Open the in-chat panel or toolbar popup. Quick export reports Loaded and shows the messages currently present in the page.
4. Select Verify full conversation to exercise progress, cancellation and Complete/Partial reporting.
5. Select Markdown or Text, then Download or Copy. Partial downloads require confirmation.
6. Settings can disable the widget per service; all five service toggles are enabled by default.

The package makes no extension-originated network requests, contains no analytics or remote code, and does not store conversation content or conversation URLs.

## Permission and privacy fields — copy and paste

### `activeTab` justification

Provides the toolbar-popup fallback after the user deliberately invokes the extension on the current tab. It is used only to inspect and export the active conversation.

### `scripting` justification

Runs the extractor bundled in the reviewed extension package and registers or removes the in-chat widget according to the user's local per-service settings. No remote script is downloaded or executed.

### `storage` justification

Stores `settingsV2` locally: language, enabled services, default format, selected message roles, metadata and URL choices, default scan mode, and dismissed help notices. Conversation content, exported text and conversation URLs are not stored.

### Host/site access justification

Required access is limited to the explicitly listed ChatGPT, Claude, Gemini, Copilot and Perplexity domains. It allows the Chat Exporter quick action to appear automatically and read the loaded conversation only on those services. No wildcard access to unrelated websites is requested.

### Remote code

No. All executable code and assets are included in the submitted package. The extension does not download or evaluate remote code.

### Data handling disclosure

The extension handles website content, user-generated prompts, personal communications in AI chats, and the current page URL locally to provide the export feature. These data are not transmitted, sold, shared, used for advertising, used for credit decisions, or used for purposes unrelated to the extension's single purpose. Only non-content preferences in `settingsV2` are persisted locally.

### Chrome/Edge privacy certifications

- Do not sell or transfer user data to third parties: Yes
- Do not use or transfer user data for purposes unrelated to the single purpose: Yes
- Do not use or transfer user data to determine creditworthiness or lending: Yes
- Remote code: No
- Analytics: No
- Advertising: No
- Account/login implemented by the extension: No

If the dashboard asks which data types are handled, disclose Website content and Personal communications. Disclose Web browsing activity/current page URL if that wording is offered, and explain that only the current supported AI-chat page is accessed and nothing is transmitted. Local-only processing still requires disclosure.

## Hebrew listing — copy and paste

### שם

Chat Exporter by Tom Raz

### תיאור קצר

ייצוא שיחות AI ל־Markdown או לטקסט באופן מקומי, עם אימות שיחה מלאה ו־ZIP בטוח לשיחות ארוכות.

### תיאור מלא

Chat Exporter יוצר עותק מקומי, נקי וקריא של שיחת AI בלי העתקה והדבקה חוזרות.

אפשר להשתמש בפעולת Chat Exporter ישירות בתוך צ׳אט AI נתמך, או לפתוח את חלון התוסף הרגיל כגיבוי מלא. בוחרים הודעות משתמש, תגובות AI, מטא־דאטה וכתובת שיחה, ואז מייצאים ל־Markdown, לטקסט פשוט או ללוח.

כאשר השלמות חשובה, מפעילים סריקה של השיחה המלאה. התוסף מציג Loaded, Complete או Partial ואינו טוען בשקט שכל ההודעות נאספו. ייצוא חלקי דורש אישור מפורש ומסומן בבירור.

שיחות ארוכות נתמכות. כאשר התוכן שנבחר גדול מ־10MiB ב־UTF-8, התוסף יוצר ZIP יחיד עם חלקים ממוספרים. הפיצול מתבצע רק בין הודעות ולעולם לא באמצע הודעה. ה־ZIP כולל manifest עם ספירות, טווחי הודעות, גדלים, הגדרות ו־SHA-256 לכל חלק.

שירותים נתמכים: ChatGPT, Claude, Gemini, Microsoft Copilot ו־Perplexity.

כל העיבוד מתבצע במכשיר. אין חשבון תוסף, אנליטיקה, פרסום, שרת שיחות או קוד מרוחק.

### מטרת התוסף

ייצוא שיחות מאתרי צ׳אט AI נתמכים לקובצי Markdown או טקסט מקומיים, ללוח, או ל־ZIP מאומת ורב־חלקים עבור שיחות גדולות מאוד.

### הערות לגרסה

גרסה 2.0.1 מתקנת מצב שבו חלון התוסף מסרגל הכלים הצטמצם לכותרת ולשורת הפרטיות בלבד בדפדפני Chromium. כל יכולות הייצוא, האימות, ה־ZIP, הווידג׳ט והפרטיות של 2.0 נשארו ללא שינוי.

## Store-specific selections

### Chrome Web Store

- Dashboard: `https://chrome.google.com/webstore/devconsole`
- Category: Productivity
- Language: English; add Hebrew as a localized listing
- Mature content: No
- Visibility: Public
- Store icon: `extension/icons/icon128.png`
- Screenshots: `store-assets/en/01.png` through `05.png`; duplicate with `store-assets/he/01.png` through `05.png` for Hebrew
- Small promo tile: `store-assets/promo-small-440x280.png`
- Marquee tile: `store-assets/promo-marquee-1400x560.png`

### Microsoft Edge Add-ons

- Partner Center: `https://partner.microsoft.com/dashboard/microsoftedge/overview`
- Category: Productivity
- Visibility: Public
- Markets: All available markets
- Search terms: `AI chat export, Markdown export, conversation export, ChatGPT export, Gemini export`
- Logo: `extension/icons/icon128.png`
- Screenshots: the matching five English and Hebrew assets under `store-assets/`
- Notes for certification: paste the English Reviewer notes above

### Firefox Add-ons (AMO)

- Developer hub: `https://addons.mozilla.org/developers/addons`
- Distribution: On this site (AMO)
- Platform: Firefox for desktop
- Categories: Productivity; Other
- License: MIT
- Source-code submission: No separate source archive is required. The submitted extension is readable, unminified JavaScript with no transpilation, bundling or obfuscation.
- Notes for reviewers: paste the English Reviewer notes above
- Firefox data collection: None (`browser_specific_settings.gecko.data_collection_permissions.required` is `none`)

## Final submission sequence

1. Run `npm run check` and confirm `Release readiness PASS — Chat Exporter 2.0.1`.
2. Compare the three printed SHA-256 values with `dist/SHA256SUMS-2.0.1.txt`.
3. Upload only the browser-specific ZIP listed at the top of this document.
4. Paste the listing, privacy, permission and reviewer text from this document.
5. Upload the matching screenshots and tiles.
6. Stop before the final Publish/Submit button if any dashboard field contradicts this document or reports a version other than 2.0.1.
