/* Homepage case studies as a real slideshow on desktop. The projects share
   one screen under the header; once the page reaches them it stops, and each
   wheel, trackpad or key gesture swaps exactly one project (the next slides
   up over the current one). Past the last project, or above the first, the
   page scrolls on as usual. Dots on the side jump straight to a project.
   Phones, short windows, touch-only devices and reduced motion keep the
   plain list of projects. */
(() => {
  const deck = document.querySelector('.case-deck');
  if (!deck) return;
  const slides = [...deck.querySelectorAll(':scope > .project-showcase')];
  if (slides.length < 2) return;
  const root = document.documentElement;
  const en = root.lang === 'en';
  const fit = window.matchMedia('(min-width:1024px) and (min-height:640px) and (hover:hover) and (prefers-reduced-motion:no-preference)');
  const HDR = 68, LOCK = 560, GAP = 140;
  let on = false, index = 0, lockUntil = 0, lastWheel = 0, used = false, fading = false, acc = 0, wasPinned = false;
  const hist = [];
  const last = slides.length - 1;

  const dots = document.createElement('nav');
  dots.className = 'deck-dots';
  dots.setAttribute('aria-label', en ? 'Case studies' : 'Případové studie');
  dots.innerHTML = slides.map((s, i) => {
    const name = s.querySelector('h2 span, h2 img[alt]:not([alt=""])');
    const label = (name && (name.textContent || name.alt)) || s.id;
    return `<button type="button" data-i="${i}" aria-label="${label.trim()}"><span>${String(i + 1).padStart(2, '0')}</span></button>`;
  }).join('');
  dots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { align(); go(+b.dataset.i); } });

  const top = () => deck.getBoundingClientRect().top;
  const deckY = () => Math.round(top() + scrollY - HDR);
  const align = (smooth = false) => scrollTo({ top: deckY(), behavior: smooth ? 'smooth' : 'auto' });
  const pinned = () => Math.abs(top() - HDR) < 3;

  const measure = () => {
    const avail = innerHeight - HDR;
    deck.style.setProperty('--stage-h', `${avail}px`);
    slides.forEach((s) => {
      s.style.setProperty('--deck-f', '1');
      const g = s.querySelector('.project-gallery');
      // two passes: the gallery does not shrink exactly in proportion
      for (let k = 0; k < 2; k++) {
        const h = s.scrollHeight, gh = g ? g.offsetHeight : 0, f = +s.style.getPropertyValue('--deck-f');
        if (h <= avail || !gh) break;
        s.style.setProperty('--deck-f', Math.max(0.55, f * (gh - (h - avail)) / gh).toFixed(3));
      }
    });
  };
  const videos = (s) => [...s.querySelectorAll('video')];
  const paint = () => {
    slides.forEach((s, i) => {
      s.classList.toggle('is-past', i < index);
      s.classList.toggle('is-current', i === index);
      s.classList.toggle('is-next', i > index);
      s.inert = i !== index;
      s.setAttribute('aria-hidden', String(i !== index));
      videos(s).forEach((v) => { if (i !== index && !v.paused) v.pause(); });
    });
    // a clip the visitor paused with its caption button stays paused
    if (pinned()) videos(slides[index]).forEach((v) => { if (v.paused && !v.dataset.userPaused) v.play().catch(() => {}); });
    [...dots.children].forEach((b, i) => b.toggleAttribute('aria-current', i === index));
    deck.classList.toggle('is-light', slides[index].classList.contains('case-molecules-new'));
  };
  const go = (i) => {
    i = Math.max(0, Math.min(last, i));
    if (i === index) return;
    index = i; paint();
    lockUntil = performance.now() + LOCK;
  };
  // a clip from media.js may start on a hidden slide: hold it
  slides.forEach((s, i) => videos(s).forEach((v) => v.addEventListener('play', () => { if (on && i !== index) v.pause(); })));

  // One swipe or wheel notch = one slide. A trackpad keeps sending decaying
  // momentum events after the fingers lift; those are ignored, but a fresh
  // swipe (a pause, or deltas growing again) moves on right away.
  const onWheel = (e) => {
    if (!on || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY, ad = Math.abs(dy);
    const now = performance.now(), ts = e.timeStamp || now, gap = ts - lastWheel; lastWheel = ts;
    const prev = Math.max(0, ...hist);
    // a hitch in a dying trackpad momentum is not a new swipe
    const tail = used && gap < 450 && ad <= prev && ad < 60;
    hist.push(ad); if (hist.length > 3) hist.shift();
    if (gap > GAP && !tail) hist.length = 0;
    if (used && ad < prev * 0.9) fading = true; // momentum has started to die down
    if ((gap > GAP && !tail) || (used && fading && ad > 8 && ad > prev * 1.5)) { used = false; acc = 0; }
    const locked = now < lockUntil;
    const t = top() - HDR, isPinned = pinned();
    // the page scrolled onto the deck in this same gesture: it does not count
    if (isPinned && !wasPinned && (gap <= GAP || tail) && !locked) { used = true; fading = false; }
    wasPinned = isPinned;
    if (!isPinned) {
      if (locked) { e.preventDefault(); return; }
      // a gesture that would carry the deck across the header line stops there
      if ((dy > 0 && t > 2 && t - dy < 2) || (dy < 0 && t < -2 && t - dy > -2)) {
        e.preventDefault(); wasPinned = true; index = dy > 0 ? 0 : last; paint(); align(true);
        used = true; fading = false; lockUntil = now + LOCK;
      }
      return;
    }
    const leaving = (dy > 0 && index === last) || (dy < 0 && index === 0);
    if (leaving && !locked && !used) return; // let the page move on
    e.preventDefault();
    if (locked || used) return;
    acc += dy;
    if (Math.abs(acc) < 18) return;
    go(index + (acc > 0 ? 1 : -1)); acc = 0; used = true; fading = false;
  };
  const KEYS = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 };
  const onKey = (e) => {
    if (!on || !(e.key in KEYS) || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
    // Space and Enter on a focused button or link keep their own action (e.g. a project dot)
    if (e.key === ' ' && e.target.closest && e.target.closest('button,a,summary,[role="button"]')) return;
    const dir = e.key === ' ' && e.shiftKey ? -1 : KEYS[e.key];
    const t = top() - HDR;
    if (!pinned()) {
      if ((dir > 0 && t > 0 && t < innerHeight * 0.95) || (dir < 0 && t < 0 && t > -innerHeight * 0.95)) {
        e.preventDefault(); index = dir > 0 ? 0 : last; paint(); align(true);
        lockUntil = performance.now() + LOCK;
      }
      return;
    }
    if ((dir > 0 && index === last) || (dir < 0 && index === 0)) return;
    e.preventDefault();
    if (performance.now() >= lockUntil) go(index + dir);
  };
  const onHash = () => {
    const i = slides.findIndex((s) => '#' + s.id === location.hash);
    if (i >= 0 && on) { index = i; paint(); align(); }
  };

  const enable = () => {
    if (on) return;
    on = true; root.classList.add('has-case-deck');
    deck.append(dots);
    measure(); paint();
    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('keydown', onKey);
    addEventListener('resize', measure);
    addEventListener('hashchange', onHash);
    onHash();
  };
  const disable = () => {
    if (!on) return;
    on = false; root.classList.remove('has-case-deck');
    dots.remove(); deck.classList.remove('is-light');
    deck.style.removeProperty('--stage-h');
    slides.forEach((s) => { s.classList.remove('is-past', 'is-current', 'is-next'); s.inert = false; s.removeAttribute('aria-hidden'); s.style.removeProperty('--deck-f'); });
    removeEventListener('wheel', onWheel); removeEventListener('keydown', onKey);
    removeEventListener('resize', measure); removeEventListener('hashchange', onHash);
  };
  const sync = () => (fit.matches ? enable() : disable());
  fit.addEventListener('change', sync);
  addEventListener('load', () => on && measure());
  sync();
})();
