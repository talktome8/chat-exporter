import AdmZip from "adm-zip";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const sourceRoot = path.resolve("extension");
const manifest = JSON.parse(await readFile(path.join(sourceRoot, "manifest.json"), "utf8"));
const artifact = path.resolve("dist", `chat-exporter-by-tom-raz-${manifest.version}.zip`);
const zip = new AdmZip(artifact);
const entries = zip.getEntries().filter((entry) => !entry.isDirectory).sort((a, b) => a.entryName.localeCompare(b.entryName));

async function sourceFiles(directory, prefix = "") {
  const found = [];
  for (const name of (await readdir(directory)).sort()) {
    const absolute = path.join(directory, name);
    const relative = path.posix.join(prefix, name);
    if ((await stat(absolute)).isDirectory()) found.push(...await sourceFiles(absolute, relative));
    else found.push({ absolute, relative });
  }
  return found;
}

const files = await sourceFiles(sourceRoot);
const entryNames = entries.map((entry) => entry.entryName);
const sourceNames = files.map((file) => file.relative).sort();
if (JSON.stringify(entryNames) !== JSON.stringify(sourceNames)) throw new Error("ZIP file list does not match extension source");

for (const file of files) {
  const source = await readFile(file.absolute);
  const packed = zip.readFile(file.relative);
  if (!packed || !source.equals(packed)) throw new Error(`ZIP content mismatch: ${file.relative}`);
}

const packageBytes = await readFile(artifact);
const sha256 = createHash("sha256").update(packageBytes).digest("hex");
console.log(`Verified ${entries.length} files`);
console.log(`SHA-256 ${sha256}`);
