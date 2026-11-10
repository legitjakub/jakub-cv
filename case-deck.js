/* Homepage case studies as a deck on desktop: each project sticks under the
   header and the next one slides over it; the covered one dims and steps
   back. When a scroll gesture ends inside the deck, the page settles on the
   nearest project, and a short nudge from a project in place moves to the
   next or previous one. Phones, short windows and reduced motion keep the
   plain page (reduced motion keeps the stacking but no settling or scaling). */
(() => {
  const deck = document.querySelector('.case-deck');
  if (!deck) return;
  const cards = [...deck.querySelectorAll(':scope > .project-showcase')];
  if (cards.length < 2) return;
  const root = document.documentElement;
  const wide = window.matchMedia('(min-width:1024px) and (min-height:640px) and (hover:hover)');
  const reduce = window.matchMedia('(prefers-reduced-motion:reduce)');
  const TOP = 68; // the header height once the page is scrolled
  let on = false, anchors = [], auto = false, user = false, restY = 0, lastInput = 0, frame = 0, idle = 0;
  const held = new WeakSet();
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const measure = () => {
    const avail = innerHeight - TOP;
    cards.forEach((c) => c.style.setProperty('--deck-f', '1'));
    cards.forEach((c) => {
      const g = c.querySelector('.project-gallery');
      const h = c.scrollHeight, gh = g ? g.offsetHeight : 0;
      if (h > avail && gh) c.style.setProperty('--deck-f', clamp((avail - (h - gh)) / gh, 0.72, 1).toFixed(3));
    });
    let y = deck.getBoundingClientRect().top + scrollY;
    anchors = cards.map((c) => {
      const h = c.offsetHeight;
      c.style.setProperty('--deck-stick', `${h <= avail + 1 ? TOP : innerHeight - h}px`);
      const a = Math.round(y - TOP); y += h; return a;
    });
    update();
  };
  const update = () => {
    frame = 0;
    const span = innerHeight - TOP;
    cards.forEach((c, i) => {
      const next = cards[i + 1];
      const cover = next ? clamp((innerHeight - next.getBoundingClientRect().top) / span, 0, 1) : 0;
      c.style.setProperty('--deck-cover', cover.toFixed(3));
      c.querySelectorAll('video').forEach((v) => {
        if (cover > 0.97 && !v.paused) { v.pause(); held.add(v); }
        else if (cover < 0.9 && held.has(v)) { held.delete(v); v.play().catch(() => {}); }
      });
    });
  };
  const nearest = (y) => anchors.reduce((b, a, i) => (Math.abs(a - y) < Math.abs(anchors[b] - y) ? i : b), 0);
  const settle = () => {
    if (!on || reduce.matches) return;
    // wait until the wheel or finger has been still for a moment
    const quiet = performance.now() - lastInput;
    if (user && quiet < 180) { clearTimeout(idle); idle = setTimeout(settle, 190 - quiet); return; }
    if (auto || !user) { auto = false; restY = scrollY; return; }
    user = false;
    const y = scrollY;
    if (y < anchors[0] - innerHeight * 0.4 || y > anchors[anchors.length - 1] + innerHeight * 0.3) { restY = y; return; }
    const d = y - restY, last = anchors.length - 1;
    const atAnchor = Math.abs(anchors[nearest(restY)] - restY) < 40;
    let i;
    if (atAnchor && Math.abs(d) > Math.min(60, innerHeight * 0.05)) {
      // a nudge from a project in place: go one step in that direction (or leave the deck)
      if (d > 0) i = anchors.findIndex((v) => v >= y - 2);
      else { i = -1; for (let k = last; k >= 0; k--) if (anchors[k] <= y + 2) { i = k; break; } }
    } else if ((y > anchors[last] && d > 0) || (y < anchors[0] && d < 0)) i = -1;
    else i = nearest(y);
    if (i < 0) { restY = y; return; }
    if (Math.abs(anchors[i] - y) < 3) { restY = y; return; }
    auto = true;
    scrollTo({ top: anchors[i], behavior: 'smooth' });
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
    if (!('onscrollend' in window)) { clearTimeout(idle); idle = setTimeout(settle, 160); }
  };
  const flagUser = () => { user = true; auto = false; lastInput = performance.now(); };
  const keys = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Spacebar']);
  const onKey = (e) => { if (keys.has(e.key)) flagUser(); };

  const enable = () => {
    if (on) return;
    on = true; root.classList.add('has-case-deck');
    measure(); restY = scrollY;
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('scrollend', settle);
    addEventListener('resize', measure);
    addEventListener('wheel', flagUser, { passive: true });
    addEventListener('touchmove', flagUser, { passive: true });
    addEventListener('keydown', onKey);
  };
  const disable = () => {
    if (!on) return;
    on = false; root.classList.remove('has-case-deck');
    cards.forEach((c) => ['--deck-f', '--deck-stick', '--deck-cover'].forEach((p) => c.style.removeProperty(p)));
    removeEventListener('scroll', onScroll); removeEventListener('scrollend', settle);
    removeEventListener('resize', measure); removeEventListener('wheel', flagUser);
    removeEventListener('touchmove', flagUser); removeEventListener('keydown', onKey);
  };
  const sync = () => (wide.matches ? enable() : disable());
  wide.addEventListener('change', sync);
  // videos and fonts change card heights, so measure again once the page settles
  addEventListener('load', () => on && measure());
  cards.forEach((c) => c.querySelectorAll('video').forEach((v) => v.addEventListener('loadedmetadata', () => on && measure(), { once: true })));
  sync();
})();
