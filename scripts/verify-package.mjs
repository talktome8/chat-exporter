import AdmZip from "adm-zip";
import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const manifest = JSON.parse(await readFile(path.resolve("extension/manifest.json"), "utf8"));
const artifactVersion = manifest.version;

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

const checksumLines = [];
for (const target of ["chrome", "edge", "firefox"]) {
  const sourceRoot = path.resolve("dist/extension-builds", target);
  const artifact = path.resolve("dist", `chat-exporter-by-tom-raz-${artifactVersion}-${target}.zip`);
  const zip = new AdmZip(artifact);
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory).sort((a, b) => a.entryName.localeCompare(b.entryName));
  const files = await sourceFiles(sourceRoot);
  const entryNames = entries.map((entry) => entry.entryName);
  const sourceNames = files.map((file) => file.relative).sort();
  if (JSON.stringify(entryNames) !== JSON.stringify(sourceNames)) throw new Error(`${target} ZIP file list does not match extension source`);
  for (const file of files) {
    const source = await readFile(file.absolute);
    const packed = zip.readFile(file.relative);
    if (!packed || !source.equals(packed)) throw new Error(`${target} ZIP content mismatch: ${file.relative}`);
  }
  const packageBytes = await readFile(artifact);
  const sha256 = createHash("sha256").update(packageBytes).digest("hex");
  checksumLines.push(`${sha256}  ${path.basename(artifact)}`);
  console.log(`Verified ${target}: ${entries.length} files`);
  console.log(`SHA-256 ${sha256}`);
}
await writeFile(path.resolve("dist", `SHA256SUMS-${artifactVersion}.txt`), `${checksumLines.join("\n")}\n`, "utf8");
