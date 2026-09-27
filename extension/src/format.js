(function exposeFormatting(global) {
  "use strict";

  function stripMarkdown(value) {
    return value
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.*?)\*\*/gs, "$1")
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1")
      .replace(/```[\w-]*\n?([\s\S]*?)```/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!?\[([^\]]*)\]\(([^)]+)\)/g, (_match, label, href) => /^https?:\/\//i.test(href) ? `${label} (${href})` : label)
      .replace(/^>\s?/gm, "")
      .replace(/^[-*]\s/gm, "• ");
  }

  function statusHeader(extraction, format, language) {
    if (extraction?.completeness === "complete") return "";
    const partial = extraction?.completeness === "partial";
    const label = language === "he"
      ? partial ? "ייצוא חלקי — לא ניתן לאמת את מלוא השיחה" : "ייצוא לא מאומת — ייתכן שכולל רק הודעות שכבר נטענו"
      : partial ? "PARTIAL EXPORT — the full conversation could not be verified" : "UNVERIFIED EXPORT — may include only messages already loaded";
    const reasons = language === "he"
      ? { start_not_verified: "תחילת השיחה לא אומתה", end_not_verified: "סוף השיחה לא אומת", merge_not_verified: "חיבור חלקי השיחה לא אומת" }
      : { start_not_verified: "start not verified", end_not_verified: "end not verified", merge_not_verified: "window merge not verified" };
    const message = `${label}${reasons[extraction.partialReason] ? ` (${reasons[extraction.partialReason]})` : ""}`;
    return format === "txt" ? `${message}\n\n` : `> **${message}**\n\n`;
  }

  function buildContent({ extraction, includeUser, includeAssistant, includeMeta, includeUrl, currentUrl, format, language, date = new Date(), metadataOnly = false, includeStatusHeader = true }) {
    if (!extraction) return "";
    if (!includeUser && !includeAssistant) throw new Error("empty_selection");

    const markdown = format !== "txt";
    const locale = language === "he" ? "he-IL" : "en-GB";
    const formattedDate = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
    const labels = language === "he"
      ? { user: "משתמש", assistant: "עוזר", platform: "פלטפורמה", date: "תאריך", model: "מודל", completeness: "שלמות", messages: "הודעות בסך הכול", userMessages: "הודעות משתמש", assistantMessages: "תגובות AI" }
      : { user: "User", assistant: "Assistant", platform: "Platform", date: "Date", model: "Model", completeness: "Completeness", messages: "Total messages", userMessages: "User messages", assistantMessages: "AI responses" };
    const completenessValues = language === "he"
      ? { loaded: "נטען", complete: "מלא", partial: "חלקי" }
      : { loaded: "Loaded", complete: "Complete", partial: "Partial" };
    const completeness = completenessValues[extraction.completeness] || extraction.completeness || completenessValues.loaded;
    const lines = [];
    if (includeStatusHeader && extraction.completeness !== "complete") lines.push(statusHeader(extraction, format, language).trimEnd(), "");
    const selectedMessages = (extraction.messages || []).filter((message) => {
      if (message.role === "user" && !includeUser) return false;
      if (message.role === "assistant" && !includeAssistant) return false;
      return String(message.text || "").trim().length > 0;
    });
    const userMessageCount = selectedMessages.filter((message) => message.role === "user").length;
    const assistantMessageCount = selectedMessages.filter((message) => message.role === "assistant").length;

    if (includeMeta) {
      const heading = extraction.title || `${extraction.platform} conversation`;
      if (markdown) {
        lines.push(`# ${heading}`, "", `**${labels.platform}:** ${extraction.platform}`, `**${labels.date}:** ${formattedDate}`);
        if (extraction.model) lines.push(`**${labels.model}:** ${extraction.model}`);
        if (includeUrl && currentUrl) lines.push(`**URL:** ${currentUrl}`);
        lines.push(
          `**${labels.completeness}:** ${completeness}`,
          `**${labels.messages}:** ${selectedMessages.length}`,
          `**${labels.userMessages}:** ${userMessageCount}`,
          `**${labels.assistantMessages}:** ${assistantMessageCount}`,
          "", "---", ""
        );
      } else {
        lines.push(heading, `${labels.platform}: ${extraction.platform}`, `${labels.date}: ${formattedDate}`);
        if (extraction.model) lines.push(`${labels.model}: ${extraction.model}`);
        if (includeUrl && currentUrl) lines.push(`URL: ${currentUrl}`);
        lines.push(
          `${labels.completeness}: ${completeness}`,
          `${labels.messages}: ${selectedMessages.length}`,
          `${labels.userMessages}: ${userMessageCount}`,
          `${labels.assistantMessages}: ${assistantMessageCount}`,
          "", "=".repeat(64), ""
        );
      }
    }

    for (const message of metadataOnly ? [] : selectedMessages) {
      const label = message.role === "user" ? labels.user : labels.assistant;
      const text = markdown ? message.text : stripMarkdown(message.text);
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

  global.ChatExporterFormat = { buildContent, safeFilename, stripMarkdown, statusHeader };
})(globalThis);
