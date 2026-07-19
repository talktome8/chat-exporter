import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";

const sizes = [16, 32, 48, 128];

function iconSvg(size) {
  const compact = size <= 20;
  const padding = compact ? 1 : Math.round(size * 0.045);
  const radius = Math.round(size * 0.22);
  const bubbleX = Math.round(size * (compact ? 0.17 : 0.14));
  const bubbleY = Math.round(size * (compact ? 0.19 : 0.17));
  const bubbleW = Math.round(size * (compact ? 0.66 : 0.72));
  const bubbleH = Math.round(size * (compact ? 0.48 : 0.49));
  const arrowStroke = Math.max(compact ? 2.1 : 3, size * (compact ? 0.13 : 0.075));
  const center = size / 2;
  const arrowTop = size * (compact ? 0.32 : 0.27);
  const arrowBottom = size * (compact ? 0.73 : 0.76);
  const arrowWing = size * (compact ? 0.17 : 0.18);
  const tail = compact ? "" : `<path d="M${bubbleX + size * .09} ${bubbleY + bubbleH - 1} L${bubbleX + size * .02} ${bubbleY + bubbleH + size * .13} L${bubbleX + size * .25} ${bubbleY + bubbleH - 1} Z" fill="#fff"/>`;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect x="${padding}" y="${padding}" width="${size - padding * 2}" height="${size - padding * 2}" rx="${radius}" fill="#1769E0"/>
      <rect x="${bubbleX}" y="${bubbleY}" width="${bubbleW}" height="${bubbleH}" rx="${Math.round(size * .12)}" fill="#fff"/>
      ${tail}
      <path d="M${center} ${arrowTop} V${arrowBottom} M${center - arrowWing} ${arrowBottom - arrowWing} L${center} ${arrowBottom} L${center + arrowWing} ${arrowBottom - arrowWing}" fill="none" stroke="#1769E0" stroke-width="${arrowStroke}" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
}

await mkdir("extension/icons", { recursive: true });
for (const size of sizes) {
  await sharp(Buffer.from(iconSvg(size))).png({ compressionLevel: 9 }).toFile(`extension/icons/icon${size}.png`);
}
await copyFile("extension/icons/icon128.png", "public/icon128.png");
