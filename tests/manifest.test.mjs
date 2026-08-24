import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../extension/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("manifest.json", root), "utf8"));

test("uses a minimal Manifest V3 permission set", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.version, "2.0.0");
  assert.equal(manifest.name, "__MSG_extensionName__");
  assert.ok(manifest.short_name.length <= 12);
  assert.deepEqual(manifest.permissions, ["activeTab", "scripting", "storage"]);
  assert.deepEqual(manifest.host_permissions, [
    "https://chatgpt.com/*", "https://chat.openai.com/*", "https://claude.ai/*",
    "https://gemini.google.com/*", "https://copilot.microsoft.com/*", "https://perplexity.ai/*",
    "https://www.perplexity.ai/*", "https://grok.com/*", "https://x.ai/*"
  ]);
  assert.equal("optional_host_permissions" in manifest, false);
  assert.equal(manifest.background.service_worker, "background.js");
  assert.deepEqual(manifest.background.scripts, ["src/platforms.js", "background.js"]);
  assert.ok(manifest.web_accessible_resources[0].resources.includes("icons/icon48.png"));
  assert.deepEqual(manifest.browser_specific_settings.gecko.data_collection_permissions.required, ["none"]);
});

test("ships every declared icon and locale", async () => {
  for (const icon of Object.values(manifest.icons)) await access(new URL(icon, root));
  for (const icon of ["chatgpt.png", "chatgpt-dark.png", "claude.png", "gemini.png", "copilot.png", "perplexity.png", "grok.png", "grok-dark.png"]) {
    await access(new URL(`platforms/${icon}`, root));
  }
  await access(new URL("_locales/en/messages.json", root));
  await access(new URL("_locales/he/messages.json", root));
});

test("uses clear completeness and recovery language", async () => {
  const copy = await readFile(new URL("src/i18n.js", root), "utf8");
  assert.match(copy, /loaded: "Loaded"/);
  assert.match(copy, /Verify full conversation/);
  assert.match(copy, /Open a supported chat to export it/);
  assert.doesNotMatch(copy, /Unverified/);
});

test("contains no remote code or dangerous evaluation primitives", async () => {
  const files = ["popup.html", "popup.js", "background.js", "content/widget.js", "src/platforms.js", "src/extractor.js", "src/format.js", "src/archive.js", "src/i18n.js"];
  const source = (await Promise.all(files.map((file) => readFile(new URL(file, root), "utf8")))).join("\n");
  assert.doesNotMatch(source, /<script[^>]+https?:|\beval\s*\(|new\s+Function\s*\(|fetch\s*\(|XMLHttpRequest|WebSocket/i);
  assert.doesNotMatch(source, /\.innerHTML\s*=|insertAdjacentHTML|document\.write/i);
});
