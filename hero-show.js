/* Homepage hero: live client stores in a browser frame and a phone.
   Advances every few seconds; hover, focus or the pause button stop it and
   reduced-motion users get no autoplay. Stores whose own homepage opens with
   a video show a recording of it: the clip loads after the page, plays only
   while its slide is on and stays a still poster for reduced motion or
   Save-Data. Without JS the first store shows as a still. */
(() => {
  const show = document.querySelector('[data-hero-show]');
  if (!show) return;
  const screens = [...show.querySelector('.hero-screens').children];
  const phones = [...show.querySelector('.hero-phone-screens').children];
  const chips = [...show.querySelectorAll('.hero-clients button')];
  const url = show.querySelector('.hero-url');
  const caption = show.querySelector('.hero-caption');
  const capName = caption.querySelector('b');
  const capSub = caption.querySelector('.hero-caption-text > span');
  const pauseBtn = show.querySelector('.hero-pause');
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  const DURATION = 5200;
  let at = 0, timer = 0, paused = reduced, hold = false, pageLoaded = document.readyState === 'complete';
  const motion = !reduced && !saveData;

  const isVideo = (el) => el && el.tagName === 'VIDEO';
  // Sharper encodes where the browser can use them, as listed in data-v:
  // h = an HEVC copy (.hevc.mp4); w = that copy is the large cut, for wide
  // screens only (narrow screens keep the lighter H.264 file).
  const HEVC = (() => { try { return !!document.createElement('video').canPlayType('video/mp4; codecs="hvc1.1.6.L120.90"'); } catch (e) { return false; } })();
  const clipSrc = (v) => {
    const f = (v.dataset.v || '').split(','); let s = v.dataset.src;
    if (HEVC && f.includes('h') && !(f.includes('w') && innerWidth < 900)) s = s.replace(/\.mp4$/, '.hevc.mp4');
    return s;
  };
  const load = (i) => [screens[i], phones[i]].forEach((el) => {
    if (!el) return;
    if (isVideo(el)) {
      if (el.dataset.poster) { el.poster = el.dataset.poster; el.removeAttribute('data-poster'); }
      // the clip itself waits for the page load so it never competes with it
      if (motion && pageLoaded && el.dataset.src) { el.src = clipSrc(el); el.removeAttribute('data-src'); }
    } else if (el.dataset.src) { el.src = el.dataset.src; el.removeAttribute('data-src'); }
  });
  // play the current slide's clips only while the carousel is running
  const syncVideos = () => {
    [screens, phones].forEach((set) => set.forEach((el, k) => {
      if (!isVideo(el)) return;
      if (k === at && !paused && !document.hidden && el.src) { el.muted = true; el.play().catch(() => {}); }
      else el.pause();
    }));
  };
  const duration = () => (motion && chips[at].dataset.dur ? Number(chips[at].dataset.dur) : DURATION);
  const go = (i) => {
    i = (i + screens.length) % screens.length;
    at = i;
    load(i); load((i + 1) % screens.length);
    [screens, phones].forEach((set) => set.forEach((el, k) => {
      el.classList.toggle('is-on', k === i);
      if (k === i && isVideo(el) && el.src) el.currentTime = 0;
    }));
    chips.forEach((c, k) => c.setAttribute('aria-pressed', String(k === i)));
    const c = chips[i];
    url.textContent = c.dataset.domain;
    caption.href = c.dataset.href;
    capName.textContent = c.dataset.name;
    capSub.textContent = c.dataset.sub;
    restart();
  };
  const restart = () => {
    clearTimeout(timer);
    syncVideos();
    const d = duration();
    show.style.setProperty('--hero-dur', `${d}ms`);
    show.classList.remove('is-running'); void show.offsetWidth;
    if (paused || hold) return;
    show.classList.add('is-running');
    timer = setTimeout(() => go(at + 1), d);
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
  go(0);
  const afterLoad = () => {
    pageLoaded = true;
    // the current slide (a clip on first view) and the next store
    (window.requestIdleCallback || ((f) => setTimeout(f, 300)))(() => { load(at); load((at + 1) % screens.length); restart(); });
  };
  if (pageLoaded) afterLoad(); else window.addEventListener('load', afterLoad, { once: true });
})();
