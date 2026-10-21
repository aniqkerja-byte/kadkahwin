import { test, expect } from '@playwright/test';

test.use({ launchOptions: { args: ['--autoplay-policy=user-gesture-required'] } });

test('first interaction retries blocked autoplay and a manual pause stays paused across navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#home');
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Buka pemain muzik:' }).click();
  await expect(page.getByRole('button', { name: 'Mainkan muzik:' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', false);
  await page.getByRole('button', { name: 'Buka pemain muzik:' }).click();
  await page.getByRole('button', { name: 'Jeda muzik:' }).click();
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', true);
  await page.locator('nav a[href="#location"]').click();
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Buka pemain muzik:' }).focus();
  await page.keyboard.press('Enter');
  const play = page.getByRole('button', { name: 'Mainkan muzik:' });
  await play.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', false);
});


test('failed audio can be retried without breaking the invitation', async ({ page }) => {
  await page.route('**/teman-hidup-wedding.mp3', route => route.abort());
  await page.goto('/#home');
  await page.getByRole('button', { name: 'Buka pemain muzik:' }).click();
  const play = page.getByRole('button', { name: 'Mainkan muzik:' });
  await play.click();
  await expect.poll(() => page.locator('#wedding-music').evaluate(element => Boolean(element.error))).toBe(true);
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await page.unroute('**/teman-hidup-wedding.mp3');
  await play.click();
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', false);
  await expect(page.getByRole('button', { name: 'Jeda muzik:' })).toHaveAttribute('aria-pressed', 'true');
});

test('mobile player shows supplied artwork, seeks, skips and closes without interrupting audio', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/#home');
  const opener = page.getByRole('button', { name: 'Buka pemain muzik:' });
  await opener.click();
  const panel = page.getByRole('region', { name: 'Pemain muzik' });
  await expect(panel.getByRole('heading', { name: 'Teman Hidup' })).toBeVisible();
  await expect(panel.getByAltText('Kulit album TULUS')).toHaveJSProperty('naturalWidth', 1000);
  const bounds = await panel.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(568);
  const seek = panel.getByRole('slider', { name: 'Kedudukan lagu' });
  await expect.poll(() => page.locator('#wedding-music').evaluate(audio => audio.readyState)).toBeGreaterThan(0);
  await seek.focus();
  await page.keyboard.press('End');
  await panel.getByRole('button', { name: 'Undur 10 saat' }).click();
  await expect.poll(() => page.locator('#wedding-music').evaluate(audio => audio.currentTime)).toBeCloseTo(30, 0);
  await panel.getByRole('button', { name: 'Maju 10 saat' }).click();
  await expect.poll(() => page.locator('#wedding-music').evaluate(audio => audio.currentTime)).toBeCloseTo(40, 0);
  await seek.focus();
  await page.keyboard.press('Home');
  await expect(page.locator('#wedding-music')).toHaveJSProperty('currentTime', 0);
  await panel.getByRole('button', { name: 'Mainkan muzik:' }).click();
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', false);
  await panel.getByRole('button', { name: 'Tutup pemain muzik' }).click();
  await expect(opener).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', false);
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await page.locator('nav a[href="#invitation"]').click();
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  await expect(page.locator('audio')).toHaveCount(1);
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', false);
});

test('desktop hover reveals track information; click pins it and Escape restores focus', async ({ page }) => {
  await page.goto('/#home');
  const opener = page.getByRole('button', { name: 'Buka pemain muzik:' });
  await opener.hover();
  await expect(opener).toHaveAttribute('aria-expanded', 'true');
  await page.locator('main').hover();
  await expect(opener).toHaveAttribute('aria-expanded', 'false');
  await opener.click();
  await page.locator('main').hover();
  await expect(opener).toHaveAttribute('aria-expanded', 'true');
  await page.mouse.wheel(0, 500);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'home');
  await page.getByRole('button', { name: 'Mainkan muzik:' }).focus();
  await page.keyboard.press('Escape');
  await expect(opener).toHaveAttribute('aria-expanded', 'false');
  await expect(opener).toBeFocused();
});
