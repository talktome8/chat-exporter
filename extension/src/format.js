(function exposeFormatting(global) {
  "use strict";

  function stripMarkdown(value) {
    return value
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.*?)\*\*/gs, "$1")
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1")
      .replace(/```[\w-]*\n?([\s\S]*?)```/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!?(?:\[([^\]]*)\])\([^)]+\)/g, "$1")
      .replace(/^>\s?/gm, "")
      .replace(/^[-*]\s/gm, "• ");
  }

  function buildContent({ extraction, includeUser, includeAssistant, includeMeta, includeUrl, currentUrl, format, language, date = new Date() }) {
    if (!extraction) return "";
    if (!includeUser && !includeAssistant) throw new Error("empty_selection");

    const markdown = format !== "txt";
    const locale = language === "he" ? "he-IL" : "en-GB";
    const formattedDate = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
    const labels = language === "he"
      ? { user: "משתמש", assistant: "עוזר", platform: "פלטפורמה", date: "תאריך", model: "מודל", completeness: "שלמות" }
      : { user: "User", assistant: "Assistant", platform: "Platform", date: "Date", model: "Model", completeness: "Completeness" };
    const lines = [];

    if (includeMeta) {
      const heading = extraction.title || `${extraction.platform} conversation`;
      if (markdown) {
        lines.push(`# ${heading}`, "", `**${labels.platform}:** ${extraction.platform}`, `**${labels.date}:** ${formattedDate}`);
        if (extraction.model) lines.push(`**${labels.model}:** ${extraction.model}`);
        if (includeUrl && currentUrl) lines.push(`**URL:** ${currentUrl}`);
        lines.push(`**${labels.completeness}:** ${extraction.completeness || "unknown"}`, "", "---", "");
      } else {
        lines.push(heading, `${labels.platform}: ${extraction.platform}`, `${labels.date}: ${formattedDate}`);
        if (extraction.model) lines.push(`${labels.model}: ${extraction.model}`);
        if (includeUrl && currentUrl) lines.push(`URL: ${currentUrl}`);
        lines.push(`${labels.completeness}: ${extraction.completeness || "unknown"}`, "", "=".repeat(64), "");
      }
    }

    for (const message of extraction.messages || []) {
      if (message.role === "user" && !includeUser) continue;
      if (message.role === "assistant" && !includeAssistant) continue;
      const label = message.role === "user" ? labels.user : labels.assistant;
      const text = markdown ? message.text : stripMarkdown(message.text);
      if (!text.trim()) continue;
      if (markdown) lines.push(`## ${label}`, "", text.trim(), "", "---", "");
      else lines.push(`[${label}]`, text.trim(), "");
    }

    return lines.join("\n").trimEnd() + "\n";
  }

  function safeFilename(value) {
    return (value || "conversation")
      .normalize("NFKD")
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 72) || "conversation";
  }

  global.ChatExporterFormat = { buildContent, safeFilename, stripMarkdown };
})(globalThis);
