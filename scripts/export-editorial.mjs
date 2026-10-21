import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await mkdir(new URL('../public/assets/editorial/', import.meta.url), { recursive: true });
  for (const name of ['hero', 'walk', 'portrait', 'details']) {
    const source = await readFile(new URL('../references/editorial/' + name + '-v1.png', import.meta.url));
    for (const width of [480, 960, 1600]) {
      const data = await page.evaluate(async ({ base64, width }) => {
        const image = new Image();
        image.src = 'data:image/png;base64,' + base64;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = Math.round(image.height * width / image.width);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/webp', .86).split(',')[1];
      }, { base64: source.toString('base64'), width });
      await writeFile(new URL('../public/assets/editorial/' + name + '-' + width + '.webp', import.meta.url), Buffer.from(data, 'base64'));
    }
    console.log('Exported ' + name + ' at 480 / 960 / 1600px');
  }
} finally { await browser.close(); }
