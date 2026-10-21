import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const svg = await readFile(new URL('../public/assets/og-demo.svg', import.meta.url), 'utf8');
  await page.setContent(`<style>body{margin:0}svg{display:block}</style>${svg}`);
  await page.screenshot({ path: fileURLToPath(new URL('../public/assets/og-demo.png', import.meta.url)) });
} finally {
  await browser.close();
}
