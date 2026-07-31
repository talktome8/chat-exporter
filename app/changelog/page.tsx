import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Changelog — Chat Exporter by Tom Raz",
  description: "Release history for Chat Exporter."
};

export default function ChangelogPage() {
  return (
    <main className="legal-page">
      <div className="legal-shell">
        <Link className="legal-back" href="/">← Chat Exporter</Link>
        <p className="section-kicker">Release history</p>
        <h1>Changelog</h1>
        <section>
          <h2>1.0.0 — Released</h2>
          <p>Available on <a href="https://chromewebstore.google.com/detail/chat-exporter-by-tom-raz/ljgpghdicijmjojfnhmpefjpipfakoen">Chrome</a>, <a href="https://microsoftedge.microsoft.com/addons/detail/chat-exporter-by-tom-raz/nmmpfdnapkfklcbfgcmkahcjcclophhk">Microsoft Edge</a>, and <a href="https://addons.mozilla.org/he/firefox/addon/chat-exporter-by-tom-raz/">Firefox</a>.</p>
          <ul>
            <li>Added launch support for ChatGPT, Claude, Gemini, Copilot and Perplexity.</li>
            <li>Added controlled long-conversation loading and completeness reporting.</li>
            <li>Reduced permissions to activeTab, scripting and storage.</li>
            <li>Added English and Hebrew interfaces, local Markdown/text export, privacy documentation and reproducible packaging.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
