// Match the reference: two complete page canvases meet at a clean vertical seam
// while the old canvas dims and the new composition resolves in softly.
export function createPageTransitions(container) {
  const root = container.closest('#app');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  let revision = 0;
  let oldLayer = null;
  let newLayer = null;
  let opening = null;
  const scrollOffsets = new WeakMap();

  function clear() {
    revision++;
    for (const animation of animations) animation.cancel();
    animations.clear();
    oldLayer?.remove();
    newLayer?.remove();
    oldLayer = null;
    newLayer = null;
    opening?.remove();
    opening = null;
    delete container.dataset.opening;
    delete container.dataset.transitioning;
  }

  function animate(element, frames, options) {
    const animation = element.animate(frames, {
      duration: 620,
      easing: 'cubic-bezier(.76, 0, .24, 1)',
      fill: 'both',
      ...options,
    });
    animations.add(animation);
    return animation.finished.catch(() => {});
  }

  function makeLayer(kind) {
    const layer = root.cloneNode(true);
    layer.removeAttribute('id');
    layer.className = `site-transition-layer site-transition-${kind}`;
    layer.setAttribute('aria-hidden', 'true');
    layer.inert = true;
    layer.querySelector('#page-announcement')?.remove();
    layer.querySelectorAll('[id]').forEach(element => {
      // SVG filters are referenced by URL from CSS and need their IDs in the visual clone.
      if (element.matches('svg filter')) return;
      element.removeAttribute('id');
    });
    layer.querySelectorAll('a').forEach(link => {
      link.removeAttribute('href');
      link.removeAttribute('data-page');
    });

    // Keep a single semantic <main> in the document while preserving its layout.
    const clonedMain = layer.querySelector('main');
    if (clonedMain) {
      const visualMain = document.createElement('div');
      visualMain.className = 'transition-main';
      visualMain.setAttribute('data-page', clonedMain.dataset.page || '');
      visualMain.innerHTML = clonedMain.innerHTML;
      clonedMain.replaceWith(visualMain);
    }
    scrollOffsets.set(layer, [...root.querySelectorAll('[data-page-scroll]')].map(element => element.scrollTop));
    return layer;
  }

  function revealContent(page, direction) {
    if (!page) return [];
    return [...page.children]
      .filter(element => !element.classList.contains('sr-only'))
      .map((element, index) => animate(element, [
        { opacity: 0, translate: `${direction * 16}px 0` },
        { opacity: 1, translate: '0 0' },
      ], {
        delay: 210 + Math.min(index, 5) * 38,
        duration: 390,
        easing: 'cubic-bezier(.22, 1, .36, 1)',
      }));
  }

  function revealOpening(page) {
    opening = document.createElement('div');
    opening.className = 'card-opening';
    opening.setAttribute('aria-hidden', 'true');
    opening.innerHTML = '<div class="opening-light"></div><div class="opening-leaf opening-leaf-left"></div><div class="opening-leaf opening-leaf-right"></div><img class="opening-monogram" src="/assets/monogram-as-reference-gold-v3.webp" alt="" width="768" height="768"/>';
    root.append(opening);
    container.dataset.opening = 'true';
    // Keep the same camera distance relative to the paper width on wide screens.
    // A fixed 1800px perspective made desktop leaves grow towards the viewer
    // and clip far outside the card while the phone version opened naturally.
    const perspective = Math.max(1800, root.clientWidth * (1800 / 390));
    const effects = [
      animate(opening.querySelector('.opening-monogram'), [
        { opacity: 0, scale: '.96', offset: 0 },
        { opacity: 1, scale: '1', offset: .25 },
        { opacity: 1, scale: '1', offset: .6 },
        { opacity: 0, scale: '1.025', offset: 1 },
      ], { duration: 1200, easing: 'linear' }),
      animate(opening.querySelector('.opening-light'), [
        { opacity: 0, offset: 0 }, { opacity: .5, offset: .55 }, { opacity: 0, offset: 1 },
      ], { delay: 400, duration: 2400, easing: 'ease-in-out' }),
      ...['left', 'right'].map((side, index) => animate(opening.querySelector(`.opening-leaf-${side}`), [
        { transform: `perspective(${perspective}px) rotateY(0deg)`, opacity: 1 },
        { transform: `perspective(${perspective}px) rotateY(${index ? '' : '-'}84deg)`, opacity: 1, offset: .85 },
        { transform: `perspective(${perspective}px) rotateY(${index ? '' : '-'}94deg)`, opacity: 0 },
      ], { delay: 320, duration: 1900, easing: 'cubic-bezier(.45, 0, .18, 1)' })),
    ];
    const reveal = (element, delay, duration = 1400, distance = 14) => {
      if (!element) return;
      const opacity = getComputedStyle(element).opacity;
      effects.push(animate(element, [
        { opacity: 0, translate: `0 ${distance}px` },
        { opacity, translate: '0 0' },
      ], { delay, duration, easing: 'cubic-bezier(.22, .65, .25, 1)' }));
    };
    if (page?.classList.contains('home-page')) {
      reveal(page.querySelector('.home-flower'), 720, 1400, 8);
      reveal(page.querySelector('.groom-name'), 1100, 1600);
      reveal(page.querySelector('.ampersand'), 1450, 1100, 6);
      reveal(page.querySelector('.bride-name'), 1650, 1600);
      reveal(page.querySelector('.event-summary'), 2350, 1200, 10);
    } else if (page?.classList.contains('invitation-page')) {
      reveal(page.querySelector('.bismillah'), 800);
      page.querySelectorAll('.invitation-copy > p').forEach((element, index) => reveal(element, 1100 + index * 230, 1300, 10));
    } else {
      [...(page?.children ?? [])].filter(element => !element.classList.contains('sr-only'))
        .forEach((element, index) => reveal(element, 850 + Math.min(index, 5) * 220, 1400, 10));
    }
    return effects;
  }

  async function run(render, { direction = 1, initial = false } = {}) {
    clear();
    const current = revision;

    if (reducedMotion.matches || typeof root.animate !== 'function') {
      render();
      return;
    }

    if (!initial && container.querySelector('.page')) oldLayer = makeLayer('old');
    render();
    if (current !== revision) return;

    if (initial || !oldLayer) {
      container.dataset.transitioning = 'true';
      try {
        await Promise.all(revealOpening(container.querySelector('.page')));
      } finally {
        if (current === revision) clear();
      }
      return;
    }

    newLayer = makeLayer('new');
    document.body.append(oldLayer, newLayer);
    for (const layer of [oldLayer, newLayer]) {
      layer.querySelectorAll('[data-page-scroll]').forEach((element, index) => {
        element.scrollTop = scrollOffsets.get(layer)[index] || 0;
      });
    }
    container.dataset.transitioning = 'true';
    const newPage = newLayer.querySelector('.page');
    const startX = direction * 100;
    const endX = -direction * 100;
    const effects = [
      animate(oldLayer, [
        { transform: 'translate3d(0, 0, 0)', filter: 'brightness(1)' },
        { transform: `translate3d(${endX}%, 0, 0)`, filter: 'brightness(.72)' },
      ]),
      animate(newLayer, [
        { transform: `translate3d(${startX}%, 0, 0)` },
        { transform: 'translate3d(0, 0, 0)' },
      ]),
      ...revealContent(newPage, direction),
    ];

    try {
      await Promise.all(effects);
    } finally {
      if (current === revision) clear();
    }
  }

  function finish() {
    clear();
  }

  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) finish(); });
  window.addEventListener('resize', finish);
  // Let users interact immediately instead of waiting for the visual tail.
  root.addEventListener('pointerdown', event => {
    if (opening || event.target.closest('button, input, select, textarea, a')) finish();
  }, { capture: true });
  root.addEventListener('keydown', event => {
    if (event.target.closest('button, input, select, textarea')) finish();
  }, { capture: true });
  window.addEventListener('keydown', event => {
    if (opening && ['Escape', 'Enter', ' ', 'Tab'].includes(event.key)) finish();
  }, { capture: true });
  return { run, finish };
}
