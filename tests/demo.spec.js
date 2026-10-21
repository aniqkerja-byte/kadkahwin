import { test, expect } from '@playwright/test';

const pages = ['home', 'invitation', 'dresscode', 'location', 'rsvp', 'note'];

for (const viewport of [{ width: 320, height: 640 }, { width: 390, height: 844 }, { width: 768, height: 900 }, { width: 1440, height: 900 }]) {
  test(`demo pages load without broken assets or horizontal overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = [];
    const failedResponses = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failedResponses.push(response.url()); });
    for (const id of pages) {
      await page.goto(`/#${id}`);
      await expect(page.locator('main')).toHaveAttribute('data-page', id);
      await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
      await expect(page.locator('#page-title')).toBeVisible();
      await expect.poll(() => page.locator('main img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const bounds = await page.locator('.page').boundingBox();
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height + 1);
      await expect(page).toHaveTitle(/Adam & Sara/);
    }
    expect(errors).toEqual([]);
    expect(failedResponses).toEqual([]);
  });
}

test('RSVP validates and simulates both responses without transmitting or storing guest data', async ({ page }) => {
  const apiRequests = [];
  page.on('request', request => { if (request.method() !== 'GET' || request.url().includes('/api/')) apiRequests.push(request.url()); });
  await page.goto('/#rsvp');
  await expect(page.locator('.demo-notice')).toContainText('tiada maklumat dihantar atau disimpan');
  await page.getByRole('button', { name: 'Hantar RSVP' }).click();
  await expect(page.locator('#name-error')).toContainText('Sila masukkan nama');
  await expect(page.locator('#attendance-error')).toContainText('Sila pilih');
  await page.getByLabel('Nama penuh').fill('Tetamu Contoh');
  await page.locator('input[value="yes"]').check();
  await page.getByRole('spinbutton').fill('100');
  await page.getByRole('button', { name: 'Hantar RSVP' }).click();
  await expect(page.locator('#pax-error')).toContainText('antara 1 hingga 99');
  await page.getByRole('spinbutton').fill('2');
  await page.getByRole('button', { name: 'Hantar RSVP' }).click();
  await expect(page.locator('.rsvp-saved')).toHaveText('Simulasi RSVP berjaya. Tiada maklumat dihantar atau disimpan.');
  await page.reload();
  await expect(page.getByLabel('Nama penuh')).toHaveValue('');
  await page.getByLabel('Nama penuh').fill('Tetamu Contoh');
  await page.locator('input[value="no"]').check();
  await expect(page.locator('.pax-field')).toBeHidden();
  await page.getByRole('button', { name: 'Hantar RSVP' }).click();
  await expect(page.locator('h1')).toContainText('dalam doa');
  expect(apiRequests).toEqual([]);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test('location shows fictional details and has no phone or WhatsApp destinations', async ({ page }) => {
  await page.goto('/#location');
  await expect(page.locator('.location-details')).toContainText('Dewan Seri Impian');
  await expect(page.locator('.contact')).toHaveCount(2);
  await expect(page.locator('.contact-number').first()).toContainText('Contoh sahaja');
  await expect(page.locator('a[href^="https://wa.me/"], a[href^="tel:"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Buka Google Maps' })).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=Kuala%20Lumpur');
  await page.goto('/?invite=lelaki#location');
  await expect(page.locator('.contact')).toHaveCount(1);
  await expect(page.locator('.contact')).toContainText('Wakil Keluarga Adam');
});

test('mobile menu, keyboard navigation and fictional invitation work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.mobile-header')).toContainText('DEMO');
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await page.locator('nav a[href="#invitation"]').click();
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  await expect(page.locator('.invitation-couple')).toContainText('Sara Amani');
  await expect(page.locator('.invitation-couple')).toContainText('Adam Hakim');
  await expect(page.locator('#site-nav')).toBeHidden();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('main')).toHaveAttribute('data-page', 'dresscode');
});
