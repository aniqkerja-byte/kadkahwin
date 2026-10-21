import { test, expect } from '@playwright/test';

test('selected excerpt plays, loops and continues through page transitions as one player', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const mediaRequests = [];
  page.on('request', request => { if (request.url().endsWith('.mp3')) mediaRequests.push(request.url()); });
  await page.goto('/#home');
  const audio = page.locator('#wedding-music');
  await expect(audio).toHaveCount(1);
  await expect(audio).toHaveJSProperty('paused', true);
  expect(mediaRequests).toEqual([]);
  await page.getByRole('button', { name: 'Mainkan muzik:' }).click();
  await expect(page.getByRole('button', { name: 'Jeda muzik:' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => audio.evaluate(element => element.currentTime)).toBeGreaterThan(0);
  const metadata = await audio.evaluate(element => ({ duration: element.duration, volume: element.volume, loop: element.loop, time: element.currentTime }));
  expect(metadata.duration).toBeGreaterThan(39.9);
  expect(metadata.duration).toBeLessThan(40.1);
  expect(metadata.volume).toBe(.35);
  expect(metadata.loop).toBe(true);
  await page.locator('nav a[href="#dresscode"]').click();
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  await expect(page.locator('audio')).toHaveCount(1);
  await expect(page.locator('.music-toggle')).toHaveCount(1);
  await expect(audio).toHaveJSProperty('paused', false);
  expect(await audio.evaluate(element => element.currentTime)).toBeGreaterThan(metadata.time);
});

test('first interaction starts music and a manual pause stays paused across navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#home');
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', false);
  await page.getByRole('button', { name: 'Jeda muzik:' }).click();
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', true);
  await page.locator('nav a[href="#location"]').click();
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', true);
  const play = page.getByRole('button', { name: 'Mainkan muzik:' });
  await play.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', false);
});

test('failed audio can be retried without breaking the invitation', async ({ page }) => {
  await page.route('**/teman-hidup-wedding.mp3', route => route.abort());
  await page.goto('/#home');
  const play = page.getByRole('button', { name: 'Mainkan muzik:' });
  await play.click();
  await expect.poll(() => page.locator('#wedding-music').evaluate(element => Boolean(element.error))).toBe(true);
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await page.unroute('**/teman-hidup-wedding.mp3');
  await play.click();
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', false);
  await expect(page.getByRole('button', { name: 'Jeda muzik:' })).toHaveAttribute('aria-pressed', 'true');
});
