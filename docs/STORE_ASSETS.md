# Store asset delivery guide

All assets are generated locally with `npm run assets:store`. They contain an anonymous demonstration conversation and no account or personal data.

## Chrome Web Store

- Upload `store-assets/en/01.png` through `05.png` for English.
- Upload `store-assets/he/01.png` through `05.png` for Hebrew.
- Upload `store-assets/promo-small-440x280.png` as the required small promotional tile.
- Upload `store-assets/promo-marquee-1400x560.png` as the optional marquee tile.
- Use `extension/icons/icon128.png` as the 128×128 store icon.

Chrome accepts one to five localized screenshots at 1280×800 or 640×400. These files use the preferred 1280×800 size.

## Microsoft Edge Add-ons

- Reuse the five English and five Hebrew screenshots above for their matching locales.
- Reuse both promotional tiles.
- Use `extension/icons/icon128.png` as the extension logo.

Edge accepts up to six screenshots per language at 1280×800 or 640×480. The generated 1280×800 files are compatible.

## Firefox AMO

- Reuse the five screenshots for the selected listing locale.
- Upload the extension icon from `extension/icons/icon128.png`.
- Keep the privacy policy and support links in the listing even though conversation data is not transmitted.

AMO does not impose a practical screenshot-count limit, but each image should demonstrate a distinct feature. Five is sufficient for this release.

## Screenshot order

1. Instant export of already-loaded messages.
2. Markdown, plain-text and clipboard formats.
3. Optional full-conversation verification.
4. Local-only privacy model.
5. Official and beta platform support.

## Public links

- Homepage/source: `https://github.com/talktome8/chat-exporter`
- Privacy: `https://github.com/talktome8/chat-exporter/blob/main/PRIVACY.md`
- Support: `https://github.com/talktome8/chat-exporter/issues`

The personal portfolio is optional and is not needed for the initial submission.
