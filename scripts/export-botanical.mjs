import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const source = await readFile(new URL('../references/editorial/botanical-v2.png', import.meta.url));
  const data = await page.evaluate(async base64 => {
    const image = new Image();
    image.src = 'data:image/png;base64,' + base64;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = Math.round(image.height * 800 / image.width);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/webp', .92).split(',')[1];
  }, source.toString('base64'));
  await writeFile(new URL('../public/assets/editorial/botanical-v2.webp', import.meta.url), Buffer.from(data, 'base64'));
} finally { await browser.close(); }
