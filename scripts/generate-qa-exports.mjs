import assert from "node:assert/strict";
import { createHash, webcrypto } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import AdmZip from "adm-zip";

const outputRoot = path.resolve("dist/qa-exports-2.0.0");
await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const context = vm.createContext({ Intl, Date, Blob, TextEncoder, Uint8Array, Uint32Array, DataView, Array, JSON, crypto: webcrypto });
vm.runInContext(await readFile(path.resolve("extension/src/format.js"), "utf8"), context);
vm.runInContext(await readFile(path.resolve("extension/src/archive.js"), "utf8"), context);

const baseMessages = [
  { role: "user", text: "בדיקת QA חוזרת: export this message." },
  { role: "assistant", text: "1. First\n2. Second\n\n| Item | Status |\n| --- | --- |\n| שלום | Pass |\n\n```js\nconsole.log('ok');\n```" },
  { role: "user", text: "בדיקת QA חוזרת: export this message." },
  { role: "assistant", text: "Repeated prompts remain separate. [Safe link](https://example.com)." }
];
const baseOptions = {
  extraction: { platform: "ChatGPT", adapter: "chatgpt", title: "Chat Exporter QA", model: "GPT-5.5", completeness: "complete", messages: baseMessages },
  includeUser: true, includeAssistant: true, includeMeta: true, includeUrl: true,
  currentUrl: "https://chatgpt.com/c/qa", format: "md", language: "en", date: new Date("2026-08-07T09:00:00Z")
};

const markdown = await context.ChatExporterArchive.createExportPackage(baseOptions);
assert.equal(markdown.kind, "file");
await writeFile(path.join(outputRoot, markdown.filename), Buffer.from(await markdown.blob.arrayBuffer()));

const textExport = await context.ChatExporterArchive.createExportPackage({ ...baseOptions, format: "txt", includeUser: false, includeUrl: false });
assert.equal(textExport.kind, "file");
await writeFile(path.join(outputRoot, textExport.filename), Buffer.from(await textExport.blob.arrayBuffer()));

const largeMessages = Array.from({ length: 60 }, (_, index) => ({ role: index % 2 ? "assistant" : "user", text: `${index}:${"x".repeat(180)}` }));
const zipPack = await context.ChatExporterArchive.createExportPackage({ ...baseOptions, extraction: { ...baseOptions.extraction, title: "Chat Exporter split QA", messages: largeMessages } }, { maxBytes: 1500 });
assert.equal(zipPack.kind, "zip");
const zipPath = path.join(outputRoot, zipPack.filename);
await writeFile(zipPath, Buffer.from(await zipPack.blob.arrayBuffer()));

const zip = new AdmZip(zipPath);
const manifest = JSON.parse(zip.readAsText("manifest.json"));
assert.equal(manifest.totalMessages, largeMessages.length);
assert.equal(manifest.parts.reduce((sum, part) => sum + part.messageCount, 0), largeMessages.length);
for (const part of manifest.parts) {
  const bytes = zip.readFile(part.name);
  assert.ok(bytes);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), part.sha256);
  assert.equal(bytes.length, part.bytes);
  assert.ok(part.bytes <= 1500 || (part.messageCount === 1 && part.oversized));
}

const report = {
  generatedAt: new Date().toISOString(),
  files: (await Promise.all([markdown.filename, textExport.filename, zipPack.filename].map(async (name) => {
    const bytes = await readFile(path.join(outputRoot, name));
    return { name, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
  }))),
  zip: { messages: manifest.totalMessages, userMessages: manifest.userMessages, assistantMessages: manifest.assistantMessages, parts: manifest.parts.length, hashesVerified: true }
};
await writeFile(path.join(outputRoot, "qa-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(outputRoot);
