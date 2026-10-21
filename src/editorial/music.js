export function setupMusic() {
  const audio = document.querySelector('#wedding-audio');
  const toggle = document.querySelector('#music-toggle');
  const seek = document.querySelector('#music-seek');
  const time = document.querySelector('#music-time');
  const status = document.querySelector('#music-status');
  let manuallyPaused = false;
  let attempting = false;
  const format = seconds => Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
  const sync = () => {
    const playing = !audio.paused;
    toggle.textContent = playing ? 'Ⅱ' : '▶';
    toggle.setAttribute('aria-label', playing ? 'Jeda muzik' : 'Mainkan muzik');
    toggle.setAttribute('aria-pressed', String(playing));
  };
  const updateTime = () => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 40;
    seek.max = duration;
    seek.value = audio.currentTime;
    time.textContent = format(audio.currentTime) + ' / ' + format(duration);
  };
  async function play() {
    if (attempting || manuallyPaused) return;
    attempting = true;
    try { await audio.play(); status.textContent = ''; }
    catch (error) {
      status.textContent = error.name === 'NotAllowedError'
        ? 'Tekan main untuk mendengar muzik.'
        : 'Muzik tidak dapat dimuatkan. Tekan main untuk cuba lagi.';
    } finally { attempting = false; sync(); }
  }
  audio.volume = .35;
  toggle.addEventListener('click', () => {
    if (audio.paused) { manuallyPaused = false; if (audio.error) audio.load(); void play(); }
    else { manuallyPaused = true; audio.pause(); }
  });
  seek.addEventListener('input', () => { if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value); updateTime(); });
  for (const name of ['play', 'pause', 'ended']) audio.addEventListener(name, sync);
  for (const name of ['timeupdate', 'loadedmetadata', 'durationchange']) audio.addEventListener(name, updateTime);
  audio.addEventListener('error', () => { status.textContent = 'Muzik tidak dapat dimuatkan. Tekan main untuk cuba lagi.'; sync(); });
  const gesture = e => {
    if (e.target.closest('.music-player') || manuallyPaused || !audio.paused) return;
    if (e.type === 'keydown' && !['Enter', ' '].includes(e.key)) return;
    void play();
  };
  document.addEventListener('click', gesture);
  document.addEventListener('keydown', gesture);
  sync();
  void play();
}

