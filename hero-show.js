/* Homepage hero: live client stores in a browser frame and a phone.
   Advances every few seconds; hover, focus or the pause button stop it and
   reduced-motion users get no autoplay. Without JS the first store shows. */
(() => {
  const show = document.querySelector('[data-hero-show]');
  if (!show) return;
  const screens = [...show.querySelectorAll('.hero-screens img')];
  const phones = [...show.querySelectorAll('.hero-phone-screens img')];
  const chips = [...show.querySelectorAll('.hero-clients button')];
  const url = show.querySelector('.hero-url');
  const caption = show.querySelector('.hero-caption');
  const capName = caption.querySelector('b');
  const capSub = caption.querySelector('.hero-caption-text > span');
  const pauseBtn = show.querySelector('.hero-pause');
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const DURATION = 5200;
  let at = 0, timer = 0, paused = reduced, hold = false;

  const load = (i) => [screens[i], phones[i]].forEach((img) => {
    if (img && img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
  });
  const go = (i) => {
    i = (i + screens.length) % screens.length;
    load(i); load((i + 1) % screens.length);
    [screens, phones].forEach((set) => set.forEach((img, k) => img.classList.toggle('is-on', k === i)));
    chips.forEach((c, k) => c.setAttribute('aria-pressed', String(k === i)));
    const c = chips[i];
    url.textContent = c.dataset.domain;
    caption.href = c.dataset.href;
    capName.textContent = c.dataset.name;
    capSub.textContent = c.dataset.sub;
    at = i;
    restart();
  };
  const restart = () => {
    clearTimeout(timer);
    show.style.setProperty('--hero-dur', `${DURATION}ms`);
    show.classList.remove('is-running'); void show.offsetWidth;
    if (paused || hold) return;
    show.classList.add('is-running');
    timer = setTimeout(() => go(at + 1), DURATION);
  };
  const setPaused = (p) => {
    paused = p;
    pauseBtn.setAttribute('aria-pressed', String(p));
    pauseBtn.setAttribute('aria-label', p ? pauseBtn.dataset.play : pauseBtn.dataset.pause);
    restart();
  };

  chips.forEach((c, i) => c.addEventListener('click', () => go(i)));
  pauseBtn.addEventListener('click', () => setPaused(!paused));
  const stage = show.querySelector('.hero-stage');
  [stage, caption].forEach((el) => {
    el.addEventListener('pointerenter', () => { hold = true; restart(); });
    el.addEventListener('pointerleave', () => { hold = false; restart(); });
  });
  show.addEventListener('focusin', () => { hold = true; restart(); });
  show.addEventListener('focusout', (e) => { if (!show.contains(e.relatedTarget)) { hold = false; restart(); } });
  document.addEventListener('visibilitychange', () => { hold = document.hidden; restart(); });

  show.classList.add('is-ready');
  setPaused(reduced);
  // start fetching the second store once the first has painted
  (window.requestIdleCallback || ((f) => setTimeout(f, 1200)))(() => load(1));
  go(0);
})();
