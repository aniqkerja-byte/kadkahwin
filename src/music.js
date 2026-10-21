export function installWeddingMusic() {
  // Audio persists outside #app; header controls travel with each visual page.
  const audio = document.createElement('audio');
  audio.id = 'wedding-music';
  audio.src = '/assets/teman-hidup-wedding.mp3';
  audio.preload = 'auto';
  audio.autoplay = true;
  audio.loop = true;
  audio.volume = .35;
  audio.hidden = true;

  const buttons = [...document.querySelectorAll('[data-music-control]')].map(slot => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'music-toggle';
    button.title = 'TULUS — Teman Hidup';
    button.setAttribute('aria-controls', audio.id);
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = '<svg class="music-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/></svg><span class="music-label">Mainkan</span>';
    slot.append(button);
    return button;
  });

  let wantsPlayback = false;
  let revision = 0;
  const removeAutoStart = () => document.removeEventListener('click', firstInteraction, true);
  const sync = () => {
    const playing = !audio.paused;
    buttons.forEach(button => {
      button.classList.toggle('is-playing', playing);
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', `${playing ? 'Jeda' : 'Mainkan'} muzik: TULUS — Teman Hidup`);
      button.title = `${playing ? 'Jeda' : 'Mainkan'} muzik · TULUS — Teman Hidup`;
      button.querySelector('.music-label').textContent = playing ? 'Muzik' : 'Mainkan';
    });
  };
  const play = async ({ automatic = false } = {}) => {
    if (!automatic) removeAutoStart();
    wantsPlayback = true;
    const request = ++revision;
    try {
      if (audio.error) audio.load();
      await audio.play();
      if (request !== revision && !wantsPlayback) audio.pause();
      else if (request === revision) removeAutoStart();
    } catch {
      if (request !== revision) return;
      wantsPlayback = false;
      sync();
      buttons.forEach(button => { button.title = 'Tekan untuk cuba mainkan TULUS — Teman Hidup'; });
    }
  };
  function firstInteraction(event) {
    if (!event.isTrusted || buttons.some(button => button.contains(event.target))) return;
    void play();
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    removeAutoStart();
    if (wantsPlayback) {
      wantsPlayback = false;
      revision++;
      audio.pause();
      sync();
    } else {
      void play();
    }
  }));
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  audio.addEventListener('error', () => {
    wantsPlayback = false;
    sync();
    buttons.forEach(button => { button.title = 'Muzik belum dapat dimuatkan. Tekan untuk cuba lagi.'; });
  });
  document.body.append(audio);
  document.addEventListener('click', firstInteraction, true);
  sync();
  // Try immediately; browsers that block audible autoplay retain the click fallback.
  void play({ automatic: true });
}
