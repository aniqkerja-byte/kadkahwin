import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

// Mechanical web exports only: preserve the generated artwork, colors and alpha.
const editions = {
  v1: { source: 'monogram-as-gold-source-v1.png', logo: 'monogram-as-gold-v1', favicon: 'monogram-as-gold-favicon-v1' },
  v3: { source: 'monogram-as-reference-gold-source-v3.png', logo: 'monogram-as-reference-gold-v3', favicon: 'monogram-as-reference-gold-favicon-v3' },
};
const edition = editions[process.argv[2] ?? 'v1'];
if (!edition) throw new Error('Choose edition v1 or v3.');
const source = await readFile(new URL(`../references/branding/${edition.source}`, import.meta.url));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const result = await page.evaluate(async base64 => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const scan = document.createElement('canvas');
    scan.width = image.width;
    scan.height = image.height;
    const context = scan.getContext('2d');
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, scan.width, scan.height).data;
    let left = scan.width, top = scan.height, right = 0, bottom = 0;
    let transparent = 0;
    for (let y = 0; y < scan.height; y++) {
      for (let x = 0; x < scan.width; x++) {
        if (pixels[(y * scan.width + x) * 4 + 3] === 0) { transparent++; continue; }
        left = Math.min(left, x); top = Math.min(top, y);
        right = Math.max(right, x); bottom = Math.max(bottom, y);
      }
    }
    if (!transparent) throw new Error('The generated logo must have genuine transparency.');
    const padding = Math.ceil(Math.max(right - left + 1, bottom - top + 1) * .025);
    left = Math.max(0, left - padding); top = Math.max(0, top - padding);
    right = Math.min(scan.width - 1, right + padding); bottom = Math.min(scan.height - 1, bottom + padding);
    const width = right - left + 1, height = bottom - top + 1;
    const web = document.createElement('canvas');
    web.width = 768;
    web.height = Math.round(768 * height / width);
    const webContext = web.getContext('2d');
    webContext.imageSmoothingQuality = 'high';
    webContext.drawImage(image, left, top, width, height, 0, 0, web.width, web.height);
    const icon = document.createElement('canvas');
    icon.width = icon.height = 128;
    const scale = 118 / Math.max(width, height);
    const iconContext = icon.getContext('2d');
    iconContext.imageSmoothingQuality = 'high';
    iconContext.drawImage(image, left, top, width, height, (128 - width * scale) / 2, (128 - height * scale) / 2, width * scale, height * scale);
    return { width: web.width, height: web.height, sourceWidth: image.width, sourceHeight: image.height,
      transparentFraction: transparent / (scan.width * scan.height),
      web: web.toDataURL('image/webp', .92).split(',')[1], icon: icon.toDataURL('image/png').split(',')[1] };
  }, source.toString('base64'));
  const { web, icon, ...metadata } = result;
  await writeFile(new URL(`../public/assets/${edition.logo}.webp`, import.meta.url), Buffer.from(web, 'base64'));
  await writeFile(new URL(`../public/assets/${edition.favicon}.png`, import.meta.url), Buffer.from(icon, 'base64'));
  await writeFile(new URL(`../references/branding/${edition.logo}-export.json`, import.meta.url), JSON.stringify(metadata, null, 2) + '\n');
  console.log(metadata);
} finally {
  await browser.close();
}
