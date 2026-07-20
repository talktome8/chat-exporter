import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://github.com/talktome8/chat-exporter/"),
  title: "Chat Exporter by Tom Raz — Export AI conversations locally",
  description: "Export AI conversations to Markdown or text, locally in your browser.",
  icons: { icon: "/icon128.png", shortcut: "/icon128.png", apple: "/icon128.png" },
  openGraph: {
    title: "Chat Exporter by Tom Raz",
    description: "A private, local-first way to export AI conversations.",
    type: "website",
    images: [{ url: "https://raw.githubusercontent.com/talktome8/chat-exporter/main/public/og.png", width: 1730, height: 909, alt: "Chat Exporter — Private, local AI chat export" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Chat Exporter by Tom Raz",
    description: "Export AI conversations locally.",
    images: ["https://raw.githubusercontent.com/talktome8/chat-exporter/main/public/og.png"]
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
