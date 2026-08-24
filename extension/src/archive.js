(function exposeArchive(global) {
  "use strict";

  const DEFAULT_PART_BYTES = 10 * 1024 * 1024;
  const encoder = new TextEncoder();

  function byteLength(value) {
    return encoder.encode(value).byteLength;
  }

  function filteredMessages(extraction, options) {
    return (extraction.messages || []).filter((message) =>
      (message.role === "user" && options.includeUser) ||
      (message.role === "assistant" && options.includeAssistant));
  }

  function renderMessage(extraction, message, options) {
    return global.ChatExporterFormat.buildContent({
      ...options,
      extraction: { ...extraction, messages: [message] },
      includeMeta: false,
      includeUrl: false
    });
  }

  function renderMetadata(extraction, options) {
    if (!options.includeMeta) return "";
    return global.ChatExporterFormat.buildContent({
      ...options,
      extraction,
      metadataOnly: true
    });
  }

  function continuationHeader(index, total, format) {
    return format === "txt"
      ? `Chat Exporter — continuation ${index}/${total}\n${"=".repeat(48)}\n\n`
      : `# Chat Exporter — continuation ${index}/${total}\n\n---\n\n`;
  }

  function splitConversation(extraction, options, maxBytes = DEFAULT_PART_BYTES) {
    if (!options.includeUser && !options.includeAssistant) throw new Error("empty_selection");
    const messages = filteredMessages(extraction, options);
    const metadata = renderMetadata(extraction, options);
    const continuationReserve = byteLength(continuationHeader(999999, 999999, options.format));
    const parts = [];
    let content = metadata;
    let start = 0;
    let count = 0;

    for (let index = 0; index < messages.length; index += 1) {
      const next = renderMessage(extraction, messages[index], options);
      const reserve = parts.length > 0 ? continuationReserve : 0;
      if (count > 0 && byteLength(content) + byteLength(next) + reserve > maxBytes) {
        parts.push({ content, start, end: start + count - 1, count });
        content = "";
        start = index;
        count = 0;
      }
      content += next;
      count += 1;
    }

    if (count || metadata) parts.push({ content, start, end: Math.max(start, start + count - 1), count });
    if (!parts.length) parts.push({ content: "", start: 0, end: -1, count: 0 });
    if (parts.length > 1) {
      for (let index = 1; index < parts.length; index += 1) {
        parts[index].content = continuationHeader(index + 1, parts.length, options.format) + parts[index].content;
      }
    }
    return { messages, parts };
  }

  async function sha256(bytes) {
    const digest = await global.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      table[index] = value >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function write16(view, offset, value) { view.setUint16(offset, value, true); }
  function write32(view, offset, value) { view.setUint32(offset, value >>> 0, true); }

  function dosDateTime(value) {
    const source = value instanceof Date && !Number.isNaN(value.getTime()) ? value : new Date();
    const year = Math.min(2107, Math.max(1980, source.getFullYear()));
    return {
      date: ((year - 1980) << 9) | ((source.getMonth() + 1) << 5) | source.getDate(),
      time: (source.getHours() << 11) | (source.getMinutes() << 5) | Math.floor(source.getSeconds() / 2)
    };
  }

  function makeZip(entries, modifiedAt = new Date()) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const dos = dosDateTime(modifiedAt);

    for (const entry of entries) {
      const name = encoder.encode(entry.name);
      const data = entry.bytes;
      const crc = crc32(data);
      const local = new Uint8Array(30 + name.length);
      const localView = new DataView(local.buffer);
      write32(localView, 0, 0x04034b50); write16(localView, 4, 20); write16(localView, 6, 0x0800);
      write16(localView, 8, 0); write16(localView, 10, dos.time); write16(localView, 12, dos.date);
      write32(localView, 14, crc); write32(localView, 18, data.length); write32(localView, 22, data.length);
      write16(localView, 26, name.length); write16(localView, 28, 0); local.set(name, 30);
      localParts.push(local, data);

      const central = new Uint8Array(46 + name.length);
      const centralView = new DataView(central.buffer);
      write32(centralView, 0, 0x02014b50); write16(centralView, 4, 20); write16(centralView, 6, 20);
      write16(centralView, 8, 0x0800); write16(centralView, 10, 0); write16(centralView, 12, dos.time); write16(centralView, 14, dos.date);
      write32(centralView, 16, crc); write32(centralView, 20, data.length); write32(centralView, 24, data.length);
      write16(centralView, 28, name.length); write16(centralView, 30, 0); write16(centralView, 32, 0);
      write16(centralView, 34, 0); write16(centralView, 36, 0); write32(centralView, 38, 0); write32(centralView, 42, offset);
      central.set(name, 46); centralParts.push(central);
      offset += local.length + data.length;
    }

    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    write32(endView, 0, 0x06054b50); write16(endView, 4, 0); write16(endView, 6, 0);
    write16(endView, 8, entries.length); write16(endView, 10, entries.length);
    write32(endView, 12, centralSize); write32(endView, 16, offset); write16(endView, 20, 0);
    return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
  }

  async function createExportPackage(options, config = {}) {
    const extraction = options.extraction;
    if (!extraction) throw new Error("missing_extraction");
    if (extraction.completeness === "partial" && !options.confirmPartial) throw new Error("partial_confirmation_required");
    const maxBytes = config.maxBytes || DEFAULT_PART_BYTES;
    const base = global.ChatExporterFormat.safeFilename(options.filenameTitle || extraction.filenameTitle || extraction.title);
    const extension = options.format === "txt" ? "txt" : "md";
    const date = options.date || new Date();
    const dateSlug = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
    const split = splitConversation(extraction, options, maxBytes);
    if (split.parts.length === 1 && byteLength(split.parts[0].content) <= maxBytes) {
      return {
        kind: "file",
        filename: `${base}-${dateSlug}.${extension}`,
        blob: new Blob(["\uFEFF", split.parts[0].content], { type: extension === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8" }),
        manifest: null,
        parts: 1
      };
    }

    const width = Math.max(3, String(split.parts.length).length);
    const entries = [];
    const partRecords = [];
    for (let index = 0; index < split.parts.length; index += 1) {
      const part = split.parts[index];
      const name = `${base}-${dateSlug}-part-${String(index + 1).padStart(width, "0")}-of-${String(split.parts.length).padStart(width, "0")}.${extension}`;
      const bytes = encoder.encode(part.content);
      entries.push({ name, bytes });
      partRecords.push({ name, firstMessage: part.start + 1, lastMessage: part.end + 1, messageCount: part.count, bytes: bytes.length, oversized: bytes.length > maxBytes, sha256: await sha256(bytes) });
    }

    const manifest = {
      schemaVersion: 2,
      extensionVersion: global.chrome?.runtime?.getManifest?.().version || "development",
      createdAt: date.toISOString(),
      platform: extraction.platform,
      adapter: extraction.adapter,
      title: extraction.title,
      model: extraction.model || "",
      completeness: extraction.completeness || "loaded",
      partialReason: extraction.partialReason || "",
      totalMessages: split.messages.length,
      userMessages: split.messages.filter((message) => message.role === "user").length,
      assistantMessages: split.messages.filter((message) => message.role === "assistant").length,
      format: extension,
      settings: {
        includeUser: options.includeUser,
        includeAssistant: options.includeAssistant,
        includeMetadata: options.includeMeta,
        includeUrl: options.includeUrl
      },
      parts: partRecords
    };
    entries.push({ name: "manifest.json", bytes: encoder.encode(`${JSON.stringify(manifest, null, 2)}\n`) });
    return { kind: "zip", filename: `${base}-${dateSlug}.zip`, blob: makeZip(entries, date), manifest, parts: split.parts.length };
  }

  global.ChatExporterArchive = { DEFAULT_PART_BYTES, byteLength, splitConversation, makeZip, createExportPackage };
})(globalThis);
