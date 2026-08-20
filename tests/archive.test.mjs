import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import AdmZip from "adm-zip";

const formatSource = await readFile(new URL("../extension/src/format.js", import.meta.url), "utf8");
const archiveSource = await readFile(new URL("../extension/src/archive.js", import.meta.url), "utf8");
const context = vm.createContext({ Intl, Date, Blob, TextEncoder, Uint8Array, Uint32Array, DataView, Array, JSON, crypto: webcrypto });
vm.runInContext(formatSource, context);
vm.runInContext(archiveSource, context);

function options(messages, overrides = {}) {
  return {
    extraction: { platform: "ChatGPT", adapter: "chatgpt", title: "Long chat", model: "GPT-5", completeness: "complete", messages },
    includeUser: true, includeAssistant: true, includeMeta: true, includeUrl: true,
    currentUrl: "https://chatgpt.com/c/test", format: "md", language: "en",
    date: new Date("2026-08-05T10:00:00Z"), ...overrides
  };
}

test("keeps repeated messages and splits only between message boundaries", () => {
  const messages = [
    { role: "user", text: "repeat" }, { role: "assistant", text: "a" },
    { role: "user", text: "repeat" }, { role: "assistant", text: "b" }
  ];
  const split = context.ChatExporterArchive.splitConversation(options(messages).extraction, options(messages), 180);
  assert.equal(split.messages.length, 4);
  assert.ok(split.parts.length > 1);
  assert.equal(split.parts.reduce((sum, part) => sum + part.count, 0), 4);
  assert.equal(split.parts.map((part) => part.content).join("\n").match(/repeat/g)?.length, 2);
});

test("creates a ZIP with numbered parts, hashes and a verifiable manifest", async () => {
  const messages = Array.from({ length: 40 }, (_, index) => ({ role: index % 2 ? "assistant" : "user", text: `message-${index}-${"x".repeat(80)}` }));
  const pack = await context.ChatExporterArchive.createExportPackage(options(messages), { maxBytes: 700 });
  assert.equal(pack.kind, "zip");
  assert.ok(pack.parts > 1);
  const zip = new AdmZip(Buffer.from(await pack.blob.arrayBuffer()));
  const manifest = JSON.parse(zip.readAsText("manifest.json"));
  assert.equal(manifest.totalMessages, 40);
  assert.equal(manifest.userMessages, 20);
  assert.equal(manifest.assistantMessages, 20);
  assert.equal(manifest.parts.length, pack.parts);
  assert.ok(manifest.parts.every((part) => /^[a-f0-9]{64}$/.test(part.sha256)));
  assert.equal(manifest.parts.reduce((sum, part) => sum + part.messageCount, 0), 40);
  assert.ok(manifest.parts.every((part) => part.bytes <= 700 || (part.messageCount === 1 && part.oversized)));
  const firstPart = zip.readAsText(manifest.parts[0].name);
  assert.match(firstPart, /\*\*Total messages:\*\* 40/);
  assert.match(firstPart, /\*\*User messages:\*\* 20/);
  assert.match(firstPart, /\*\*AI responses:\*\* 20/);
});

test("requires explicit confirmation before packaging a partial extraction", async () => {
  const partial = options([{ role: "user", text: "only loaded message" }], { extraction: { platform: "Claude", adapter: "claude", title: "Partial", completeness: "partial", partialReason: "start_not_verified", messages: [{ role: "user", text: "only loaded message" }] } });
  await assert.rejects(() => context.ChatExporterArchive.createExportPackage(partial, { maxBytes: 20 }), /partial_confirmation_required/);
  const pack = await context.ChatExporterArchive.createExportPackage({ ...partial, confirmPartial: true }, { maxBytes: 20 });
  assert.equal(pack.manifest.completeness, "partial");
  assert.equal(pack.manifest.partialReason, "start_not_verified");
});

test("handles thousands of turns without changing their count or order", () => {
  const messages = Array.from({ length: 3000 }, (_, index) => ({ role: index % 2 ? "assistant" : "user", text: index % 100 === 0 ? "intentional repeat" : `turn-${index}` }));
  const split = context.ChatExporterArchive.splitConversation(options(messages).extraction, options(messages), 32 * 1024);
  assert.equal(split.parts.reduce((sum, part) => sum + part.count, 0), messages.length);
  assert.ok(split.parts.length > 1);
});

test("crosses the real 10MiB boundary and creates a multi-part archive", async () => {
  const messages = Array.from({ length: 2100 }, (_, index) => ({ role: index % 2 ? "assistant" : "user", text: `${index}:${"x".repeat(5100)}` }));
  const pack = await context.ChatExporterArchive.createExportPackage(options(messages));
  assert.equal(pack.kind, "zip");
  assert.ok(pack.parts >= 2);
  assert.equal(pack.manifest.totalMessages, messages.length);
  assert.ok(pack.manifest.parts.every((part) => part.bytes <= context.ChatExporterArchive.DEFAULT_PART_BYTES || (part.messageCount === 1 && part.oversized)));
});
