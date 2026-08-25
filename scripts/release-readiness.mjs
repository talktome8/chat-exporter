import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";

const root = process.cwd();
const expectedVersion = "2.0.0";
const browsers = ["chrome", "edge", "firefox"];

async function json(relative) {
  return JSON.parse(await readFile(path.join(root, relative), "utf8"));
}

async function text(relative) {
  return readFile(path.join(root, relative), "utf8");
}

function pngSize(buffer) {
  assert.equal(buffer.subarray(1, 4).toString("ascii"), "PNG", "Asset is not a PNG");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const packageJson = await json("package.json");
const sourceManifest = await json("extension/manifest.json");
assert.equal(packageJson.version, expectedVersion, "package.json version mismatch");
assert.equal(sourceManifest.version, expectedVersion, "extension manifest version mismatch");
assert.deepEqual(sourceManifest.permissions, ["activeTab", "scripting", "storage"]);
assert.ok(sourceManifest.host_permissions.length > 0, "Automatic widget requires explicit site access");
assert.ok(!sourceManifest.host_permissions.some((host) => /grok|x\.ai/i.test(host)), "Grok host access must not ship in the 2.0 package");
assert.ok(!sourceManifest.host_permissions.some((host) => host.includes("*://*/*")), "Wildcard host access is forbidden");

const sourceFiles = await readdir(path.join(root, "extension"), { recursive: true });
assert.ok(!sourceFiles.some((file) => /mistral/i.test(file)), "Mistral must not ship in the 2.0 extension package");
assert.ok(!sourceFiles.some((file) => /grok/i.test(file)), "Grok must not ship in the 2.0 extension package");
assert.ok(!sourceFiles.some((file) => /(?:^|[\\/])(TODO|FIXME)(?:[.\\/]|$)/i.test(file)), "Unfinished marker file in extension");
for (const file of sourceFiles.filter((name) => /\.(?:js|html|css|json)$/i.test(name))) {
  const body = await text(path.join("extension", file));
  assert.doesNotMatch(body, /\b(?:TODO|FIXME|HACK)\b/i, `Unfinished marker in extension/${file}`);
}

const privacy = await text("PRIVACY.md");
const storeCopy = await text("docs/STORE_SUBMISSION_2.0.md");
assert.match(privacy, /settingsV2/);
assert.match(privacy, /host access/i);
assert.match(storeCopy, /2\.0\.0/);
assert.match(storeCopy, /activeTab/);
assert.match(storeCopy, /Supported services:[\s\S]*Perplexity/i);
assert.doesNotMatch(storeCopy, /Grok/i);
assert.doesNotMatch(storeCopy, /Mistral/i);
assert.doesNotMatch(storeCopy, /only (?:the )?language preference/i);

const renderedHome = await text("out/index.html");
const renderedPrivacy = await text("out/privacy.html");
assert.match(renderedHome, /Version 2\.0\.0/);
assert.doesNotMatch(renderedHome, /Grok/);
assert.doesNotMatch(renderedHome, /Mistral/);
assert.match(renderedPrivacy, /settingsV2/);
assert.match(renderedPrivacy, /five explicitly listed AI-chat services/);

const expectedAssets = [
  ["extension/icons/icon128.png", 128, 128],
  ["store-assets/promo-small-440x280.png", 440, 280],
  ["store-assets/promo-marquee-1400x560.png", 1400, 560],
  ...["en", "he"].flatMap((locale) => Array.from({ length: 5 }, (_, index) => [`store-assets/${locale}/${String(index + 1).padStart(2, "0")}.png`, 1280, 800]))
];
for (const [relative, width, height] of expectedAssets) {
  const size = pngSize(await readFile(path.join(root, relative)));
  assert.deepEqual(size, { width, height }, `Unexpected dimensions for ${relative}`);
}

const checksums = [];
for (const browser of browsers) {
  const targetManifest = await json(`dist/extension-builds/${browser}/manifest.json`);
  assert.equal(targetManifest.version, expectedVersion, `${browser} target version mismatch`);
  if (browser === "firefox") assert.ok(targetManifest.browser_specific_settings?.gecko, "Firefox metadata missing");
  else assert.equal("browser_specific_settings" in targetManifest, false, `${browser} includes Firefox-only metadata`);
  const archiveName = `chat-exporter-by-tom-raz-${expectedVersion}-${browser}.zip`;
  const archivePath = path.join(root, "dist", archiveName);
  const archiveBytes = await readFile(archivePath);
  const archive = new AdmZip(archiveBytes);
  const entries = archive.getEntries();
  assert.ok(entries.some((entry) => entry.entryName === "manifest.json"), `${archiveName} has no root manifest`);
  assert.ok(!entries.some((entry) => /^(?:node_modules|dist|\.git)\//.test(entry.entryName)), `${archiveName} contains forbidden files`);
  const archivedManifest = JSON.parse(archive.readAsText("manifest.json"));
  assert.equal(archivedManifest.version, expectedVersion, `${archiveName} archived version mismatch`);
  checksums.push(`${createHash("sha256").update(archiveBytes).digest("hex")}  ${archiveName}`);
}

const recordedChecksums = (await text(`dist/SHA256SUMS-${expectedVersion}.txt`)).trim().split(/\r?\n/).sort();
assert.deepEqual(recordedChecksums, [...checksums].sort(), "Recorded package checksums do not match the final ZIPs");

console.log(`Release readiness PASS — Chat Exporter ${expectedVersion}`);
console.log(checksums.join("\n"));
