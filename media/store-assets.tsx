import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

type Locale = 'en' | 'he';
type Slide = 1 | 2 | 3 | 4 | 5;

const copy = {
  en: [
    ['Export the chat you already have', 'Capture loaded messages instantly, then save a clean, readable copy.'],
    ['Your conversation. Your format.', 'Export as Markdown or plain text — or copy everything to your clipboard.'],
    ['Need every message? Verify it.', 'Run a controlled full-conversation check only when completeness matters.'],
    ['Private by design', 'Your conversation is processed on your device. No account, analytics, servers, or remote code.'],
    ['Built for the AI tools you use', 'Official support for ChatGPT, Claude, Gemini, Copilot, and Perplexity.'],
  ],
  he: [
    ['השיחה שלך, בקובץ אחד', 'ייצוא מיידי של ההודעות שכבר נטענו לקובץ נקי, מסודר וקריא.'],
    ['השיחה שלך. הפורמט שלך.', 'ייצוא ל‑Markdown או לטקסט פשוט — או העתקה ישירה ללוח.'],
    ['חשוב לקבל הכול? אפשר לוודא.', 'בדיקה מבוקרת של השיחה המלאה מופעלת רק כאשר השלמות חשובה.'],
    ['פרטי מלכתחילה', 'השיחה מעובדת במכשיר שלך בלבד. ללא חשבון, אנליטיקה, שרתים או קוד מרוחק.'],
    ['נבנה עבור כלי ה‑AI שלך', 'תמיכה רשמית ב‑ChatGPT, Claude, Gemini, Copilot ו‑Perplexity.'],
  ],
} as const;

const colors = {
  bg: '#07101f',
  panel: '#0d192b',
  panel2: '#101f35',
  line: '#233754',
  blue: '#2788ff',
  cyan: '#43d6dc',
  text: '#f6f9ff',
  muted: '#a9b8ce',
  green: '#2fd18b',
};

const font = 'Inter, Segoe UI, Arial, sans-serif';

const Icon = ({size = 54}: {size?: number}) => (
  <Img src={staticFile('icon128.png')} style={{width: size, height: size, borderRadius: size * 0.22}} />
);

const BrowserChrome = ({locale, slide}: {locale: Locale; slide: Slide}) => {
  const rtl = locale === 'he';
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 235, bottom: 50, borderRadius: 22, overflow: 'hidden', border: `1px solid ${colors.line}`, background: '#f7f9fc', boxShadow: '0 30px 80px #0009'}}>
      <div style={{height: 50, background: '#111c2e', display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px'}}>
        {['#ff6b6b', '#ffd166', '#42d392'].map((c) => <span key={c} style={{width: 11, height: 11, borderRadius: 20, background: c}} />)}
        <div style={{marginLeft: 18, color: '#9eb0c9', font: `500 14px ${font}`}}>ai.example.com/conversation</div>
      </div>
      <div style={{position: 'absolute', inset: '50px 0 0', display: 'flex', background: '#f4f7fb'}}>
        <div style={{flex: 1, padding: '34px 510px 30px 48px', color: '#172033', fontFamily: font}}>
          <div style={{fontSize: 14, color: '#7a879b', marginBottom: 22}}>DEMO CONVERSATION · NO PERSONAL DATA</div>
          <div style={{background: '#e8eef7', borderRadius: 16, padding: '17px 20px', marginBottom: 18, fontSize: 18, lineHeight: 1.45}}>
            {rtl ? 'סכם את עיקרי השיחה ושמור על מבנה הכותרות.' : 'Summarize our discussion and preserve the heading structure.'}
          </div>
          <div style={{fontSize: 18, lineHeight: 1.52}}>
            <strong>{rtl ? 'סיכום השיחה' : 'Conversation summary'}</strong>
            <ul style={{paddingInlineStart: 25}}>
              <li>{rtl ? 'החלטות מרכזיות נשמרות בצורה ברורה.' : 'Key decisions remain easy to scan.'}</li>
              <li>{rtl ? 'קוד, קישורים ורשימות שומרים על המבנה.' : 'Code, links, and lists keep their structure.'}</li>
              <li>{rtl ? 'הקובץ נשמר מקומית במכשיר.' : 'The file stays local on your device.'}</li>
            </ul>
          </div>
        </div>
        <Popup locale={locale} slide={slide} />
      </div>
    </div>
  );
};

