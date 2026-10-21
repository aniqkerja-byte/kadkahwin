import { test, expect } from '@playwright/test';

test('horizontal transition handles interrupted navigation without stale pages or overlays', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('nav a[href="#dresscode"]').click();
  await expect(page.locator('.site-transition-old')).toHaveCount(1);
  await expect(page.locator('.site-transition-new')).toHaveCount(1);
  // A later explicit destination must win while the previous sheet is moving.
  await page.evaluate(() => { location.hash = 'note'; });
  await expect(page.locator('main')).toHaveAttribute('data-page', 'note');
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  await expect(page.locator('.site-transition-layer')).toHaveCount(0);
  await expect(page.locator('.page')).toHaveCount(1);
  await expect(page.locator('#page-title')).toBeFocused();
  await page.locator('nav a[href="#rsvp"]').click();
  await expect(page.locator('main')).toHaveAttribute('data-page', 'rsvp');
  await page.getByLabel('Nama penuh').fill('Tetamu Animasi');
  await page.locator('nav a[href="#home"]').click();
  await expect(page.locator('main')).toHaveAttribute('data-page', 'home');
  await page.locator('nav a[href="#rsvp"]').click();
  await expect(page.getByLabel('Nama penuh')).toHaveValue('Tetamu Animasi');
  expect(errors).toEqual([]);
});

test('original outfit colors remain unfiltered in the outgoing transition layer', async ({ page }) => {
  await page.goto('/#dresscode');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  expect(await page.locator('main .piece-art').first().evaluate(element => getComputedStyle(element).filter)).toBe('none');
  await page.locator('nav a[href="#location"]').click();
  const outgoing = page.locator('.site-transition-old');
  await expect(outgoing).toHaveCount(1);
  const art = await outgoing.locator('.piece-art').first().evaluate(element => ({ filter: getComputedStyle(element).filter, source: getComputedStyle(element).backgroundImage }));
  expect(art.filter).toBe('none');
  expect(art.source).toContain('/assets/dresscode-pieces.png');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'location');
});

test('reduced motion and resize settle a transition with the correct destination', async ({ page }) => {
  await page.goto('/');
  await page.locator('nav a[href="#note"]').click();
  await expect(page.locator('.site-transition-layer')).toHaveCount(2);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('main')).toHaveAttribute('data-page', 'note');
  await expect(page.locator('.site-transition-layer')).toHaveCount(0);
  expect(await page.locator('main').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('nav a[href="#dresscode"]').click();
  await page.setViewportSize({ width: 390, height: 600 });
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
  await expect(page.locator('.site-transition-layer')).toHaveCount(0);
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
});

test('first home reveal waits for both name fonts instead of showing fallback text', async ({ page }) => {
  let releaseFonts;
  const fontGate = new Promise(resolve => { releaseFonts = resolve; });
  const nameFontRequested = new Promise(resolve => {
    page.route(/(?:great-vibes|allura).*\.woff2?/, async route => {
      resolve();
      await fontGate;
      await route.continue();
    });
  });
  await page.goto('/#home', { waitUntil: 'domcontentloaded' });
  await nameFontRequested;
  expect(await page.locator('.couple-names').count()).toBe(0);
  releaseFonts();
  await expect(page.locator('main .couple-names')).toBeVisible();
  expect(await page.evaluate(() => document.fonts.check('400 16px "Great Vibes"') && document.fonts.check('400 16px "Allura"'))).toBe(true);
});
