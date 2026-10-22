import { test, expect } from '@playwright/test';
import { countdownAt, calendarFile } from '../src/editorial/event.js';
test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });

async function openCard(page, path = '/editorial/') {
  await page.goto(path);
  const button = page.getByRole('button', { name: 'Buka jemputan Hana dan Danish' });
  if (await button.isVisible()) await button.click();
  await expect(page.locator('#envelope-screen')).toHaveCount(0);
}

for (const width of [320,390,768,1440]) {
  test('botanical invitation and catalog fit at ' + width, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.emulateMedia({reducedMotion:'reduce'});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
    await page.goto('/editorial/');
    await expect(page.getByRole('button',{name:'Buka jemputan Hana dan Danish'})).toBeInViewport();
    await expect(page.locator('#invitation-card')).toBeHidden();
    await expect(page.locator('audio')).toHaveJSProperty('paused',true);
    await page.getByRole('button',{name:'Buka jemputan Hana dan Danish'}).click();
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#guest-dock')).toBeVisible();
    expect((await page.locator('#invitation-card').boundingBox()).width).toBeLessThanOrEqual(500);
    for(const image of await page.locator('#invitation-card img[src]').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(()=>image.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const outside=await page.locator('#invitation-card h1,#invitation-card h2,#invitation-card .button,#guest-dock').evaluateAll(elements=>elements.filter(e=>e.getBoundingClientRect().left<0||e.getBoundingClientRect().right>innerWidth+1).map(e=>e.textContent));
    expect(outside).toEqual([]);
    expect(await page.evaluate(()=>document.getAnimations().length)).toBe(0);
    await page.goto('/koleksi/');
    for(const image of await page.locator('img').all()) {
      await expect.poll(()=>image.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
      const ratios=await image.evaluate(i=>({actual:i.clientWidth/i.clientHeight,natural:i.naturalWidth/i.naturalHeight}));
      expect(Math.abs(ratios.actual-ratios.natural)).toBeLessThan(.03);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('RSVP and wishes validate, confirm inline, and never transmit or persist',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const writes=[];
  page.on('request',r=>{if(r.method()!=='GET')writes.push(r.url());});
  await page.goto('/editorial/#rsvp');
  await page.getByRole('button',{name:'Sahkan kehadiran'}).click();
  await expect(page.locator('#name-error')).toContainText('Sila masukkan');
  await expect(page.locator('#guest-name')).toBeFocused();
  await expect(page.locator('#attendance-error')).toContainText('Sila pilih');
  await page.getByLabel('Nama penuh').fill('Tetamu Contoh');
  await page.getByLabel('Dengan senang hati',{exact:true}).check();
  for(const value of ['0','100','1.5']) {
    await page.getByRole('spinbutton').fill(value);
    await page.getByRole('button',{name:'Sahkan kehadiran'}).click();
    await expect(page.locator('#pax-error')).toContainText('antara 1 hingga 99');
  }
  await page.getByRole('spinbutton').fill('2');
  await page.getByLabel('Ucapan buat pengantin').fill('Semoga berbahagia hingga ke syurga.');
  await page.getByRole('button',{name:'Sahkan kehadiran'}).click();
  await expect(page.locator('#rsvp-result')).toContainText('Kehadiran anda telah disahkan');
  await expect(page.locator('#rsvp-result')).toBeFocused();
  await page.getByLabel('Maaf, tidak dapat hadir').check();
  await expect(page.locator('#pax-field')).toBeHidden();
  await page.getByRole('button',{name:'Sahkan kehadiran'}).click();
  await expect(page.locator('#rsvp-result')).toContainText('doa anda');
  expect(writes).toEqual([]);
  expect(await page.evaluate(()=>[localStorage.length,sessionStorage.length])).toEqual([0,0]);
  await page.reload();
  await expect(page.getByLabel('Nama penuh')).toHaveValue('');
  await expect(page.getByLabel('Ucapan buat pengantin')).toHaveValue('');
});

test('countdown boundaries and downloaded calendar keep Malaysia event times',async({page})=>{
  expect(countdownAt(new Date('2027-05-21T11:00:00+08:00'))).toEqual({state:'upcoming',days:1,hours:0,minutes:0});
  expect(countdownAt(new Date('2027-05-22T10:59:59+08:00'))).toMatchObject({state:'upcoming',minutes:1});
  expect(countdownAt(new Date('2027-05-22T11:00:00+08:00')).state).toBe('ongoing');
  expect(countdownAt(new Date('2027-05-22T16:29:59+08:00')).state).toBe('ongoing');
  expect(countdownAt(new Date('2027-05-22T16:30:00+08:00')).state).toBe('ended');
  await page.clock.setFixedTime(new Date('2027-05-22T12:00:00+08:00'));
  await page.goto('/editorial/#jemputan');
  await expect(page.locator('#countdown')).toHaveAttribute('data-state','ongoing');
  await page.clock.setFixedTime(new Date('2027-05-22T17:00:00+08:00'));
  await page.reload();
  await expect(page.locator('#countdown')).toContainText('Terima kasih');
  const pending=page.waitForEvent('download');
  await page.getByRole('button',{name:'Simpan Tarikh'}).click();
  const download=await pending;
  const stream=await download.createReadStream();
  const chunks=[];
  for await(const chunk of stream)chunks.push(chunk);
  const text=Buffer.concat(chunks).toString();
  expect(text).toBe(calendarFile());
  expect(text).toContain('DTSTART:20270522T030000Z');
  expect(text).toContain('DTEND:20270522T083000Z');
});

test('lightbox arrow keys, Escape, Tab trap and focus return',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await openCard(page);
  const opener=page.getByRole('button',{name:'Buka foto berjalan di taman'});
  await opener.click();
  await expect(page.locator('#lightbox')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#lightbox-image')).toHaveAttribute('src',/portrait/);
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#lightbox-image')).toHaveAttribute('src',/details/);
  for(let i=0;i<5;i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(()=>!!document.activeElement.closest('#lightbox'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#lightbox')).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test('guest dock opens useful contact and gift sheets without fake destinations',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await openCard(page);
  await page.getByRole('button',{name:'Hubungi',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Hubungi keluarga'})).toBeVisible();
  await expect(page.locator('#sheet-content')).toContainText('Keluarga Hana');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button',{name:'Tutup maklumat'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Hubungi',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Hadiah',exact:true}).click();
  await expect(page.locator('#sheet-content')).toContainText('hadiah paling bermakna');
  await page.getByRole('button',{name:'Tutup maklumat'}).click();
  await page.locator('#guest-dock a[href="#lokasi"]').click();
  await expect(page.locator('#location-title')).toBeInViewport();
  await page.locator('#guest-dock a[href="#rsvp"]').click();
  await expect(page.locator('#rsvp-title')).toBeInViewport();
  await expect(page.locator('a[href^="tel:"],a[href^="https://wa.me/"]')).toHaveCount(0);
});

test('direct anchors and missing images keep RSVP usable',async({page})=>{
  await page.route('**/assets/editorial/**',r=>r.abort());
  await page.goto('/editorial/#rsvp');
  await expect(page.locator('#envelope-screen')).toHaveCount(0);
  await expect(page.locator('#rsvp-title')).toBeInViewport();
  await page.getByLabel('Nama penuh').fill('Tetamu');
  await page.getByLabel('Maaf, tidak dapat hadir').check();
  await page.getByRole('button',{name:'Sahkan kehadiran'}).click();
  await expect(page.locator('#rsvp-result')).toContainText('Terima kasih');
});

test('catalog links both demos in the same tab and has no audio',async({page})=>{
  await page.goto('/koleksi/');
  await expect(page.locator('article')).toHaveCount(2);
  await expect(page.locator('audio,video')).toHaveCount(0);
  const links=page.getByRole('link',{name:'Cuba Demo',exact:true});
  await expect(links.nth(0)).toHaveAttribute('href','/#home');
  await expect(links.nth(1)).toHaveAttribute('href','/editorial/');
  await links.nth(1).click();
  await expect(page.getByRole('button',{name:'Buka jemputan Hana dan Danish'})).toBeVisible();
});

test('opening starts one audio player, supports seek and preserves manual pause',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await openCard(page);
  const audio=page.locator('audio');
  await expect(audio).toHaveCount(1);
  await expect(audio).toHaveJSProperty('paused',false);
  await page.getByRole('button',{name:'Jeda muzik'}).click();
  await page.locator('#music-seek').fill('20');
  await expect.poll(()=>audio.evaluate(a=>a.currentTime)).toBeCloseTo(20,0);
  await page.locator('#guest-dock a[href="#rsvp"]').click();
  await expect(audio).toHaveJSProperty('paused',true);
  expect(await page.locator('.music-player').evaluate(el=>getComputedStyle(el).position)).not.toMatch(/fixed|sticky/);
  await page.getByRole('button',{name:'Mainkan muzik'}).click();
  await expect(audio).toHaveJSProperty('paused',false);
});

test('blocked audio on direct entry retries after a gesture',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function() {
      if(!navigator.userActivation.hasBeenActive)return Promise.reject(new DOMException('Blocked','NotAllowedError'));
      return original.call(this);
    };
  });
  await page.goto('/editorial/#jemputan');
  await expect(page.locator('audio')).toHaveJSProperty('paused',true);
  await page.locator('#guest-dock a[href="#lokasi"]').click();
  await expect(page.locator('audio')).toHaveJSProperty('paused',false);
  await page.getByRole('button',{name:'Jeda muzik'}).click();
  await page.locator('#guest-dock a[href="#rsvp"]').click();
  await expect(page.locator('audio')).toHaveJSProperty('paused',true);
});

test('seal opens once, settles cleanly and honors reduced motion changes',async({page})=>{
  await page.goto('/editorial/');
  await page.getByRole('button',{name:'Buka jemputan Hana dan Danish'}).click();
  await expect(page.locator('#invitation-card')).toBeVisible();
  await expect(page.locator('#envelope-screen')).toHaveCount(1);
  await expect(page.locator('#envelope-screen')).toHaveCount(0);
  await expect(page.locator('#couple-names')).toBeFocused();
  await page.locator('#guest-dock a[href="#lokasi"]').click();
  await page.locator('#guest-dock a[href="#rsvp"]').click();
  await expect(page.locator('#envelope-screen')).toHaveCount(0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>page.evaluate(()=>document.getAnimations().length)).toBe(0);
  await page.goto('/editorial/');
  await page.getByRole('button',{name:'Buka jemputan Hana dan Danish'}).click();
  await expect(page.locator('#envelope-screen')).toHaveCount(0);
  expect(await page.evaluate(()=>document.getAnimations().length)).toBe(0);
});
