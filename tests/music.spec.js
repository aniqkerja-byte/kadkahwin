import { test, expect } from '@playwright/test';

test.use({ launchOptions: { args: ['--autoplay-policy=user-gesture-required'] } });

test('first interaction retries blocked autoplay and a manual pause stays paused across navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#home');
  await expect(page.locator('#wedding-music')).toHaveJSProperty('paused', true);
  await expect(page.getByRole('button', { name: 'Mainkan muzik:' })).toHaveAttribute('aria-pressed', 'false');
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
