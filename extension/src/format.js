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

  function buildContent({ extraction, includeUser, includeAssistant, includeMeta, includeUrl, currentUrl, format, language, date = new Date(), metadataOnly = false }) {
    if (!extraction) return "";
    if (!includeUser && !includeAssistant) throw new Error("empty_selection");

    const markdown = format !== "txt";
    const locale = language === "he" ? "he-IL" : "en-GB";
    const formattedDate = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
    const labels = language === "he"
      ? { user: "משתמש", assistant: "עוזר", platform: "פלטפורמה", date: "תאריך", model: "מודל", completeness: "שלמות", messages: "הודעות בסך הכול", userMessages: "הודעות משתמש", assistantMessages: "תגובות AI" }
      : { user: "User", assistant: "Assistant", platform: "Platform", date: "Date", model: "Model", completeness: "Completeness", messages: "Total messages", userMessages: "User messages", assistantMessages: "AI responses" };
    const lines = [];
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
          `**${labels.completeness}:** ${extraction.completeness || "loaded"}`,
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
          `${labels.completeness}: ${extraction.completeness || "loaded"}`,
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

  global.ChatExporterFormat = { buildContent, safeFilename, stripMarkdown };
})(globalThis);
