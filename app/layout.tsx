import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://raztom.com"),
  title: "Chat Exporter by Tom Raz — Export AI conversations locally",
  description: "Export ChatGPT, Claude, Gemini, Copilot and Perplexity conversations to Markdown or text—locally in your browser.",
  alternates: { canonical: "/chat-exporter" },
  icons: { icon: "/icon128.png", shortcut: "/icon128.png", apple: "/icon128.png" },
  openGraph: {
    title: "Chat Exporter by Tom Raz",
    description: "A private, local-first way to export AI conversations.",
    url: "/chat-exporter",
    siteName: "Tom Raz",
    type: "website"
  },
  twitter: { card: "summary", title: "Chat Exporter by Tom Raz", description: "Export AI conversations locally." },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
