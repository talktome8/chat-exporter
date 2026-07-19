"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Language = "en" | "he";

const copy = {
  en: {
    skip: "Skip to content",
    navHow: "How it works",
    navSupport: "Compatibility",
    navPrivacy: "Privacy",
    navStatus: "Store release pending",
    eyebrow: "Local-first browser extension",
    headlineA: "Keep the conversation.",
    headlineB: "Lose the copy-paste.",
    hero: "Export AI conversations to clean Markdown or plain text—directly in your browser, with no account, analytics, or upload to our servers.",
    comingSoon: "Coming soon to browser stores",
    reviewCode: "Open-source at launch",
    privacyNote: "Your conversation stays on your device.",
    coreLabel: "Verified launch support",
    betaLabel: "Beta support",
    platforms: "Built for the AI tools you already use",
    platformsBody: "Five platforms are tested as first-class integrations. Grok and Mistral remain clearly marked beta until they pass the same release gate.",
    howEyebrow: "Three deliberate steps",
    howTitle: "Fast when it can be. Honest when it can’t.",
    steps: [
      ["01", "Open a conversation", "Use ChatGPT, Claude, Gemini, Copilot or Perplexity as normal."],
      ["02", "Check completeness", "Chat Exporter loads earlier messages and tells you whether the result is complete, partial or unverified."],
      ["03", "Download or copy", "Choose Markdown or plain text, include the details you need, then save locally."]
    ],
    controlTitle: "A small tool with serious controls",
    controlBody: "The popup stays focused: message filters, metadata, format, completeness and one clear action.",
    complete: "Complete",
    content: "Content",
    userMessages: "User messages",
    aiMessages: "AI responses",
    metadata: "Metadata",
    titleModelDate: "Title, model & date",
    url: "Conversation URL",
    format: "Format",
    markdown: "Markdown (.md)",
    text: "Plain text (.txt)",
    download: "Download",
    copy: "Copy",
    local: "Processed locally. Nothing is sent to Tom Raz.",
    privacyEyebrow: "Privacy by architecture",
    privacyTitle: "There is no conversation server to trust.",
    privacyBody: "Chat Exporter reads the active page only after you click it. The transcript is formatted inside your browser and saved to your device. We do not run analytics, create user accounts or receive conversation content.",
    privacyCards: [
      ["Active tab only", "Access is granted for the page you deliberately invoke the extension on—not your browsing history."],
      ["No remote code", "All executable code ships inside the reviewed extension package."],
      ["Local preferences", "Only your language preference is stored in browser storage."]
    ],
    permissions: "Plain-language permissions",
    permissionsBody: "Three narrowly scoped permissions power the complete feature set.",
    permissionItems: [
      ["activeTab", "Temporarily read the conversation in the tab where you clicked the extension."],
      ["scripting", "Run the bundled, reviewable extractor after your explicit action."],
      ["storage", "Remember your English or Hebrew interface preference locally."]
    ],
    faq: "Questions worth answering before install",
    faqs: [
      ["Does it send my chats anywhere?", "No. Conversation extraction and file creation happen locally in your browser. The extension contains no analytics or network client."],
      ["Will every long conversation be complete?", "The extension tries to load earlier messages and reports a completeness status. If a platform prevents full loading, the export is marked partial instead of silently claiming success."],
      ["Which formats are supported?", "Version 1 supports Markdown, plain text and copy to clipboard. PDF and JSON are not advertised."],
      ["Why are Grok and Mistral marked beta?", "Their interfaces change frequently and have not yet passed the full three-browser release matrix."],
      ["Where can I report a problem?", "Public issue tracking and the repository link will appear here when the source repository opens at launch."]
    ],
    ctaTitle: "A trustworthy export starts with a trustworthy release.",
    ctaBody: "Chrome, Edge and Firefox packages are being validated now. Store buttons will activate only after each reviewed listing is live.",
    by: "Built and maintained by Tom Raz",
    privacyLink: "Privacy policy",
    changelog: "Changelog",
    support: "Support",
    version: "Launch candidate · v1.0.0"
  },
  he: {
    skip: "דילוג לתוכן",
    navHow: "איך זה עובד",
    navSupport: "תאימות",
    navPrivacy: "פרטיות",
    navStatus: "ההשקה בחנויות בהכנה",
    eyebrow: "תוסף דפדפן בגישה מקומית",
    headlineA: "שומרים את השיחה.",
    headlineB: "נפרדים מהעתק-הדבק.",
    hero: "ייצוא שיחות AI ל-Markdown נקי או לטקסט פשוט—ישירות בדפדפן, ללא חשבון, אנליטיקה או העלאה לשרתים שלנו.",
    comingSoon: "בקרוב בחנויות הדפדפנים",
    reviewCode: "קוד פתוח בעת ההשקה",
    privacyNote: "השיחה נשארת במכשיר שלך.",
    coreLabel: "תמיכה מאומתת בהשקה",
    betaLabel: "תמיכת בטא",
    platforms: "מותאם לכלי ה-AI שכבר נמצאים בשימוש שלך",
    platformsBody: "חמש פלטפורמות נבדקות כאינטגרציות מלאות. Grok ו-Mistral נשארים מסומנים בבירור כבטא עד שיעברו את אותו שער איכות.",
    howEyebrow: "שלושה צעדים מדויקים",
    howTitle: "מהיר כשאפשר. כן כשאי אפשר.",
    steps: [
      ["01", "פותחים שיחה", "משתמשים ב-ChatGPT, Claude, Gemini, Copilot או Perplexity כרגיל."],
      ["02", "בודקים שלמות", "התוסף טוען הודעות קודמות ומציין אם התוצאה מלאה, חלקית או לא מאומתת."],
      ["03", "מורידים או מעתיקים", "בוחרים Markdown או טקסט, מסמנים את הפרטים הרצויים ושומרים מקומית."]
    ],
    controlTitle: "כלי קטן עם שליטה רצינית",
    controlBody: "חלון ממוקד הכולל סינון הודעות, מטא-דאטה, פורמט, מצב שלמות ופעולה ברורה.",
    complete: "מלא",
    content: "תוכן",
    userMessages: "הודעות משתמש",
    aiMessages: "תגובות AI",
    metadata: "מטא-דאטה",
    titleModelDate: "כותרת, מודל ותאריך",
    url: "כתובת השיחה",
    format: "פורמט",
    markdown: "Markdown (.md)",
    text: "טקסט פשוט (.txt)",
    download: "הורדה",
    copy: "העתקה",
    local: "העיבוד מקומי. דבר אינו נשלח ל-Tom Raz.",
    privacyEyebrow: "פרטיות באמצעות ארכיטקטורה",
    privacyTitle: "אין שרת שיחות שצריך לתת בו אמון.",
    privacyBody: "התוסף קורא את העמוד הפעיל רק לאחר לחיצה יזומה. התמליל מעוצב בתוך הדפדפן ונשמר במכשיר. אין אנליטיקה, חשבונות משתמש או קבלת תוכן שיחות.",
    privacyCards: [
      ["רק הכרטיסייה הפעילה", "הגישה ניתנת לעמוד שבו הפעלת את התוסף—לא להיסטוריית הגלישה."],
      ["ללא קוד מרוחק", "כל הקוד הניתן להפעלה כלול בחבילה שנבדקת בחנות."],
      ["העדפות מקומיות", "רק העדפת השפה נשמרת באחסון המקומי של הדפדפן."]
    ],
    permissions: "הרשאות בשפה פשוטה",
    permissionsBody: "שלוש הרשאות מצומצמות מפעילות את כל יכולות התוסף.",
    permissionItems: [
      ["activeTab", "קריאה זמנית של השיחה בכרטיסייה שבה לחצת על התוסף."],
      ["scripting", "הרצת מנגנון החילוץ המצורף לחבילה לאחר פעולה מפורשת שלך."],
      ["storage", "שמירת העדפת הממשק בעברית או באנגלית באופן מקומי."]
    ],
    faq: "שאלות שכדאי לענות עליהן לפני ההתקנה",
    faqs: [
      ["האם השיחות נשלחות למקום כלשהו?", "לא. החילוץ ויצירת הקובץ מתבצעים מקומית בדפדפן. אין בתוסף אנליטיקה או לקוח רשת."],
      ["האם כל שיחה ארוכה תיוצא במלואה?", "התוסף מנסה לטעון הודעות קודמות ומדווח על מצב השלמות. אם הפלטפורמה מונעת טעינה מלאה, הייצוא יסומן כחלקי."],
      ["אילו פורמטים נתמכים?", "גרסה 1 תומכת ב-Markdown, טקסט פשוט והעתקה ללוח. PDF ו-JSON אינם מפורסמים."],
      ["מדוע Grok ו-Mistral מסומנים כבטא?", "הממשקים שלהם משתנים לעיתים קרובות והם טרם עברו את מטריצת הבדיקות המלאה בשלושת הדפדפנים."],
      ["היכן מדווחים על בעיה?", "קישור למאגר ולמעקב תקלות ציבורי יופיע כאן כשהמאגר ייפתח בעת ההשקה."]
    ],
    ctaTitle: "ייצוא אמין מתחיל בהשקה אמינה.",
    ctaBody: "חבילות Chrome, Edge ו-Firefox נמצאות כעת בבדיקה. כפתורי החנויות יופעלו רק לאחר שכל עמוד מאושר יהיה זמין.",
    by: "פותח ומתוחזק על ידי Tom Raz",
    privacyLink: "מדיניות פרטיות",
    changelog: "יומן שינויים",
    support: "תמיכה",
    version: "מועמדת להשקה · v1.0.0"
  }
} as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const t = copy[language];

  useEffect(() => {
    const stored = window.localStorage.getItem("chat-exporter-site-language") as Language | null;
    const next = stored === "he" ? "he" : "en";
    const timer = window.setTimeout(() => {
      setLanguage(next);
      document.documentElement.lang = next;
      document.documentElement.dir = next === "he" ? "rtl" : "ltr";
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function switchLanguage() {
    const next = language === "en" ? "he" : "en";
    setLanguage(next);
    window.localStorage.setItem("chat-exporter-site-language", next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "he" ? "rtl" : "ltr";
  }

  return (
    <>
      <a className="skip-link" href="#main">{t.skip}</a>
      <header className="site-header">
        <div className="shell nav-inner">
          <a className="site-brand" href="#top" aria-label="Chat Exporter home">
            <Image src="/icon128.png" width={34} height={34} alt="" />
            <span><strong>Chat Exporter</strong><small>by Tom Raz</small></span>
          </a>
          <nav aria-label="Primary navigation">
            <a href="#how">{t.navHow}</a>
            <a href="#compatibility">{t.navSupport}</a>
            <a href="#privacy">{t.navPrivacy}</a>
          </nav>
          <div className="nav-actions">
            <button className="language-switch" type="button" onClick={switchLanguage} aria-label={language === "en" ? "הצגת האתר בעברית" : "View site in English"}>{language === "en" ? "עב" : "EN"}</button>
            <span className="release-chip"><i aria-hidden="true" />{t.navStatus}</span>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span />{t.eyebrow}</p>
              <h1>{t.headlineA}<br /><em>{t.headlineB}</em></h1>
              <p className="hero-body">{t.hero}</p>
              <div className="hero-actions">
                <span className="button button-primary" aria-disabled="true">{t.comingSoon}</span>
                <span className="button button-secondary" aria-disabled="true">{t.reviewCode}</span>
              </div>
              <p className="hero-note"><span aria-hidden="true">✓</span>{t.privacyNote}</p>
            </div>
            <ProductPreview t={t} />
          </div>
        </section>

        <section className="platform-strip" id="compatibility">
          <div className="shell">
            <div className="platform-heading"><div><p className="section-kicker">{t.coreLabel}</p><h2>{t.platforms}</h2></div><p>{t.platformsBody}</p></div>
            <div className="platform-grid">
              {["ChatGPT", "Claude", "Gemini", "Copilot", "Perplexity"].map((name) => <div className="platform-card verified" key={name}><span>{name.slice(0, 1)}</span><strong>{name}</strong><small>Verified</small></div>)}
              {["Grok", "Mistral"].map((name) => <div className="platform-card beta" key={name}><span>{name.slice(0, 1)}</span><strong>{name}</strong><small>{t.betaLabel}</small></div>)}
            </div>
          </div>
        </section>

        <section className="section how-section" id="how">
          <div className="shell">
            <p className="section-kicker">{t.howEyebrow}</p>
            <h2 className="section-title">{t.howTitle}</h2>
            <div className="steps-grid">
              {t.steps.map(([number, title, body]) => <article className="step-card" key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}
            </div>
          </div>
        </section>

        <section className="section privacy-section" id="privacy">
          <div className="shell privacy-grid">
            <div className="privacy-copy">
              <p className="section-kicker light">{t.privacyEyebrow}</p>
              <h2>{t.privacyTitle}</h2>
              <p>{t.privacyBody}</p>
              <Link className="text-link" href="/privacy">{t.privacyLink} <span aria-hidden="true">→</span></Link>
            </div>
            <div className="privacy-cards">
              {t.privacyCards.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="section permissions-section">
          <div className="shell permissions-grid">
            <div><p className="section-kicker">Manifest V3</p><h2 className="section-title compact">{t.permissions}</h2><p className="section-intro">{t.permissionsBody}</p></div>
            <div className="permission-list">
              {t.permissionItems.map(([name, body]) => <article key={name}><code>{name}</code><p>{body}</p></article>)}
            </div>
          </div>
        </section>

        <section className="section faq-section" id="faq">
          <div className="shell faq-grid">
            <div><p className="section-kicker">FAQ</p><h2 className="section-title compact">{t.faq}</h2></div>
            <div className="faq-list">
              {t.faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}
            </div>
          </div>
        </section>

        <section className="launch-section">
          <div className="shell launch-card">
            <div><p className="section-kicker light">Chrome · Edge · Firefox</p><h2>{t.ctaTitle}</h2><p>{t.ctaBody}</p></div>
            <span className="button button-light" aria-disabled="true">{t.comingSoon}</span>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-inner">
          <div className="site-brand"><Image src="/icon128.png" width={30} height={30} alt="" /><span><strong>Chat Exporter</strong><small>{t.by}</small></span></div>
          <div className="footer-links"><Link href="/privacy">{t.privacyLink}</Link><Link href="/changelog">{t.changelog}</Link><a href="#faq">{t.support}</a></div>
          <small>{t.version}</small>
        </div>
      </footer>
    </>
  );
}

function ProductPreview({ t }: { t: typeof copy.en | typeof copy.he }) {
  return (
    <div className="preview-stage" aria-label="Chat Exporter product preview">
      <div className="preview-orbit orbit-one" /><div className="preview-orbit orbit-two" />
      <div className="browser-card">
        <div className="browser-bar"><span /><span /><span /><div>chatgpt.com / conversation</div></div>
        <div className="conversation-demo"><p className="message user">How should I structure the launch?</p><p className="message assistant">Start with a clear release gate: compatibility, privacy, policy and evidence-based testing.</p><p className="message user short">Export this for me.</p></div>
      </div>
      <div className="popup-card">
        <div className="popup-head"><Image src="/icon128.png" width={38} height={38} alt="" /><div><strong>Chat Exporter</strong><small>by Tom Raz</small></div><button tabIndex={-1}>עב</button></div>
        <div className="popup-summary"><div><small>CHATGPT</small><strong>Launch planning</strong><span>GPT-5</span></div><b><i />{t.complete}</b></div>
        <DemoRows title={t.content} rows={[t.userMessages, t.aiMessages]} counts={[2, 2]} />
        <DemoRows title={t.metadata} rows={[t.titleModelDate, t.url]} checks={[true, false]} />
        <div className="demo-block"><small>{t.format}</small><div className="demo-formats"><span className="selected">{t.markdown}</span><span>{t.text}</span></div></div>
        <div className="demo-actions"><strong>{t.download}</strong><span>{t.copy}</span></div>
        <p className="popup-local"><i />{t.local}</p>
      </div>
    </div>
  );
}

function DemoRows({ title, rows, counts, checks }: { title: string; rows: readonly string[]; counts?: number[]; checks?: boolean[] }) {
  return <div className="demo-block"><small>{title}</small>{rows.map((row, index) => <div className="demo-row" key={row}><span><i className={checks?.[index] === false ? "unchecked" : "checked"} />{row}</span>{counts ? <b>{counts[index]}</b> : null}</div>)}</div>;
}
