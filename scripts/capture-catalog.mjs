import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
await mkdir(new URL('../public/assets/catalog/', import.meta.url), { recursive: true });
try {
  for (const [name, path] of [['burgundy', '/#home'], ['editorial', '/editorial/']]) {
    for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      await page.goto(base + path);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('h1').waitFor();
      await page.waitForFunction(() => [...document.images].filter(i => i.getAttribute('src') && i.loading !== 'lazy').every(i => i.complete && i.naturalWidth > 0));
      const screenshot = await page.screenshot();
      const data = await page.evaluate(async base64 => {
        const image = new Image();
        image.src = 'data:image/png;base64,' + base64;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width; canvas.height = image.height;
        canvas.getContext('2d').drawImage(image, 0, 0);
        return canvas.toDataURL('image/webp', .88).split(',')[1];
      }, screenshot.toString('base64'));
      await writeFile(new URL('../public/assets/catalog/' + name + '-' + device + '.webp', import.meta.url), Buffer.from(data, 'base64'));
      await page.close();
      console.log('Captured ' + name + ' ' + device);
    }
  }
} finally { await browser.close(); }

