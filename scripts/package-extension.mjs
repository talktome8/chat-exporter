import { ZipArchive } from "archiver";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";

const buildsRoot = path.resolve("dist/extension-builds");
const sourceManifest = JSON.parse(await readFile(path.resolve("extension/manifest.json"), "utf8"));
const artifactVersion = sourceManifest.version;
const outputRoot = path.resolve("dist");
const fixedDate = new Date("1980-01-01T00:00:00.000Z");

async function filesUnder(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = path.posix.join(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(absolute, relative));
    else files.push({ absolute, relative });
  }
  return files;
}

await mkdir(outputRoot, { recursive: true });
for (const target of ["chrome", "edge", "firefox"]) {
  const sourceRoot = path.join(buildsRoot, target);
  const outputPath = path.join(outputRoot, `chat-exporter-by-tom-raz-${artifactVersion}-${target}.zip`);
  await rm(outputPath, { force: true });
  await new Promise(async (resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });
    output.on("close", resolve); output.on("error", reject); archive.on("error", reject); archive.pipe(output);
    for (const file of await filesUnder(sourceRoot)) archive.append(await readFile(file.absolute), { name: file.relative, date: fixedDate, mode: 0o644 });
    await archive.finalize();
  });
  console.log(outputPath);
}
