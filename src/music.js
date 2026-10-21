const noteIcon = '<svg class="music-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/></svg>';
const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z"/></svg>';
const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM15 5h4v14h-4z"/></svg>';
const skipIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8a8 8 0 1 1-1 7M5 3v5h5"/><text x="12" y="16" text-anchor="middle">10</text></svg>';
const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function installWeddingMusic() {
  // Only this audio persists; header panels close before page transitions.
  const audio = document.createElement('audio');
  audio.id = 'wedding-music';
  audio.src = '/assets/teman-hidup-wedding.mp3';
  audio.preload = 'auto';
  audio.autoplay = true;
  audio.loop = true;
  audio.volume = .35;
  audio.hidden = true;

  const players = [...document.querySelectorAll('[data-music-control]')].map((slot, index) => {
    const panelId = `music-panel-${index}`;
    slot.innerHTML = `
      <button type="button" class="music-toggle" aria-label="Buka pemain muzik: Teman Hidup — TULUS" aria-expanded="false" aria-controls="${panelId}">${noteIcon}</button>
      <section id="${panelId}" class="music-panel" aria-label="Pemain muzik" hidden>
        <div class="music-panel-heading"><p>Muzik pengiring</p><button type="button" class="music-close" aria-label="Tutup pemain muzik"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg></button></div>
        <div class="music-track"><img src="/assets/tulus-album-cover.png" alt="Kulit album TULUS" width="1000" height="1000"/><div><h2>Teman Hidup</h2><p>TULUS</p><span>Petikan pilihan</span></div></div>
        <div class="music-transport"><button type="button" class="music-skip" data-skip="-10" aria-label="Undur 10 saat">${skipIcon}</button><button type="button" class="music-play" aria-controls="${audio.id}" aria-label="Mainkan muzik: TULUS — Teman Hidup" aria-pressed="false">${playIcon}</button><button type="button" class="music-skip music-forward" data-skip="10" aria-label="Maju 10 saat">${skipIcon}</button></div>
        <label class="sr-only" for="music-seek-${index}">Kedudukan lagu</label><input id="music-seek-${index}" class="music-seek" type="range" min="0" max="40" step="0.1" value="0" aria-valuetext="0:00 daripada 0:40"/>
        <div class="music-times" aria-hidden="true"><span class="music-elapsed">0:00</span><span class="music-duration">0:40</span></div>
        <p class="music-status" role="status"></p>
      </section>`;
    return { slot, opener: slot.querySelector('.music-toggle'), panel: slot.querySelector('.music-panel'), playButton: slot.querySelector('.music-play'), seek: slot.querySelector('.music-seek'), pinned: false, closeTimer: 0 };
  });

  let wantsPlayback = false;
  let revision = 0;
  const duration = () => Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 40;
  const removeAutoStart = () => document.removeEventListener('click', firstInteraction, true);
  const close = player => {
    clearTimeout(player.closeTimer);
    player.pinned = false;
    player.panel.hidden = true;
    player.opener.setAttribute('aria-expanded', 'false');
  };
  const open = player => {
    clearTimeout(player.closeTimer);
    players.filter(other => other !== player).forEach(close);
    player.panel.hidden = false;
    player.opener.setAttribute('aria-expanded', 'true');
  };
  const syncProgress = () => {
    const end = duration();
    const time = Math.min(audio.currentTime, end);
    players.forEach(({ slot, seek }) => {
      seek.max = String(end);
      seek.value = String(time);
      seek.style.setProperty('--music-progress', `${time / end * 100}%`);
      seek.setAttribute('aria-valuetext', `${formatTime(time)} daripada ${formatTime(end)}`);
      slot.querySelector('.music-elapsed').textContent = formatTime(time);
      slot.querySelector('.music-duration').textContent = formatTime(end);
    });
  };
  const sync = () => {
    const playing = !audio.paused;
    players.forEach(({ opener, playButton }) => {
      opener.classList.toggle('is-playing', playing);
      opener.title = 'Teman Hidup — TULUS';
      playButton.setAttribute('aria-pressed', String(playing));
      playButton.setAttribute('aria-label', `${playing ? 'Jeda' : 'Mainkan'} muzik: TULUS — Teman Hidup`);
      playButton.innerHTML = playing ? pauseIcon : playIcon;
    });
  };
  const setStatus = message => players.forEach(({ slot }) => { slot.querySelector('.music-status').textContent = message; });
  const play = async ({ automatic = false } = {}) => {
    if (!automatic) removeAutoStart();
    wantsPlayback = true;
    const request = ++revision;
    try {
      if (audio.error) audio.load();
      await audio.play();
      if (request !== revision && !wantsPlayback) audio.pause();
      else if (request === revision) { removeAutoStart(); setStatus(''); }
    } catch {
      if (request !== revision) return;
      wantsPlayback = false;
      sync();
      if (!automatic) setStatus('Muzik belum dapat dimainkan. Tekan main untuk cuba lagi.');
    }
  };
  function firstInteraction(event) {
    if (!event.isTrusted || players.some(({ slot }) => slot.contains(event.target))) return;
    void play();
  }
  players.forEach(player => {
    const { slot, opener, panel, playButton, seek } = player;
    opener.addEventListener('click', () => {
      if (player.pinned) close(player);
      else { player.pinned = true; open(player); }
    });
    slot.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && matchMedia('(hover: hover)').matches) open(player);
    });
    slot.addEventListener('pointerleave', () => {
      if (!player.pinned && !slot.contains(document.activeElement)) player.closeTimer = setTimeout(() => close(player), 180);
    });
    slot.addEventListener('focusout', () => {
      setTimeout(() => { if (!slot.contains(document.activeElement) && !slot.matches(':hover')) close(player); }, 0);
    });
    panel.querySelector('.music-close').addEventListener('click', () => { close(player); opener.focus(); });
    slot.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); close(player); opener.focus(); }
    });
    playButton.addEventListener('click', () => {
      player.pinned = true;
      removeAutoStart();
      if (wantsPlayback) { wantsPlayback = false; revision++; audio.pause(); sync(); }
      else void play();
    });
    seek.addEventListener('input', () => {
      if (!audio.readyState) return;
      audio.currentTime = Math.min(Number(seek.value), duration());
      syncProgress();
    });
    panel.querySelectorAll('[data-skip]').forEach(button => button.addEventListener('click', () => {
      if (!audio.readyState) return;
      audio.currentTime = Math.max(0, Math.min(duration(), audio.currentTime + Number(button.dataset.skip)));
      syncProgress();
    }));
  });
  document.addEventListener('click', event => { players.filter(({ slot }) => !slot.contains(event.target)).forEach(close); });
  window.addEventListener('hashchange', () => players.forEach(close));
  window.addEventListener('resize', () => players.forEach(close));
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  ['timeupdate', 'loadedmetadata', 'durationchange', 'seeked'].forEach(event => audio.addEventListener(event, syncProgress));
  audio.addEventListener('error', () => {
    wantsPlayback = false;
    sync();
    setStatus('Muzik belum dapat dimuatkan. Tekan main untuk cuba lagi.');
  });
  document.body.append(audio);
  document.addEventListener('click', firstInteraction, true);
  sync();
  syncProgress();
  // Browsers that block audible autoplay retain the first-interaction fallback.
  void play({ automatic: true });
}
