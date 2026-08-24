import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const source = path.resolve("extension");
const root = path.resolve("dist/extension-builds");
const targets = ["chrome", "edge", "firefox"];

await rm(root, { recursive: true, force: true });
await mkdir(root, { recursive: true });

for (const target of targets) {
  const destination = path.join(root, target);
  await cp(source, destination, { recursive: true });
  const manifestPath = path.join(destination, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (target === "firefox") delete manifest.background.service_worker;
  else {
    delete manifest.background.scripts;
    delete manifest.browser_specific_settings;
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

console.log(root);
