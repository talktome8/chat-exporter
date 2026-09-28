# Firefox 2.0.2 source and reproducible build

This source archive contains the unminified extension source, the two packaging
scripts, and the npm lockfile. No JavaScript, CSS, or HTML is transpiled,
bundled, minified, or generated. The preparation script only copies the
extension files and removes the Chromium `background.service_worker` entry
from Firefox's `manifest.json`; the other browser targets have their Firefox
manifest entries removed instead.

Build environment used for the submitted package: Windows 11, Node.js
22.14.0, npm 10.9.2. Node.js 22.13.0 or newer is required. Obtain Node.js
from https://nodejs.org/ and use the npm version bundled with it. npm installs
the exact dependencies recorded in `package-lock.json`, including `archiver`.

From the root of this source archive:

1. Run `npm ci` (on PowerShell, use `npm.cmd ci` if script execution is blocked).
2. Run `npm run extension:package` (or `npm.cmd run extension:package`). This
   runs `scripts/prepare-extension-targets.mjs` and then
   `scripts/package-extension.mjs`; it requires no credentials or environment
   variables.
3. The Firefox package is `dist/chat-exporter-by-tom-raz-2.0.2-firefox.zip`.
   Its expected SHA-256 is
   `00c69c4db0277bdfbf410d35e13bc9795567eef065cab50d99995a457c384265`.
   On PowerShell, verify with
   `Get-FileHash dist/chat-exporter-by-tom-raz-2.0.2-firefox.zip -Algorithm SHA256`.

The website and test suite are not needed to reproduce the submitted add-on.
