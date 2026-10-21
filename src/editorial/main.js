import './style.css';
import { submitRsvp } from '../rsvp.js';
import { countdownAt, calendarFile } from './event.js';
import { setupMusic } from './music.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const animations = new Set();
function animate(element, frames, options) {
  if (reducedMotion.matches || !element) return;
  const animation = element.animate(frames, options);
  animations.add(animation);
  animation.finished.finally(() => animations.delete(animation)).catch(() => {});
}
function reveal(element, delay = 0) {
  animate(element, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 720, delay, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'backwards' });
}
// Default CSS keeps everything readable if scripts, images or observers fail.
document.querySelectorAll('.hero-enter').forEach((element, index) => reveal(element, 120 + index * 110));
animate(document.querySelector('.hero-photo img'), [{ transform: 'scale(1.025)' }, { transform: 'scale(1)' }],
  { duration: 2400, easing: 'ease-out' });
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) { reveal(entry.target); observer.unobserve(entry.target); }
}, { threshold: .08 });
document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) for (const animation of animations) animation.cancel();
});

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
setupMusic();

// Re-align direct anchors after local fonts settle, without replaying an intro.
if (location.hash) document.fonts.ready.then(() => {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  target?.scrollIntoView({ behavior: 'instant' });
});