const Choice = ({active, title, detail}: {active?: boolean; title: string; detail: string}) => (
  <div style={{border: `1px solid ${active ? colors.blue : '#dbe3ee'}`, background: active ? '#eef6ff' : '#fff', borderRadius: 12, padding: '13px 14px'}}>
    <div style={{fontSize: 15, fontWeight: 700, color: '#172033'}}>{title}</div>
    <div style={{fontSize: 12, color: '#6f7d91', marginTop: 4}}>{detail}</div>
  </div>
);

const Popup = ({locale, slide}: {locale: Locale; slide: Slide}) => {
  const rtl = locale === 'he';
  const t = (en: string, he: string) => rtl ? he : en;
  return (
    <div dir={rtl ? 'rtl' : 'ltr'} style={{position: 'absolute', width: 430, right: 28, top: 22, bottom: 22, borderRadius: 18, background: '#fff', boxShadow: '0 16px 45px #14213d33', overflow: 'hidden', fontFamily: font}}>
      <div style={{height: 70, display: 'flex', alignItems: 'center', gap: 12, padding: '0 19px', borderBottom: '1px solid #e5eaf1'}}>
        <Icon size={43} />
        <div><div style={{fontWeight: 800, fontSize: 18, color: '#101828'}}>Chat Exporter <span style={{fontSize: 11, fontWeight: 500, color: '#667085'}}>by Tom Raz</span></div><div style={{fontSize: 12, color: '#667085', marginTop: 3}}>{t('Private, local AI chat export', 'ייצוא שיחות AI פרטי ומקומי')}</div></div>
      </div>
      <div style={{padding: 20}}>
        {slide === 1 && <>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#667085', fontSize: 12, fontWeight: 800, marginBottom: 7}}><span>{t('CHATGPT', 'CHATGPT')}</span><span style={{padding: '3px 8px', borderRadius: 99, background: '#eef1f5', color: '#475467'}}>{t('Loaded', 'נטען')}</span></div>
          <h3 style={{margin: '0 0 4px', fontSize: 22, color: '#101828'}}>{t('24 messages found', 'נמצאו 24 הודעות')}</h3>
          <p style={{margin: '0 0 18px', color: '#667085', fontSize: 13}}>{t('Messages already loaded · verify when needed', 'הודעות שכבר נטענו · אפשר לאמת לפי הצורך')}</p>
          <button style={button}>{rtl ? <span>ייצוא כקובץ <bdi>Markdown</bdi></span> : 'Export Markdown'}</button>
          <button style={secondaryButton}>{t('Verify full conversation', 'אימות השיחה המלאה')}</button>
        </>}
        {slide === 2 && <>
          <h3 style={popupTitle}>{t('Choose an export format', 'בחירת פורמט לייצוא')}</h3>
          <div style={{display: 'grid', gap: 10}}>
            <Choice active title="Markdown (.md)" detail={t('Headings, lists, links, code, tables', 'כותרות, רשימות, קישורים, קוד וטבלאות')} />
            <Choice title={t('Plain text (.txt)', 'טקסט פשוט (.txt)')} detail={t('Clean text for any editor', 'טקסט נקי לכל עורך')} />
            <Choice title={t('Copy to clipboard', 'העתקה ללוח')} detail={t('Paste anywhere immediately', 'הדבקה מיידית בכל מקום')} />
          </div>
          <button style={{...button, marginTop: 16}}>{t('Export conversation', 'ייצוא השיחה')}</button>
        </>}
        {slide === 3 && <>
          <div style={{height: 9, background: '#e7eef7', borderRadius: 9, overflow: 'hidden', margin: '10px 0 22px'}}><div style={{width: '100%', height: '100%', background: `linear-gradient(90deg, ${colors.blue}, ${colors.cyan})`}} /></div>
          <div style={{width: 62, height: 62, borderRadius: 62, background: '#e8fff5', color: colors.green, display: 'grid', placeItems: 'center', fontSize: 32, margin: '0 auto 15px'}}>✓</div>
          <h3 style={{...popupTitle, textAlign: 'center'}}>{t('Complete conversation', 'השיחה המלאה נטענה')}</h3>
          <p style={{textAlign: 'center', color: '#667085', fontSize: 14, lineHeight: 1.5}}>{t('The history stabilized and 86 messages are ready.', 'ההיסטוריה התייצבה ו‑86 הודעות מוכנות לייצוא.')}</p>
          <button style={{...button, marginTop: 14}}>{rtl ? <span>ייצוא כקובץ <bdi>Markdown</bdi></span> : 'Export Markdown'}</button>
        </>}
        {slide === 4 && <>
          <h3 style={popupTitle}>{t('Processed on this device', 'העיבוד מתבצע במכשיר זה')}</h3>
          {[t('No account required', 'ללא צורך בחשבון'), t('No analytics or tracking', 'ללא אנליטיקה או מעקב'), t('No conversation uploads', 'ללא העלאת שיחות'), t('No remote code', 'ללא קוד מרוחק')].map((item) => (
            <div key={item} style={{display: 'flex', alignItems: 'center', gap: 11, padding: '12px 0', borderBottom: '1px solid #edf0f5', color: '#263247', fontSize: 15}}><span style={{color: colors.green, fontWeight: 900}}>✓</span>{item}</div>
          ))}
          <div style={{marginTop: 20, padding: 13, background: '#effbf6', borderRadius: 12, color: '#237653', fontSize: 13}}>{t('Nothing is sent to Tom Raz.', 'שום דבר לא נשלח לתום רז.')}</div>
        </>}
        {slide === 5 && <>
          <h3 style={popupTitle}>{t('Supported platforms', 'פלטפורמות נתמכות')}</h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
            {['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Perplexity'].map((name) => <div key={name} style={{padding: '15px 10px', borderRadius: 12, background: '#f5f8fc', color: '#1c2940', fontWeight: 750, textAlign: 'center', border: '1px solid #e1e8f2'}}>{name}</div>)}
          </div>
          <p style={{fontSize: 12, color: '#7b8798', lineHeight: 1.5, marginTop: 18}}>{t('If a page cannot be read, Chat Exporter tells you before you export.', 'אם לא ניתן לקרוא עמוד, Chat Exporter מציג זאת לפני הייצוא.')}</p>
        </>}
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderTop: '1px solid #edf0f5', color: '#667085', fontSize: 11}}>● <span style={{color: colors.green, marginInlineStart: 5}}>{t('Processed on this device', 'העיבוד מתבצע במכשיר זה')}</span></div>
    </div>
  );
};

