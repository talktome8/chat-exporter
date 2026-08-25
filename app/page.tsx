"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Language = "en" | "he";

const stores = {
  chrome: "https://chromewebstore.google.com/detail/chat-exporter-by-tom-raz/ljgpghdicijmjojfnhmpefjpipfakoen",
  edge: "https://microsoftedge.microsoft.com/addons/detail/chat-exporter-by-tom-raz/nmmpfdnapkfklcbfgcmkahcjcclophhk",
  firefox: "https://addons.mozilla.org/he/firefox/addon/chat-exporter-by-tom-raz/"
} as const;

const copy = {
  en: {
    skip: "Skip to content",
    navHow: "How it works",
    navSupport: "Compatibility",
    navPrivacy: "Privacy",
    navStatus: "Available now",
    eyebrow: "Local-first browser extension",
    headlineA: "Keep the conversation.",
    headlineB: "Lose the copy-paste.",
    hero: "Export AI conversations to clean Markdown or plain text—directly in your browser, with no account, analytics, or upload to our servers.",
    comingSoon: "Install from a browser store",
    reviewCode: "View the source on GitHub",
    privacyNote: "Your conversation stays on your device.",
    coreLabel: "Supported AI chat platforms",
    platforms: "Built for the AI tools you already use",
    platformsBody: "Five supported AI chat platforms.",
    howEyebrow: "Three deliberate steps",
    howTitle: "Fast when it can be. Honest when it can’t.",
    steps: [
      ["01", "Open a conversation", "Use any supported AI chat as normal. The Chat Exporter quick action appears automatically."],
      ["02", "Export now or verify", "Export loaded messages immediately, or ask Chat Exporter to scan the full conversation and verify completeness."],
      ["03", "Download or copy", "Choose Markdown or plain text. Very large exports are split safely inside one verified ZIP."]
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
    local: "Processed on this device. Chat content is not transmitted.",
    privacyEyebrow: "Privacy by architecture",
    privacyTitle: "There is no conversation server to trust.",
    privacyBody: "Chat Exporter runs only on the listed AI-chat sites so its quick action can appear automatically. Transcripts are formatted inside your browser and saved to your device. We do not run analytics, create user accounts or receive conversation content.",
    privacyCards: [
      ["AI-chat sites only", "Access is limited to five listed AI-chat services and their fixed domains—not your general browsing history."],
      ["No remote code", "All executable code ships inside the reviewed extension package."],
      ["Local preferences", "Interface and export defaults are stored locally. Chats and conversation URLs are not saved by the extension."]
    ],
    permissions: "Plain-language permissions",
    permissionsBody: "Three extension permissions and a fixed list of AI-chat sites power the complete feature set.",
    permissionItems: [
      ["activeTab", "Provide popup export when you deliberately invoke the toolbar action."],
      ["scripting", "Run only the extractor and in-chat widget bundled in the reviewed package."],
      ["storage", "Remember interface and export preferences locally; never store chat content."],
      ["site access", "Show the widget automatically only on five explicitly listed AI-chat services and their fixed domains."]
    ],
    faq: "Questions worth answering before install",
    faqs: [
      ["Does it send my chats anywhere?", "No. Conversation extraction and file creation happen locally in your browser. The extension contains no analytics or network client."],
      ["Will every long conversation be complete?", "The extension tries to load earlier messages and reports a completeness status. If a platform prevents full loading, the export is marked partial instead of silently claiming success."],
      ["Which formats are supported?", "Version 2 supports Markdown, plain text and copy to clipboard. Exports over 10 MiB are packaged as numbered files in one ZIP."],
      ["Where can I report a problem?", "Use the public GitHub Issues tracker for non-sensitive bugs. Security reports should use GitHub's private security advisory form."]
    ],
    ctaTitle: "Available now for Chrome, Edge and Firefox.",
    ctaBody: "Choose your browser to install Chat Exporter from its official store listing.",
    by: "Built and maintained by Tom Raz",
    privacyLink: "Privacy policy",
    changelog: "Changelog",
    support: "Support",
    version: "Version 2.0.0"
  },
  he: {
    skip: "דילוג לתוכן",
    navHow: "איך זה עובד",
    navSupport: "תאימות",
    navPrivacy: "פרטיות",
    navStatus: "זמין כעת",
    eyebrow: "תוסף דפדפן בגישה מקומית",
    headlineA: "שומרים את השיחה.",
    headlineB: "נפרדים מהעתק-הדבק.",
    hero: "ייצוא שיחות AI ל-Markdown נקי או לטקסט פשוט—ישירות בדפדפן, ללא חשבון, אנליטיקה או העלאה לשרתים שלנו.",
    comingSoon: "התקנה מחנות הדפדפן",
    reviewCode: "הקוד ב-GitHub",
    privacyNote: "השיחה נשארת במכשיר שלך.",
    coreLabel: "פלטפורמות AI נתמכות",
    platforms: "מותאם לכלי ה-AI שכבר נמצאים בשימוש שלך",
    platformsBody: "חמש פלטפורמות צ׳אט AI נתמכות.",
    howEyebrow: "שלושה צעדים מדויקים",
    howTitle: "מהיר כשאפשר. כנה כשאי אפשר.",
    steps: [
      ["01", "פותחים שיחה", "משתמשים כרגיל בכל שירות נתמך. פעולת Chat Exporter מופיעה אוטומטית בתוך הצ׳אט."],
      ["02", "מייצאים או מאמתים", "מייצאים מיד את ההודעות שנטענו, או מבצעים סריקה מלאה ואימות שלמות."],
      ["03", "מורידים או מעתיקים", "בוחרים Markdown או טקסט. ייצוא גדול מאוד מחולק בבטחה בתוך קובץ ZIP מאומת אחד."]
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
    local: "העיבוד מתבצע במכשיר. תוכן השיחה אינו משודר.",
    privacyEyebrow: "פרטיות באמצעות ארכיטקטורה",
    privacyTitle: "אין שרת שיחות שצריך לתת בו אמון.",
    privacyBody: "התוסף פועל רק באתרי צ׳אט ה־AI המפורטים כדי שכפתור הפעולה יופיע אוטומטית. התמליל מעובד בדפדפן ונשמר במכשיר. אין אנליטיקה, חשבונות משתמש או קבלת תוכן שיחות.",
    privacyCards: [
      ["רק אתרי צ׳אט AI", "הגישה מוגבלת לחמישה שירותים מפורטים ולדומיינים הקבועים שלהם—לא להיסטוריית הגלישה הכללית."],
      ["ללא קוד מרוחק", "כל הקוד הניתן להפעלה כלול בחבילה שנבדקת בחנות."],
      ["העדפות מקומיות", "הגדרות ממשק וייצוא נשמרות מקומית. שיחות וכתובות שיחה אינן נשמרות על ידי התוסף."]
    ],
    permissions: "הרשאות בשפה פשוטה",
    permissionsBody: "שלוש הרשאות תוסף ורשימה קבועה של אתרי צ׳אט AI מפעילות את כל היכולות.",
    permissionItems: [
      ["activeTab", "ייצוא מהחלון הרגיל לאחר לחיצה יזומה על סמל התוסף."],
      ["scripting", "הרצת מנגנון החילוץ וה־widget הכלולים בחבילה שנבדקה."],
      ["storage", "שמירת הגדרות ממשק וייצוא מקומית, ללא שמירת תוכן שיחות."],
      ["גישה לאתרים", "הצגת ה־widget אוטומטית רק בחמשת שירותי צ׳אט ה־AI המפורטים."]
    ],
    faq: "שאלות שכדאי לענות עליהן לפני ההתקנה",
    faqs: [
      ["האם השיחות נשלחות למקום כלשהו?", "לא. החילוץ ויצירת הקובץ מתבצעים מקומית בדפדפן. אין בתוסף אנליטיקה או לקוח רשת."],
      ["האם כל שיחה ארוכה תיוצא במלואה?", "התוסף מנסה לטעון הודעות קודמות ומדווח על מצב השלמות. אם הפלטפורמה מונעת טעינה מלאה, הייצוא יסומן כחלקי."],
      ["אילו פורמטים נתמכים?", "גרסה 2 תומכת ב־Markdown, טקסט פשוט והעתקה ללוח. ייצוא מעל 10MiB נארז כחלקים ממוספרים בקובץ ZIP אחד."],
      ["היכן מדווחים על בעיה?", "מדווחים על תקלה לא רגישה ב־GitHub Issues ועל בעיית אבטחה בטופס Security Advisory הפרטי."]
    ],
    ctaTitle: "ייצוא אמין מתחיל בהשקה אמינה.",
    ctaBody: "בחרו את הדפדפן והתקינו את Chat Exporter מהחנות הרשמית שלו.",
    by: "פותח ומתוחזק על ידי Tom Raz",
    privacyLink: "מדיניות פרטיות",
    changelog: "יומן שינויים",
    support: "תמיכה",
    version: "גרסה 2.0.0"
  }
} as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [shareStatus, setShareStatus] = useState("");
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

  async function shareProject() {
    const url = "https://chat-exporter.raztom.com";
    const text = "Chat Exporter exports AI conversations locally to Markdown or plain text.";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Chat Exporter", text, url });
        setShareStatus(language === "he" ? "תודה ששיתפתם." : "Thanks for sharing.");
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareStatus(language === "he" ? "הקישור הועתק" : "Link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus(url);
    }
  }

  const launchTitle = language === "he" ? "זמין עכשיו ב-Chrome, Edge ו-Firefox." : t.ctaTitle;
  const launchBody = language === "he" ? "בחרו את הדפדפן והתקינו את Chat Exporter מהחנות הרשמית שלו." : t.ctaBody;

  return (
    <>
      <a className="skip-link" href="#main">{t.skip}</a>
      <header className="site-header">
        <div className="shell nav-inner">
          <a className="site-brand" href="#top" aria-label={language === "he" ? "דף הבית של Chat Exporter" : "Chat Exporter home"}>
            <Image src="/icon128.png" width={34} height={34} alt="" />
            <span><strong>Chat Exporter</strong><small>by Tom Raz</small></span>
          </a>
          <nav aria-label={language === "he" ? "ניווט ראשי" : "Primary navigation"}>
            <a href="#how">{t.navHow}</a>
            <a href="#compatibility">{t.navSupport}</a>
            <a href="#privacy">{t.navPrivacy}</a>
          </nav>
          <div className="nav-actions">
            <button className="language-switch" type="button" onClick={switchLanguage} aria-label={language === "en" ? "הצגת האתר בעברית" : "View site in English"}>{language === "en" ? "עב" : "EN"}</button>
            <span className="release-chip"><i aria-hidden="true" />{language === "he" ? "זמין כעת" : t.navStatus}</span>
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
                <a className="button button-primary" href={stores.chrome} target="_blank" rel="noreferrer">Chrome Web Store</a>
                <a className="button button-secondary" href="https://github.com/talktome8/chat-exporter" target="_blank" rel="noreferrer">{language === "he" ? "הקוד ב-GitHub" : t.reviewCode}</a>
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
              {["ChatGPT", "Claude", "Gemini", "Copilot", "Perplexity"].map((name) => <div className="platform-card verified" key={name}><span aria-hidden="true">{name.slice(0, 1)}</span><strong>{name}</strong><small>{language === "he" ? "נתמך" : "Supported"}</small></div>)}
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

        <section className="section community-section" aria-labelledby="community-title">
          <div className="shell community-card">
            <div>
              <p className="section-kicker">{language === "he" ? "נבנה כדי לעזור" : "Built to be useful"}</p>
              <h2 id="community-title">{language === "he" ? "שיחות שימושיות ראויות לדרך פשוטה יותר לשמור אותן." : "Useful conversations deserve an easier way to keep them."}</h2>
              <p>{language === "he" ? "מכירים מישהו ששומר שיחות AI? שתפו איתו את Chat Exporter. אם משהו לא עובד או שיש רעיון לשיפור, דווחו ב־GitHub Issues עם צילום מסך או תיאור קצר. אם השירות עזר לכם, ביקורת כנה בחנות שבה התקנתם אותו תעזור לאחרים לבחור בצורה מושכלת." : "Know someone who saves AI conversations? Share Chat Exporter with them. If something does not work or you have an improvement idea, report it in GitHub Issues with a screenshot or short description. If the tool has helped you, an honest review in the store where you installed it helps others make an informed choice."}</p>
            </div>
            <div className="community-actions">
              <button className="button button-primary" type="button" onClick={shareProject}>{language === "he" ? "שיתוף Chat Exporter" : "Share Chat Exporter"}</button>
              <a className="button button-secondary" href="#get">{language === "he" ? "בחירת חנות לדירוג" : "Choose a store to review"}</a>
              <a className="button button-secondary" href="https://github.com/talktome8/chat-exporter/issues" target="_blank" rel="noreferrer">{language === "he" ? "דיווח על בעיה" : "Report an issue"}</a>
              <p aria-live="polite">{shareStatus}</p>
            </div>
          </div>
        </section>

        <section className="launch-section" id="get">
          <div className="shell launch-card">
            <div><p className="section-kicker light">Chrome · Edge · Firefox</p><h2>{launchTitle}</h2><p>{launchBody}</p></div>
            <StoreInstallLinks language={language} />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-inner">
          <div className="site-brand"><Image src="/icon128.png" width={30} height={30} alt="" /><span><strong>Chat Exporter</strong><small>{t.by}</small></span></div>
          <div className="footer-links"><Link href="/privacy">{t.privacyLink}</Link><Link href="/changelog">{t.changelog}</Link><a href="https://github.com/talktome8/chat-exporter/issues">{t.support}</a></div>
          <small>{t.version}</small>
        </div>
      </footer>
    </>
  );
}

function StoreInstallLinks({ language }: { language: Language }) {
  return <div className="store-links" aria-label={language === "he" ? "התקנת Chat Exporter" : "Install Chat Exporter"}>
    <a className="store-link" href={stores.chrome} target="_blank" rel="noreferrer">Chrome</a>
    <a className="store-link" href={stores.edge} target="_blank" rel="noreferrer">Edge</a>
    <a className="store-link" href={stores.firefox} target="_blank" rel="noreferrer">Firefox</a>
  </div>;
}

function ProductPreview({ t }: { t: typeof copy.en | typeof copy.he }) {
  return (
    <div className="preview-stage" role="img" aria-label="Chat Exporter product preview">
      <div className="preview-orbit orbit-one" /><div className="preview-orbit orbit-two" />
      <div className="browser-card">
        <div className="browser-bar"><span /><span /><span /><div>chatgpt.com / conversation</div></div>
        <div className="conversation-demo"><p className="message user">How should I structure the launch?</p><p className="message assistant">Start with a clear release gate: compatibility, privacy, policy and evidence-based testing.</p><p className="message user short">Export this for me.</p></div>
      </div>
      <div className="popup-card">
        <div className="popup-head"><Image src="/icon128.png" width={38} height={38} alt="" /><div><strong>Chat Exporter</strong><small>by Tom Raz</small></div><span className="demo-language">עב</span></div>
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
