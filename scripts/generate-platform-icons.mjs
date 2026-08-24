import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("extension/platforms");
const icons = [
  { id: "chatgpt", light: "https://svgl.app/library/openai.svg", dark: "https://svgl.app/library/openai_dark.svg" },
  { id: "claude", light: "https://svgl.app/library/claude-ai-icon.svg" },
  { id: "gemini", light: "https://svgl.app/library/gemini.svg" },
  { id: "copilot", light: "https://svgl.app/library/microsoft-copilot.svg" },
  { id: "perplexity", light: "https://svgl.app/library/perplexity.svg" },
  { id: "grok", light: "https://svgl.app/library/grok-light.svg", dark: "https://svgl.app/library/grok-dark.svg" }
];

await mkdir(output, { recursive: true });
for (const icon of icons) {
  for (const [variant, url] of [["light", icon.light], ["dark", icon.dark]]) {
    if (!url) continue;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not download ${icon.id} ${variant} icon: ${response.status}`);
    const svg = Buffer.from(await response.arrayBuffer());
    const suffix = variant === "dark" ? "-dark" : "";
    await sharp(svg).resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(output, `${icon.id}${suffix}.png`));
  }
}
