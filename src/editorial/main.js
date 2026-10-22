import './style.css';
import { submitRsvp } from '../rsvp.js';
import { countdownAt, calendarFile } from './event.js';
import { setupMusic } from './music.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const animations = new Set();
function animate(element, frames, options) {
  if (reducedMotion.matches || !element) return null;
  const animation = element.animate(frames, options);
  animations.add(animation);
  animation.finished.finally(() => animations.delete(animation)).catch(() => {});
  return animation;
}
function reveal(element, delay = 0) {
  return animate(element, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 950, delay, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'backwards' });
}
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    // Shared section links should land on stable text, without a reveal shifting it.
    if (location.hash !== '#' + entry.target.id) reveal(entry.target);
    observer.unobserve(entry.target);
  }
}, { threshold: .08 });
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) for (const animation of animations) animation.cancel();
});
const card = document.querySelector('#invitation-card');
const dock = document.querySelector('#guest-dock');
const envelope = document.querySelector('#envelope-screen');
let opened = false;
function showInvitation(instant = false) {
  if (opened) return;
  opened = true;
  card.hidden = false;
  dock.hidden = false;
  setupMusic(); // The opening click also gives audible playback a user gesture.
  const finish = () => {
    envelope.remove();
    document.body.classList.remove('is-sealed');
    if (!instant) document.querySelector('#couple-names').focus({ preventScroll: true });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  };
  if (instant || reducedMotion.matches) { finish(); return; }
  document.querySelector('#open-invitation').disabled = true;
  const effects = [
    animate(document.querySelector('.envelope-content'), [{ opacity: 1 }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 480, fill: 'forwards' }),
    ...['left','right'].map(side => animate(document.querySelector('.envelope-' + side),
      [{ transform: 'translateX(0)' }, { transform: 'translateX(' + (side === 'left' ? '-' : '') + '105%)' }],
      { duration: 1800, delay: 180, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' })),
    animate(envelope, [{ opacity: 1 }, { opacity: 1, offset: .65 }, { opacity: 0 }], { duration: 2000, fill: 'forwards' }),
  ];
  document.querySelectorAll('.hero-enter').forEach((element,index) => reveal(element, 800 + index * 125));
  Promise.allSettled(effects.filter(Boolean).map(animation => animation.finished)).then(finish);
}
document.querySelector('#open-invitation').addEventListener('click', () => showInvitation());
const directTarget = location.hash ? document.getElementById(location.hash.slice(1)) : null;
if (directTarget && card.contains(directTarget)) {
  showInvitation(true);
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
  Promise.all([document.fonts.ready, loaded]).then(() => requestAnimationFrame(() => {
    if (location.hash === '#' + directTarget.id) directTarget.scrollIntoView({ behavior: 'instant' });
  }));
}
window.addEventListener('hashchange', () => {
  const target = document.getElementById(location.hash.slice(1));
  if (target && card.contains(target) && !opened) showInvitation(true);
});
const guestSheet = document.querySelector('#guest-sheet');
let sheetOpener;
document.querySelectorAll('[data-sheet]').forEach(button => button.addEventListener('click', () => {
  sheetOpener = button;
  const contact = button.dataset.sheet === 'contact';
  document.querySelector('#sheet-title').textContent = contact ? 'Hubungi keluarga' : 'Seikhlas hati';
  document.querySelector('#sheet-content').innerHTML = contact
    ? '<p>Untuk sebarang pertanyaan mengenai majlis, sila hubungi wakil keluarga.</p><p class="sheet-label">Keluarga Hana · Keluarga Danish</p><p class="small">Nombor hubungan tidak dipaparkan dalam demo portfolio ini.</p>'
    : '<p>Kehadiran dan doa restu anda<br>merupakan hadiah paling bermakna.</p><div class="ornament" aria-hidden="true"><span>❧</span></div><p class="small">Maklumat hadiah dan kod QR tidak disediakan dalam demo portfolio ini.</p>';
  guestSheet.showModal();
  guestSheet.querySelector('button').focus();
  animate(guestSheet,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:280});
}));
guestSheet.querySelector('.sheet-close').addEventListener('click', () => guestSheet.close());
guestSheet.addEventListener('close', () => sheetOpener?.focus());
guestSheet.addEventListener('keydown', e => {
  if(e.key === 'Tab') { e.preventDefault(); guestSheet.querySelector('button').focus(); }
});
const sectionObserver = new IntersectionObserver(entries => {
  for(const entry of entries) if(entry.isIntersecting) {
    dock.querySelectorAll('a').forEach(link => {
      if(link.hash === '#' + entry.target.id) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
},{rootMargin:'-15% 0px -55% 0px'});
for(const id of ['lokasi','rsvp']) sectionObserver.observe(document.getElementById(id));

const countdown = document.querySelector('#countdown');
function updateCountdown() {
  const data = countdownAt();
  countdown.dataset.state = data.state;
  countdown.innerHTML = data.state === 'upcoming'
    ? [['days', 'HARI'], ['hours', 'JAM'], ['minutes', 'MINIT']].map(([key, label]) =>
      '<div><strong>' + String(data[key]).padStart(2, '0') + '</strong><span>' + label + '</span></div>').join('')
    : '<p>' + data.message + '</p>';
}
updateCountdown();
setInterval(updateCountdown, 30000);
document.querySelector('#save-date').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([calendarFile()], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Hana-Danish-22-Mei-2027.ics';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

const photos = [
  { name: 'walk', caption: 'Selangkah, bersama — Hana dan Danish di taman' },
  { name: 'portrait', caption: 'Tempat pulang — Potret Hana dan Danish' },
  { name: 'details', caption: 'Sebuah janji — Cincin dan bunga' },
];
const dialog = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
let currentPhoto = 0;
let opener;
function showPhoto(index) {
  currentPhoto = (index + photos.length) % photos.length;
  lightboxImage.src = '/assets/editorial/' + photos[currentPhoto].name + '-1600.webp';
  lightboxImage.alt = photos[currentPhoto].caption;
  document.querySelector('#photo-caption').textContent = photos[currentPhoto].caption;
  document.querySelector('#photo-number').textContent = (currentPhoto + 1) + ' / ' + photos.length;
}
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
  opener = button;
  showPhoto(Number(button.dataset.photo));
  dialog.showModal();
  document.querySelector('#close-lightbox').focus();
  animate(dialog, [{ opacity: 0 }, { opacity: 1 }], { duration: 180 });
}));
document.querySelector('#close-lightbox').addEventListener('click', () => dialog.close());
document.querySelector('#previous-photo').addEventListener('click', () => showPhoto(currentPhoto - 1));
document.querySelector('#next-photo').addEventListener('click', () => showPhoto(currentPhoto + 1));
dialog.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    const controls = [...dialog.querySelectorAll('button')];
    const first = controls[0];
    const last = controls.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    showPhoto(currentPhoto + (e.key === 'ArrowLeft' ? -1 : 1));
  }
});
dialog.addEventListener('click', e => { if (e.target === dialog && (e.clientX < dialog.getBoundingClientRect().left || e.clientX > dialog.getBoundingClientRect().right || e.clientY < dialog.getBoundingClientRect().top || e.clientY > dialog.getBoundingClientRect().bottom)) dialog.close(); });
dialog.addEventListener('close', () => opener?.focus());

const form = document.querySelector('#rsvp-form');
const result = document.querySelector('#rsvp-result');
form.addEventListener('change', () => {
  document.querySelector('#pax-field').hidden = form.elements.attendance.value !== 'yes';
  result.textContent = '';
});
form.addEventListener('submit', async e => {
  e.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  const response = await submitRsvp(values);
  for (const name of ['name', 'attendance', 'pax']) {
    document.querySelector('#' + name + '-error').textContent = response.errors?.[name] || '';
    const fields = name === 'attendance' ? form.querySelectorAll('[name="attendance"]') : [form.elements[name]];
    for (const field of fields) field.setAttribute('aria-invalid', String(!!response.errors?.[name]));
  }
  if (!response.ok) {
    result.textContent = '';
    form.querySelector('[aria-invalid="true"]').focus();
    return;
  }
  result.textContent = response.attendance === 'yes'
    ? 'Terima kasih! Kehadiran anda telah disahkan dalam demo ini. Kami menanti untuk meraikan bersama.'
    : 'Terima kasih atas maklum balas dan doa anda. Semoga kita bertemu di lain kesempatan.';
  result.focus();
});
