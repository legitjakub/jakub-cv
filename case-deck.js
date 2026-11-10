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
  const HDR = 68, ANIM = 720, QUIET = 240;
  let on = false, index = 0, busy = false, lastWheel = 0, swallow = false, acc = 0;
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
    if (pinned()) videos(slides[index]).forEach((v) => { if (v.paused) v.play().catch(() => {}); });
    [...dots.children].forEach((b, i) => b.toggleAttribute('aria-current', i === index));
  };
  const go = (i) => {
    i = Math.max(0, Math.min(last, i));
    if (i === index) return;
    index = i; busy = true; paint();
    setTimeout(() => { busy = false; }, ANIM);
  };
  // a clip from media.js may start on a hidden slide: hold it
  slides.forEach((s, i) => videos(s).forEach((v) => v.addEventListener('play', () => { if (on && i !== index) v.pause(); })));

  const onWheel = (e) => {
    if (!on || e.ctrlKey) return;
    const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
    const now = performance.now(), gap = now - lastWheel; lastWheel = now;
    const t = top() - HDR;
    if (!pinned()) {
      // a gesture that would carry the deck across the header line stops there
      if ((dy > 0 && t > 0 && t - dy < 0) || (dy < 0 && t < 0 && t - dy > 0)) {
        e.preventDefault(); index = dy > 0 ? 0 : last; paint(); align(true);
        busy = true; swallow = true; setTimeout(() => { busy = false; }, ANIM);
      }
      return;
    }
    if (gap > QUIET) { swallow = false; acc = 0; }
    const leaving = (dy > 0 && index === last) || (dy < 0 && index === 0);
    if (leaving && !busy && !swallow) return; // let the page move on
    e.preventDefault();
    if (busy || swallow) { swallow = true; return; } // the rest of the same gesture
    acc += dy;
    if (Math.abs(acc) < 24) return;
    go(index + (acc > 0 ? 1 : -1)); acc = 0; swallow = true;
  };
  const KEYS = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 };
  const onKey = (e) => {
    if (!on || !(e.key in KEYS) || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
    const dir = e.key === ' ' && e.shiftKey ? -1 : KEYS[e.key];
    const t = top() - HDR;
    if (!pinned()) {
      if ((dir > 0 && t > 0 && t < innerHeight * 0.95) || (dir < 0 && t < 0 && t > -innerHeight * 0.95)) {
        e.preventDefault(); index = dir > 0 ? 0 : last; paint(); align(true);
      }
      return;
    }
    if ((dir > 0 && index === last) || (dir < 0 && index === 0)) return;
    e.preventDefault();
    if (!busy) go(index + dir);
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
    dots.remove();
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
