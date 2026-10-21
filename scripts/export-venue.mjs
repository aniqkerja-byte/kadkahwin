import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

// Mechanical web export only; preserve the generated colors and transparency.
const source = await readFile(new URL('../references/venue/mosque-gold-source-v1.png', import.meta.url));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const result = await page.evaluate(async base64 => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = Math.round(image.height * canvas.width / image.width);
    const context = canvas.getContext('2d');
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { data: canvas.toDataURL('image/webp', .92).split(',')[1], width: canvas.width, height: canvas.height };
  }, source.toString('base64'));
  await writeFile(new URL('../public/assets/mosque-gold-v1.webp', import.meta.url), Buffer.from(result.data, 'base64'));
  console.log(`Exported mosque-gold-v1.webp: ${result.width} × ${result.height}`);
} finally {
  await browser.close();
}
