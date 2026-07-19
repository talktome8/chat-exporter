# Store listing — v1.0.0

## Product name

Chat Exporter by Tom Raz

## Short description

Export AI conversations to Markdown or text, locally in your browser.

## Detailed description

Chat Exporter helps you keep a clean local copy of an AI conversation without repetitive copy-paste.

Open a supported conversation, click the extension, review its completeness status, choose the content and format, then download or copy the result.

Verified launch support:

- ChatGPT
- Claude
- Gemini
- Microsoft Copilot
- Perplexity

Beta support:

- Grok
- Mistral

Features:

- Markdown and plain-text export
- Copy to clipboard
- Optional user/assistant message filters
- Optional title, model, date and conversation URL
- Controlled loading of earlier messages
- Complete, partial or unverified status instead of a silent completeness claim
- English and Hebrew interface
- Local processing with no account, analytics or remote executable code

The extension uses access to the active tab only after you click it. Conversation content is not sent to Tom Raz or a third party.

## Single purpose

Export the AI conversation in the active tab to a local text-based format.

## Permission justifications

- `activeTab`: temporarily read the conversation in the tab where the user invokes the extension.
- `scripting`: run the extractor bundled in the reviewed package after the user click.
- `storage`: remember the English/Hebrew UI preference locally.

## Reviewer notes

1. Open a conversation on one of the verified platforms.
2. Click the toolbar icon.
3. Wait while earlier messages are checked.
4. Confirm that the popup reports Complete, Partial or Unverified.
5. Select Markdown or plain text and press Download, or press Copy.

No login is implemented by the extension. Reviewers may use their own account on the supported AI service. The package makes no extension-originated network requests.

## Privacy disclosures

- Website content: accessed locally to provide the export feature.
- Web browsing activity: the active page URL can be read and is added to the export only if the user selects that option.
- Data sale, advertising, credit and unrelated use: no.
- Data transmission: no extension-originated transmission.
- Data storage: only the interface language preference is stored locally.

## Required URLs before submission

- Product: `https://raztom.com/chat-exporter`
- Privacy: `https://raztom.com/chat-exporter/privacy`
- Support: insert the public GitHub Issues or support URL after the repository opens.
- Source: insert the public repository URL after it opens.

Do not submit while either required URL is a placeholder.
