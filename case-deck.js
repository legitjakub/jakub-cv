/* Homepage case studies, one project per screen on desktop. Each project is
   sized to the screen under the header; one wheel, trackpad or key gesture
   glides the page to the next or previous project. Past the last project, or
   above the first, the page scrolls on as usual. Phones, short windows and
   reduced motion keep the plain list. */
(() => {
  const deck = document.querySelector('.case-deck');
  if (!deck) return;
  const pages = [...deck.querySelectorAll(':scope > .project-showcase')];
  if (pages.length < 2) return;
  const root = document.documentElement;
  const fit = window.matchMedia('(min-width:1024px) and (min-height:640px) and (hover:hover) and (prefers-reduced-motion:no-preference)');
  const HDR = 68, DUR = 650, QUIET = 220;
  let on = false, anchors = [], moving = false, swallow = false, lastWheel = 0, acc = 0;

  const measure = () => {
    const avail = innerHeight - HDR;
    deck.style.setProperty('--stage-h', `${avail}px`);
    pages.forEach((p) => {
      p.style.setProperty('--deck-f', '1');
      const g = p.querySelector('.project-gallery');
      for (let k = 0; k < 2; k++) {
        const h = p.scrollHeight, gh = g ? g.offsetHeight : 0, f = +p.style.getPropertyValue('--deck-f');
        if (h <= avail || !gh) break;
        p.style.setProperty('--deck-f', Math.max(0.55, f * (gh - (h - avail)) / gh).toFixed(3));
      }
    });
    anchors = pages.map((p) => Math.round(p.getBoundingClientRect().top + scrollY - HDR));
  };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const glide = (to) => {
    const from = scrollY, t0 = performance.now();
    moving = true;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / DUR);
      scrollTo({ top: from + (to - from) * ease(k), behavior: 'instant' });
      if (k < 1) requestAnimationFrame(step); else moving = false;
    };
    requestAnimationFrame(step);
  };
  // where a gesture in direction dir should take the page, or -1 to let it scroll
  const target = (dir) => {
    const y = scrollY, last = anchors.length - 1;
    if (dir > 0) {
      if (y < anchors[0] - 2) return -1;            // above the projects: handled on crossing
      const i = anchors.findIndex((a) => a > y + 2);
      return i;                                     // -1 past the last project
    }
    if (y > anchors[last] + 2) return -1;            // below the projects: handled on crossing
    for (let i = last; i >= 0; i--) if (anchors[i] < y - 2) return i;
    return -1;                                      // -1 above the first project
  };
  const inside = () => scrollY >= anchors[0] - 2 && scrollY <= anchors[anchors.length - 1] + 2;
  const step = (dir, e) => {
    const y = scrollY;
    // entering from above or below: stop on the first or last project
    if (!inside()) {
      const cross = dir > 0 ? anchors[0] : anchors[anchors.length - 1];
      const d = e ? (e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY) : dir * innerHeight;
      if ((dir > 0 && y < cross && y + d > cross - 4) || (dir < 0 && y > cross && y + d < cross + 4)) { e && e.preventDefault(); glide(cross); return true; }
      return false;
    }
    const i = target(dir);
    if (i < 0) return false;
    e && e.preventDefault();
    glide(anchors[i]);
    return true;
  };
  const onWheel = (e) => {
    if (!on || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    const now = performance.now(), gap = now - lastWheel; lastWheel = now;
    if (gap > QUIET) { swallow = false; acc = 0; }
    if (moving || swallow) {
      if (inside() || moving) { e.preventDefault(); swallow = true; }
      return;
    }
    const dir = e.deltaY > 0 ? 1 : -1;
    if (!inside()) { if (step(dir, e)) swallow = true; return; }
    if (target(dir) < 0) return; // last or first project: let the page go on
    e.preventDefault();
    acc += e.deltaY;
    if (Math.abs(acc) < 20) return;
    step(dir, null); acc = 0; swallow = true;
  };
  const KEYS = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 };
  const onKey = (e) => {
    if (!on || !(e.key in KEYS) || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
    if (moving) { e.preventDefault(); return; }
    step(e.key === ' ' && e.shiftKey ? -1 : KEYS[e.key], e);
  };

  const enable = () => {
    if (on) return;
    on = true; root.classList.add('has-case-deck'); measure();
    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('keydown', onKey);
    addEventListener('resize', measure);
  };
  const disable = () => {
    if (!on) return;
    on = false; root.classList.remove('has-case-deck');
    deck.style.removeProperty('--stage-h');
    pages.forEach((p) => p.style.removeProperty('--deck-f'));
    removeEventListener('wheel', onWheel); removeEventListener('keydown', onKey); removeEventListener('resize', measure);
  };
  const sync = () => (fit.matches ? enable() : disable());
  fit.addEventListener('change', sync);
  addEventListener('load', () => on && measure());
  sync();
})();
