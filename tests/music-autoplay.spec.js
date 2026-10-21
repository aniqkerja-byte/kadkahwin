import { test, expect } from '@playwright/test';

test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });

test('selected excerpt autoplays on arrival and continues through page transitions as one player', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const mediaRequests = [];
  page.on('request', request => { if (request.url().endsWith('.mp3')) mediaRequests.push(request.url()); });
  await page.goto('/#home');
  const audio = page.locator('#wedding-music');
  await expect(audio).toHaveCount(1);
  await expect(audio).toHaveJSProperty('autoplay', true);
  await expect(audio).toHaveJSProperty('paused', false);
  await page.getByRole('button', { name: 'Buka pemain muzik:' }).click();
  await expect(page.getByRole('button', { name: 'Jeda muzik:' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => audio.evaluate(element => element.currentTime)).toBeGreaterThan(0);
  const metadata = await audio.evaluate(element => ({ duration: element.duration, volume: element.volume, loop: element.loop, time: element.currentTime }));
  expect(metadata.duration).toBeGreaterThan(39.9);
  expect(metadata.duration).toBeLessThan(40.1);
  expect(metadata.volume).toBe(.35);
  expect(metadata.loop).toBe(true);
  expect(mediaRequests.length).toBeGreaterThan(0);
  await expect(page.locator('main')).toHaveAttribute('data-page', 'home');
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  expect(await page.locator('#app .desktop-header .music-toggle').evaluate(element => getComputedStyle(element).position)).not.toMatch(/fixed|sticky/);
  await expect(page.locator('.desktop-header')).not.toContainText('DEMO');
  await page.locator('nav a[href="#dresscode"]').click();
  await expect(page.locator('.site-transition-layer .desktop-header .music-toggle')).toHaveCount(2);
  await expect(page.locator('.site-transition-layer .music-panel:not([hidden])')).toHaveCount(0);
  await expect(page.locator('main')).not.toHaveAttribute('data-transitioning');
  await expect(page.locator('audio')).toHaveCount(1);
  await expect(page.locator('#app .music-toggle:visible')).toHaveCount(1);
  await expect(audio).toHaveJSProperty('paused', false);
  expect(await audio.evaluate(element => element.currentTime)).toBeGreaterThan(metadata.time);
});
