import { cp, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const { version } = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const kit = path.join(root, "dist", `store-submission-kit-${version}`);

await mkdir(kit, { recursive: true });
await cp(path.join(root, "store-assets", "en"), path.join(kit, "screenshots", "en"), { recursive: true, force: true });
await cp(path.join(root, "store-assets", "he"), path.join(kit, "screenshots", "he"), { recursive: true, force: true });

for (const [source, destination] of [
  ["extension/icons/icon128.png", "icon128.png"],
  ["store-assets/promo-small-440x280.png", "promo-small-440x280.png"],
  ["store-assets/promo-marquee-1400x560.png", "promo-marquee-1400x560.png"],
  ["PRIVACY.md", "PRIVACY.md"],
  ["docs/STORE_SUBMISSION_2.0.md", "STORE_SUBMISSION_2.0.md"],
  [`dist/SHA256SUMS-${version}.txt`, `SHA256SUMS-${version}.txt`],
  ...["chrome", "edge", "firefox"].map((browser) => [
    `dist/chat-exporter-by-tom-raz-${version}-${browser}.zip`,
    `chat-exporter-by-tom-raz-${version}-${browser}.zip`
  ])
]) {
  await cp(path.join(root, source), path.join(kit, destination), { force: true });
}

console.log(kit);