const button: React.CSSProperties = {width: '100%', border: 0, borderRadius: 11, padding: '13px 16px', background: colors.blue, color: '#fff', fontSize: 15, fontWeight: 800};
const secondaryButton: React.CSSProperties = {...button, marginTop: 10, background: '#fff', color: '#155ac7', border: '1px solid #bcd4f7'};
const popupTitle: React.CSSProperties = {fontSize: 21, color: '#101828', margin: '4px 0 17px'};

export const StoreScreenshot: React.FC<{locale: Locale; slide: Slide}> = ({locale, slide}) => {
  const rtl = locale === 'he';
  const [title, subtitle] = copy[locale][slide - 1];
  return (
    <AbsoluteFill dir={rtl ? 'rtl' : 'ltr'} style={{background: `radial-gradient(circle at 82% 5%, #12396c 0, ${colors.bg} 42%)`, color: colors.text, fontFamily: font, overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: 62, left: 72, right: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{maxWidth: 900}}><h1 style={{fontSize: 44, letterSpacing: -1.5, margin: 0, lineHeight: 1.1}}>{title}</h1><p style={{fontSize: 19, color: colors.muted, margin: '12px 0 0', lineHeight: 1.45}}>{subtitle}</p></div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginInlineStart: 28}}><Icon size={52} /><div style={{fontSize: 18, fontWeight: 800, whiteSpace: 'nowrap'}}>Chat Exporter</div></div>
      </div>
      <BrowserChrome locale={locale} slide={slide} />
    </AbsoluteFill>
  );
};

export const PromoTile: React.FC<{wide: boolean}> = ({wide}) => (
  <AbsoluteFill style={{background: 'linear-gradient(135deg, #07101f 0%, #12345f 65%, #0d78d8 100%)', color: '#fff', fontFamily: font, overflow: 'hidden'}}>
    <div style={{position: 'absolute', width: wide ? 620 : 260, height: wide ? 620 : 260, borderRadius: '50%', right: wide ? -90 : -110, top: wide ? -180 : -90, background: '#38d6dc22', border: '1px solid #7ef4f455'}} />
    <div style={{position: 'absolute', inset: wide ? '0 95px' : '0 30px', display: 'flex', alignItems: 'center', gap: wide ? 38 : 16}}>
      <Icon size={wide ? 150 : 78} />
      <div><div style={{fontSize: wide ? 62 : 31, fontWeight: 850, letterSpacing: wide ? -2 : -1}}>Chat Exporter</div><div style={{fontSize: wide ? 27 : 15, color: '#c6d8ed', marginTop: wide ? 10 : 6}}>Private. Local. Yours.</div></div>
    </div>
  </AbsoluteFill>
);
