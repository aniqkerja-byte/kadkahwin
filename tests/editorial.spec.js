import { test, expect } from '@playwright/test';
import { countdownAt, calendarFile } from '../src/editorial/event.js';
test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });

for (const width of [320, 390, 768, 1440]) {
  test('JANJI and catalog responsive at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(r.url()); });
    for (const path of ['/editorial/', '/koleksi/']) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      // Trigger native lazy images before checking every asset.
      for (const image of await page.locator('img[src]').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
        if (path === '/koleksi/') {
          const ratios = await image.evaluate(img => ({ rendered: img.clientWidth / img.clientHeight, original: img.naturalWidth / img.naturalHeight }));
          expect(Math.abs(ratios.rendered - ratios.original)).toBeLessThan(.03);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
      const overflow = await page.locator('h1,h2,h3,.button,nav').evaluateAll(elements =>
        elements.filter(el => el.getBoundingClientRect().left < -1 || el.getBoundingClientRect().right > innerWidth + 1).map(el => el.textContent));
      expect(overflow).toEqual([]);
      await page.reload();
      await expect(page.locator('h1')).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

test('RSVP validates, confirms both replies inline and never persists or transmits', async ({ page }) => {
  const writes = [];
  page.on('request', r => { if (r.method() !== 'GET') writes.push(r.url()); });
  await page.goto('/editorial/#rsvp');
  await page.getByRole('button', { name: 'Sahkan kehadiran' }).click();
  await expect(page.locator('#name-error')).toContainText('Sila masukkan');
  await expect(page.locator('#guest-name')).toBeFocused();
  await expect(page.locator('#attendance-error')).toContainText('Sila pilih');
  await page.getByLabel('Nama penuh').fill('Tetamu Contoh');
  await page.getByLabel('Dengan senang hati', { exact: true }).check();
  for (const value of ['0', '100', '1.5']) {
    await page.getByRole('spinbutton').fill(value);
    await page.getByRole('button', { name: 'Sahkan kehadiran' }).click();
    await expect(page.locator('#pax-error')).toContainText('antara 1 hingga 99');
  }
  await page.getByRole('spinbutton').fill('2');
  await page.getByRole('button', { name: 'Sahkan kehadiran' }).click();
  await expect(page.locator('#rsvp-result')).toContainText('Kehadiran anda telah disahkan');
  await expect(page.locator('#rsvp-result')).toBeFocused();
  await page.getByLabel('Maaf, tidak dapat hadir').check();
  await expect(page.locator('#pax-field')).toBeHidden();
  await page.getByRole('button', { name: 'Sahkan kehadiran' }).click();
  await expect(page.locator('#rsvp-result')).toContainText('doa anda');
  expect(writes).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  await page.reload();
  await expect(page.getByLabel('Nama penuh')).toHaveValue('');
});

test('countdown event boundaries and downloadable ICS use the correct Malaysia times', async ({ page }) => {
  expect(countdownAt(new Date('2027-05-21T11:00:00+08:00'))).toEqual({ state: 'upcoming', days: 1, hours: 0, minutes: 0 });
  expect(countdownAt(new Date('2027-05-22T10:59:59+08:00'))).toMatchObject({ state: 'upcoming', minutes: 1 });
  expect(countdownAt(new Date('2027-05-22T11:00:00+08:00')).state).toBe('ongoing');
  expect(countdownAt(new Date('2027-05-22T16:29:59+08:00')).state).toBe('ongoing');
  expect(countdownAt(new Date('2027-05-22T16:30:00+08:00')).state).toBe('ended');
  await page.clock.setFixedTime(new Date('2027-05-22T12:00:00+08:00'));
  await page.goto('/editorial/');
  await expect(page.locator('#countdown')).toHaveAttribute('data-state', 'ongoing');
  await page.clock.setFixedTime(new Date('2027-05-22T17:00:00+08:00'));
  await page.reload();
  await expect(page.locator('#countdown')).toContainText('Terima kasih');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Simpan Tarikh' }).click();
  const download = await downloaded;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const contents = Buffer.concat(chunks).toString();
  expect(contents).toBe(calendarFile());
  expect(contents).toContain('DTSTART:20270522T030000Z');
  expect(contents).toContain('DTEND:20270522T083000Z');
  expect(download.suggestedFilename()).toBe('Hana-Danish-22-Mei-2027.ics');
});

test('lightbox arrows, Escape, focus containment and restoration', async ({ page }) => {
  await page.goto('/editorial/');
  const opener = page.getByRole('button', { name: 'Buka foto berjalan di taman' });
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tutup galeri' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#lightbox-image')).toHaveAttribute('src', /portrait/);
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#lightbox-image')).toHaveAttribute('src', /details/);
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement.closest('dialog'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test('direct anchor and image failures do not block the invitation or RSVP', async ({ page }) => {
  await page.route('**/assets/editorial/**', route => route.abort());
  await page.goto('/editorial/#rsvp');
  await expect(page.locator('#rsvp-title')).toBeInViewport();
  await page.getByLabel('Nama penuh').fill('Tetamu');
  await page.getByLabel('Maaf, tidak dapat hadir').check();
  await page.getByRole('button', { name: 'Sahkan kehadiran' }).click();
  await expect(page.locator('#rsvp-result')).toContainText('Terima kasih');
  await page.getByRole('link', { name: 'Kembali ke atas', exact: true }).click();
  await expect(page.locator('h1')).toBeVisible();
});

test('catalog has two accurate demo destinations and no media', async ({ page }) => {
  await page.goto('/koleksi/');
  await expect(page.locator('article')).toHaveCount(2);
  await expect(page.locator('audio,video')).toHaveCount(0);
  const demos = page.getByRole('link', { name: 'Cuba Demo', exact: true });
  await expect(demos.nth(0)).toHaveAttribute('href', '/#home');
  await expect(demos.nth(1)).toHaveAttribute('href', '/editorial/');
  await demos.nth(1).click();
  await expect(page).toHaveURL(/\/editorial\/$/);
});

test.describe('music with browser autoplay allowed', () => {
  test('one inline player autoplays, seeks, and respects pause across anchors', async ({ page }) => {
    await page.goto('/editorial/');
    const audio = page.locator('audio');
    await expect(audio).toHaveCount(1);
    await expect(audio).toHaveJSProperty('paused', false);
    await expect.poll(() => audio.evaluate(a => a.currentTime)).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Jeda muzik' }).click();
    await page.locator('#music-seek').fill('20');
    await expect.poll(() => audio.evaluate(a => a.currentTime)).toBeCloseTo(20, 0);
    await page.locator('nav a[href="#rsvp"]').click();
    await expect(audio).toHaveJSProperty('paused', true);
    expect(await page.locator('.music-player').evaluate(el => getComputedStyle(el).position)).not.toMatch(/fixed|sticky/);
    await page.getByRole('button', { name: 'Mainkan muzik' }).click();
    await expect(audio).toHaveJSProperty('paused', false);
  });
});

test('blocked autoplay retries on interaction, and manual pause persists', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function() {
      if (!navigator.userActivation.hasBeenActive) return Promise.reject(new DOMException('Blocked', 'NotAllowedError'));
      return original.call(this);
    };
  });
  await page.goto('/editorial/');
  await expect(page.locator('audio')).toHaveJSProperty('paused', true);
  await page.locator('nav a[href="#jemputan"]').click();
  await expect(page.locator('audio')).toHaveJSProperty('paused', false);
  await page.getByRole('button', { name: 'Jeda muzik' }).click();
  await page.locator('nav a[href="#lokasi"]').click();
  await expect(page.locator('audio')).toHaveJSProperty('paused', true);
});

test('opening is gradual, never blocks controls, does not replay and respects motion changes', async ({ page }) => {
  await page.addInitScript(() => {
    window.heroAnimations = 0;
    const original = Element.prototype.animate;
    Element.prototype.animate = function(frames, options) {
      if (this.matches('.hero-photo img')) { window.heroAnimations++; window.heroDuration = options.duration; }
      return original.call(this, frames, options);
    };
  });
  await page.goto('/editorial/');
  expect(await page.evaluate(() => window.heroDuration)).toBe(2400);
  await page.locator('nav a[href="#rsvp"]').click();
  await expect(page.locator('#rsvp-title')).toBeInViewport();
  await page.locator('.site-header .monogram').click();
  expect(await page.evaluate(() => window.heroAnimations)).toBe(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
  await page.reload();
  expect(await page.evaluate(() => window.heroAnimations)).toBe(0);
});
