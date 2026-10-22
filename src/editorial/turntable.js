// A small motor model keeps the platter angle continuous through start/pause.
export function createTurntableMotor(player, record) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fullSpeed = 30; // degrees/second: one quiet revolution every 12 seconds.
  let requested = false;
  let target = 0;
  let speed = 0;
  let angle = 0;
  let frame = 0;
  let previous = 0;
  record.style.transform = 'rotate(0deg)';

  function state() {
    const next = target ? (speed === fullSpeed ? 'running' : 'starting') : (speed ? 'stopping' : 'stopped');
    if (player.dataset.motor !== next) player.dataset.motor = next;
  }

  function tick(now) {
    frame = 0;
    const elapsed = previous ? Math.min((now - previous) / 1000, .05) : 0;
    previous = now;
    const difference = target - speed;
    const acceleration = difference > 0 ? 25 : 35;
    speed += Math.sign(difference) * Math.min(Math.abs(difference), acceleration * elapsed);
    angle = (angle + speed * elapsed) % 360;
    record.style.transform = `rotate(${angle}deg)`;
    state();
    if (target || speed) frame = requestAnimationFrame(tick);
    else previous = 0;
  }

  function setPlaying(playing) {
    requested = playing;
    target = playing && !motion.matches ? fullSpeed : 0;
    if (motion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      speed = 0;
    }
    state();
    if ((target || speed) && !frame) frame = requestAnimationFrame(tick);
  }

  motion.addEventListener('change', () => setPlaying(requested));
  return { setPlaying };
}
