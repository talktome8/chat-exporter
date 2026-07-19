import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Changelog — Chat Exporter by Tom Raz", description: "Release history for Chat Exporter." };

export default function ChangelogPage() {
  return <main className="legal-page"><div className="legal-shell"><Link className="legal-back" href="/">← Chat Exporter</Link><p className="section-kicker">Release history</p><h1>Changelog</h1><section><h2>1.0.0 — Release candidate</h2><p>Prepared for Chrome, Edge and Firefox review.</p><ul><li>Added verified adapters for ChatGPT, Claude, Gemini, Copilot and Perplexity.</li><li>Added clearly labelled beta support for Grok and Mistral.</li><li>Added controlled long-conversation loading and completeness reporting.</li><li>Reduced permissions to activeTab, scripting and storage.</li><li>Added English and Hebrew interfaces, local Markdown/text export, privacy documentation and reproducible packaging.</li></ul></section></div></main>;
}
