import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Chat Exporter by Tom Raz",
  description: "How Chat Exporter handles conversation content and local preferences.",
  alternates: { canonical: "/privacy" }
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-shell">
        <Link className="legal-back" href="/">← Chat Exporter</Link>
        <p className="section-kicker">Effective August 20, 2026</p>
        <h1>Privacy Policy</h1>
        <p className="legal-lead">Chat Exporter by Tom Raz is designed to process AI conversation content locally in your browser. This policy describes exactly what the extension can access, what it stores, and what it does not collect.</p>

        <section><h2>Summary</h2><p>The extension does not transmit conversation content, page URLs, browsing history or usage analytics to Tom Raz or to a third-party service. It has no account system, advertising SDK, analytics SDK or remote executable code.</p></section>
        <section><h2>Data accessed for the user-facing feature</h2><p>The extension runs only on six explicitly listed AI-chat services and their fixed domains so the in-chat quick action can appear automatically. On those pages it can temporarily read loaded conversation content, including prompts, AI responses, links, code, tables, the page title, the detected model and—only when you choose to include it—the current conversation URL.</p><p>This access is used only to show local message counts and to create the export requested by you. You can disable the in-chat widget for any service in Settings.</p></section>
        <section><h2>Local processing and files</h2><p>Conversation parsing, Markdown conversion, plain-text conversion and file creation occur inside your browser. Exported files are saved using the browser’s normal download behavior. Clipboard content is written only after you press Copy.</p></section>
        <section><h2>Local storage</h2><p>The extension stores <code>settingsV2</code> in <code>storage.local</code>: language, enabled services, default format, selected message roles, metadata and URL choices, default scan mode, and dismissed help notices. Conversation content, exported text and conversation URLs are not stored by the extension.</p></section>
        <section><h2>Network activity</h2><p>The extension does not make network requests. It does not upload transcripts, contact an analytics endpoint or download executable code. The AI website open in your tab may continue making its own requests under that website’s privacy policy; Chat Exporter does not control or add to those requests.</p></section>
        <section><h2>Permissions</h2><ul><li><code>activeTab</code> supports toolbar-popup export after you invoke the extension.</li><li><code>scripting</code> runs the bundled extractor and registers the in-chat widget.</li><li><code>storage</code> remembers local interface and export preferences.</li><li>Required host access is limited to ChatGPT, Claude, Gemini, Copilot, Perplexity and Grok domains so the widget can appear automatically. No wildcard access to other websites is requested.</li></ul></section>
        <section><h2>Sharing, sale and advertising</h2><p>Because Chat Exporter does not receive user data, it does not sell, rent, share or use conversation data for advertising, profiling, credit decisions or purposes unrelated to the export feature.</p></section>
        <section><h2>Children and sensitive content</h2><p>The extension is a general productivity tool and is not directed to children. Users control which conversations they export and are responsible for handling exported files appropriately, especially when conversations contain confidential or sensitive information.</p></section>
        <section><h2>Changes</h2><p>Material changes will be documented in the public changelog and reflected in the effective date above. The store privacy disclosures will be updated at the same time.</p></section>
        <section><h2>Contact and support</h2><p>Non-sensitive bugs can be reported through <a href="https://github.com/talktome8/chat-exporter/issues">GitHub Issues</a>. Security reports must use the repository&apos;s private <a href="https://github.com/talktome8/chat-exporter/security/advisories/new">Security advisory form</a>. Chat Exporter is available through the <a href="https://chromewebstore.google.com/detail/chat-exporter-by-tom-raz/ljgpghdicijmjojfnhmpefjpipfakoen">Chrome Web Store</a>, <a href="https://microsoftedge.microsoft.com/addons/detail/chat-exporter-by-tom-raz/nmmpfdnapkfklcbfgcmkahcjcclophhk">Microsoft Edge Add-ons</a>, and <a href="https://addons.mozilla.org/he/firefox/addon/chat-exporter-by-tom-raz/">Firefox Add-ons</a>.</p></section>

        <hr />
        <div lang="he" dir="rtl" className="hebrew-policy">
          <p className="section-kicker">בתוקף מ־20 באוגוסט 2026</p>
          <h1>מדיניות פרטיות</h1>
          <p className="legal-lead">Chat Exporter by Tom Raz נועד לעבד תוכן שיחות AI באופן מקומי בדפדפן. התוסף אינו שולח ל‑Tom Raz או לצד שלישי תוכן שיחות, כתובות עמודים, היסטוריית גלישה או נתוני שימוש.</p>
          <section><h2>איזה מידע נקרא</h2><p>התוסף פועל רק בדומיינים המפורטים של שירותי צ׳אט AI כדי שכפתור הפעולה יופיע אוטומטית. בעמודים אלה הוא יכול לקרוא זמנית את תוכן השיחה שנטען, הכותרת, המודל והכתובת הנוכחית. הכתובת מצורפת לקובץ רק אם בחרת בכך. ניתן להשבית את ה־widget לכל שירות בהגדרות.</p></section>
          <section><h2>עיבוד ואחסון</h2><p>החילוץ, ההמרה ויצירת הקובץ מתבצעים בדפדפן. תוכן שיחות, טקסט מיוצא וכתובות שיחה אינם נשמרים על ידי התוסף. ב־<code>storage.local</code> נשמרות רק הגדרות ממשק וייצוא: שפה, שירותים פעילים, פורמט, סוגי הודעות, מטא־דאטה, URL, מצב סריקה והודעות עזרה שהוסתרו.</p></section>
          <section><h2>רשת ושיתוף</h2><p>התוסף אינו מבצע בקשות רשת, אינו מכיל אנליטיקה או פרסום ואינו מוריד קוד להפעלה. לכן הוא אינו מוכר, משתף או משתמש בתוכן שיחות לכל מטרה אחרת.</p></section>
          <section><h2>הרשאות</h2><p><code>activeTab</code> תומכת בייצוא מהחלון הרגיל, <code>scripting</code> מריצה את מנגנון החילוץ וה־widget המצורפים לחבילה, ו־<code>storage</code> שומרת הגדרות מקומיות. גישת האתרים הנדרשת מוגבלת לדומיינים המפורטים של ChatGPT, Claude, Gemini, Copilot, Perplexity ו־Grok; אין גישה כללית לאתרים אחרים.</p></section>
          <section><h2>עדכונים ותמיכה</h2><p>שינויים מהותיים יתועדו ביומן השינויים ובשדות הפרטיות בחנויות. תקלות לא רגישות ניתן לדווח ב־<a href="https://github.com/talktome8/chat-exporter/issues">GitHub Issues</a>, ובעיות אבטחה בטופס <a href="https://github.com/talktome8/chat-exporter/security/advisories/new">Security Advisory</a> הפרטי.</p></section>
        </div>
      </div>
    </main>
  );
}
