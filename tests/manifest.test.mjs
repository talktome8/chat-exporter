import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../extension/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("manifest.json", root), "utf8"));

test("uses a minimal Manifest V3 permission set", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.version, "1.0.0");
  assert.equal(manifest.name, "__MSG_extensionName__");
  assert.deepEqual(manifest.permissions, ["activeTab", "scripting", "storage"]);
  assert.equal("host_permissions" in manifest, false);
  assert.equal("web_accessible_resources" in manifest, false);
  assert.equal("background" in manifest, false);
  assert.deepEqual(manifest.browser_specific_settings.gecko.data_collection_permissions.required, ["none"]);
});

test("ships every declared icon and locale", async () => {
  for (const icon of Object.values(manifest.icons)) await access(new URL(icon, root));
  await access(new URL("_locales/en/messages.json", root));
  await access(new URL("_locales/he/messages.json", root));
});

test("contains no remote code or dangerous evaluation primitives", async () => {
  const files = ["popup.html", "popup.js", "src/extractor.js", "src/format.js", "src/i18n.js"];
  const source = (await Promise.all(files.map((file) => readFile(new URL(file, root), "utf8")))).join("\n");
  assert.doesNotMatch(source, /<script[^>]+https?:|\beval\s*\(|new\s+Function\s*\(|fetch\s*\(|XMLHttpRequest|WebSocket/i);
  assert.doesNotMatch(source, /\.innerHTML\s*=|insertAdjacentHTML|document\.write/i);
});
