import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Chat Exporter by Tom Raz",
  description: "How Chat Exporter handles conversation content and local preferences.",
  alternates: { canonical: "/chat-exporter/privacy" }
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-shell">
        <Link className="legal-back" href="/">← Chat Exporter</Link>
        <p className="section-kicker">Effective July 19, 2026</p>
        <h1>Privacy Policy</h1>
        <p className="legal-lead">Chat Exporter by Tom Raz is designed to process AI conversation content locally in your browser. This policy describes exactly what the extension can access, what it stores, and what it does not collect.</p>

        <section><h2>Summary</h2><p>The extension does not transmit conversation content, page URLs, browsing history or usage analytics to Tom Raz or to a third-party service. It has no account system, advertising SDK, analytics SDK or remote executable code.</p></section>
        <section><h2>Data accessed for the user-facing feature</h2><p>After you click the extension, it temporarily reads the visible and loaded conversation content in the active tab. This can include prompts, AI responses, links, code, tables, the page title, the detected model and—only when you choose to include it—the current conversation URL.</p><p>This access is used only to create the export requested by you.</p></section>
        <section><h2>Local processing and files</h2><p>Conversation parsing, Markdown conversion, plain-text conversion and file creation occur inside your browser. Exported files are saved using the browser’s normal download behavior. Clipboard content is written only after you press Copy.</p></section>
        <section><h2>Local storage</h2><p>The extension stores one preference in browser storage: whether the interface should appear in English or Hebrew. Conversation content is not stored by the extension.</p></section>
        <section><h2>Network activity</h2><p>The extension does not make network requests. It does not upload transcripts, contact an analytics endpoint or download executable code. The AI website open in your tab may continue making its own requests under that website’s privacy policy; Chat Exporter does not control or add to those requests.</p></section>
        <section><h2>Permissions</h2><ul><li><code>activeTab</code> grants temporary access to the tab where you invoke the extension.</li><li><code>scripting</code> runs the extractor bundled in the reviewed extension package.</li><li><code>storage</code> remembers the local language preference.</li></ul></section>
        <section><h2>Sharing, sale and advertising</h2><p>Because Chat Exporter does not receive user data, it does not sell, rent, share or use conversation data for advertising, profiling, credit decisions or purposes unrelated to the export feature.</p></section>
        <section><h2>Children and sensitive content</h2><p>The extension is a general productivity tool and is not directed to children. Users control which conversations they export and are responsible for handling exported files appropriately, especially when conversations contain confidential or sensitive information.</p></section>
        <section><h2>Changes</h2><p>Material changes will be documented in the public changelog and reflected in the effective date above. The store privacy disclosures will be updated at the same time.</p></section>
        <section><h2>Contact and support</h2><p>Non-sensitive bugs can be reported through <a href="https://github.com/talktome8/chat-exporter/issues">GitHub Issues</a>. Security reports must use the repository&apos;s private <a href="https://github.com/talktome8/chat-exporter/security/advisories/new">Security advisory form</a>. The release candidate is not yet distributed through a browser store.</p></section>

        <hr />
        <div lang="he" dir="rtl" className="hebrew-policy">
          <p className="section-kicker">בתוקף מ־19 ביולי 2026</p>
          <h1>מדיניות פרטיות</h1>
          <p className="legal-lead">Chat Exporter by Tom Raz נועד לעבד תוכן שיחות AI באופן מקומי בדפדפן. התוסף אינו שולח ל‑Tom Raz או לצד שלישי תוכן שיחות, כתובות עמודים, היסטוריית גלישה או נתוני שימוש.</p>
          <section><h2>איזה מידע נקרא</h2><p>לאחר לחיצה יזומה על התוסף, הוא קורא זמנית את תוכן השיחה שנטען בכרטיסייה הפעילה. הקריאה משמשת אך ורק ליצירת הייצוא שביקשת.</p></section>
          <section><h2>עיבוד ואחסון</h2><p>החילוץ, ההמרה ויצירת הקובץ מתבצעים בדפדפן. תוכן השיחה אינו נשמר על ידי התוסף. ההעדפה היחידה הנשמרת באחסון המקומי היא שפת הממשק.</p></section>
          <section><h2>רשת ושיתוף</h2><p>התוסף אינו מבצע בקשות רשת, אינו מכיל אנליטיקה או פרסום ואינו מוריד קוד להפעלה. לכן הוא אינו מוכר, משתף או משתמש בתוכן שיחות לכל מטרה אחרת.</p></section>
          <section><h2>הרשאות</h2><p><code>activeTab</code> מעניקה גישה זמנית לעמוד שבו הופעל התוסף, <code>scripting</code> מריצה את מנגנון החילוץ המצורף לחבילה, ו‑<code>storage</code> שומרת את העדפת השפה.</p></section>
          <section><h2>עדכונים ותמיכה</h2><p>שינויים מהותיים יתועדו ביומן השינויים ובשדות הפרטיות בחנויות. קישור למאגר, למעקב תקלות ולתמיכה ישירה יפורסם בעת ההשקה.</p></section>
        </div>
      </div>
    </main>
  );
}
