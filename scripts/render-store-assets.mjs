import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill} from '@remotion/renderer';

const root = process.cwd();
const entry = path.join(root, 'media', 'index.ts');
const jobs = [];

for (const locale of ['EN', 'HE']) {
  for (let slide = 1; slide <= 5; slide += 1) {
    const number = String(slide).padStart(2, '0');
    jobs.push([`Store-${locale}-${number}`, path.join('store-assets', locale.toLowerCase(), `${number}.png`)]);
  }
}

jobs.push(['Promo-Small', path.join('store-assets', 'promo-small-440x280.png')]);
jobs.push(['Promo-Marquee', path.join('store-assets', 'promo-marquee-1400x560.png')]);

mkdirSync(path.join(root, 'store-assets', 'en'), {recursive: true});
mkdirSync(path.join(root, 'store-assets', 'he'), {recursive: true});

const serveUrl = await bundle({entryPoint: entry});
const compositions = await getCompositions(serveUrl);

for (const [composition, output] of jobs) {
  const selected = compositions.find(({id}) => id === composition);
  if (!selected) throw new Error(`Missing Remotion composition: ${composition}`);
  await renderStill({
    composition: selected,
    serveUrl,
    output: path.join(root, output),
    imageFormat: 'png',
  });
  console.log(`Rendered ${output}`);
}
