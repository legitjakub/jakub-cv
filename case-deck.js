/* One deliberate vertical gesture changes one project. The rest of the page
   keeps its normal scroll. Small windows and reduced motion keep the list. */
(() => {
  const deck = document.querySelector('.case-deck');
  if (!deck) return;
  const slides = [...deck.querySelectorAll(':scope > .project-showcase')];
  if (slides.length < 2) return;
  const root = document.documentElement;
  const en = root.lang === 'en';
  const fit = window.matchMedia('(min-width:320px) and (min-height:600px) and (prefers-reduced-motion:no-preference)');
  const HEADER = 68;
  const last = slides.length - 1;
  let on = false, index = 0, phase = 'before', touch = null;

  // A quiet gap starts a new gesture. Within a continuous trackpad stream,
  // a deliberate reversal or a rising impulse after decay does the same.
  // There is no animation lock: the next gesture can interrupt a transition.
  const wheel = (() => {
    let at = -Infinity, previous = 0, peak = 0, direction = 0;
    let consumed = false, falling = false, total = 0;
    return {
      reset() { at = -Infinity; consumed = false; previous = peak = total = direction = 0; falling = false; },
      hold() { consumed = true; },
      take(dy, now) {
        const amount = Math.abs(dy), sign = Math.sign(dy), gap = now - at;
        const reversed = consumed && sign !== direction && amount >= 8;
        const rising = consumed && falling && amount >= Math.max(12, Math.min(20, peak * 0.25)) && amount > previous * 1.8;
        const notch = consumed && !falling && gap >= 80 && amount >= 40 && Math.abs(amount - previous) < 1;
        if (gap > 140 || reversed || rising || notch) {
          consumed = false; falling = false; total = 0; peak = 0;
        } else if (previous && amount < previous * 0.8) falling = true;
        at = now; previous = amount; peak = Math.max(peak, amount); direction = sign;
        if (consumed) return 0;
        total += dy;
        if (Math.abs(total) < 14) return 0;
        consumed = true;
        return Math.sign(total);
      }
    };
  })();

  const names = slides.map(s => {
    const name = s.querySelector('h2 span, h2 img[alt]:not([alt=""])');
    return ((name && (name.textContent || name.alt)) || s.id).trim();
  });
  const dots = document.createElement('nav');
  dots.className = 'deck-dots';
  dots.setAttribute('aria-label', en ? 'Choose a case study' : 'Vybrat případovou studii');
  slides.forEach((s, i) => {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.i = String(i);
    button.setAttribute('aria-label', names[i]);
    button.textContent = String(i + 1).padStart(2, '0');
    button.addEventListener('click', () => { align(); go(i); wheel.reset(); });
    dots.append(button);
  });
  const controls = document.createElement('nav');
  controls.className = 'deck-controls';
  controls.setAttribute('aria-label', en ? 'Browse projects' : 'Procházení projektů');
  const status = document.createElement('output');
  status.className = 'deck-status'; status.setAttribute('aria-live', 'polite');
  const hint = document.createElement('span');
  hint.className = 'deck-hint'; hint.textContent = en ? 'Scroll to the next project' : 'Posunutím na další projekt';
  const previous = document.createElement('button');
  previous.type = 'button'; previous.textContent = '↑';
  const next = document.createElement('button');
  next.type = 'button'; next.textContent = '↓';
  previous.addEventListener('click', () => { align(); step(-1); wheel.reset(); });
  next.addEventListener('click', () => { align(); step(1); wheel.reset(); });
  controls.append(status, hint, previous, next);

  const top = () => deck.getBoundingClientRect().top;
  const pageTop = () => top() + scrollY - HEADER;
  const height = () => innerHeight - HEADER;
  const pinned = () => Math.abs(top() - HEADER) < 4;
  const visible = () => top() <= HEADER + 16 && deck.getBoundingClientRect().bottom > HEADER + height() * 0.4;
  function align() { scrollTo({ top:pageTop(), behavior:'auto' }); phase = 'active'; }
  const videos = s => [...s.querySelectorAll('video')];
  const paint = () => {
    root.classList.toggle('is-case-deck-active', on && pinned());
    slides.forEach((s, i) => {
      s.classList.toggle('is-past', i < index);
      s.classList.toggle('is-current', i === index);
      s.classList.toggle('is-next', i > index);
      s.inert = i !== index;
      s.setAttribute('aria-hidden', String(i !== index));
      videos(s).forEach(v => { if (i !== index && !v.paused) v.pause(); });
    });
    if (pinned() && !document.hidden) videos(slides[index]).forEach(v => {
      if (v.paused && !v.closest('[hidden]') && v.dataset.userPaused !== '1') v.play().catch(() => {});
    });
    [...dots.children].forEach((b, i) => b.toggleAttribute('aria-current', i === index));
    deck.classList.toggle('is-light', slides[index].classList.contains('case-molecules-new') || slides[index].classList.contains('case-molecules'));
    status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    status.setAttribute('aria-label', `${index + 1} / ${slides.length}: ${names[index]}`);
    previous.setAttribute('aria-label', index ? (en ? 'Previous project' : 'Předchozí projekt') : (en ? 'Previous section' : 'Předchozí část stránky'));
    next.setAttribute('aria-label', index < last ? (en ? 'Next project' : 'Další projekt') : (en ? 'Continue down the page' : 'Pokračovat dál na stránce'));
  };
  function go(i) {
    i = Math.max(0, Math.min(last, i));
    const moveFocus = i !== index && slides[index].contains(document.activeElement);
    index = i; paint();
    if (moveFocus) {
      const heading = slides[index].querySelector('h2');
      heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll:true });
    }
  }
  function step(direction) {
    if (index + direction < 0 || index + direction > last) {
      phase = direction > 0 ? 'after' : 'before';
      root.classList.remove('is-case-deck-active');
      scrollTo({ top:Math.max(0, pageTop() + direction * height()), behavior:'smooth' });
    } else go(index + direction);
  }
  slides.forEach((s, i) => videos(s).forEach(v => v.addEventListener('play', () => { if (on && i !== index) v.pause(); })));

  const measure = () => {
    const available = height();
    deck.style.setProperty('--stage-h', `${available}px`);
    slides.forEach(s => {
      s.style.setProperty('--deck-f', '1');
      const gallery = s.querySelector('.project-gallery');
      for (let pass = 0; pass < 4 && gallery; pass++) {
        const excess = s.scrollHeight - available, galleryHeight = gallery.offsetHeight;
        if (excess <= 2 || !galleryHeight) break;
        const factor = +s.style.getPropertyValue('--deck-f');
        // Centred content overflows equally above and below the frame.
        s.style.setProperty('--deck-f', Math.max(0.45, factor * (galleryHeight - excess * 2 - 4) / galleryHeight).toFixed(3));
      }
    });
    return slides.every(s => s.scrollHeight <= available + 2);
  };
  const blocked = target => target.closest && target.closest('.nav-wrap,dialog,[role="dialog"]');
  const onWheel = e => {
    if (!on || e.defaultPrevented || e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX) || blocked(e.target)) return;
    const dy = e.deltaY * (e.deltaMode === 1 ? 24 : e.deltaMode === 2 ? innerHeight : 1);
    const direction = wheel.take(dy, performance.now());
    if (!pinned()) {
      const t = top() - HEADER;
      if (t > 0) phase = 'before';
      if (phase === 'after' && dy > 0) { wheel.reset(); return; }
      const crossing = (dy > 0 && t >= 0 && t <= Math.max(32, dy)) || (dy < 0 && t < 0 && t - dy >= 0);
      if (crossing || (phase === 'active' && visible())) {
        e.preventDefault();
        const resume = phase === 'active';
        if (!resume) index = dy > 0 ? 0 : last;
        align(); paint();
        if (resume && direction) step(direction);
        wheel.hold();
      } else wheel.reset();
      return;
    }
    e.preventDefault(); phase = 'active';
    if (direction) step(direction);
  };
  const keys = { ArrowDown:1, PageDown:1, ' ':1, ArrowUp:-1, PageUp:-1 };
  const onKey = e => {
    if (!on || e.defaultPrevented || !(e.key in keys) || e.altKey || e.ctrlKey || e.metaKey || blocked(e.target)) return;
    if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable],[role="tab"]')) return;
    if (e.key === ' ' && e.target.closest && e.target.closest('button,a,summary,[role="button"]')) return;
    const direction = e.key === ' ' && e.shiftKey ? -1 : keys[e.key];
    if (!pinned()) {
      if (phase === 'active' && visible()) {
        e.preventDefault(); align();
        if (!e.repeat) { step(direction); wheel.hold(); }
        return;
      }
      const t = top() - HEADER;
      if ((direction > 0 && t > 0 && t < height()) || (direction < 0 && t < 0 && t > -height())) {
        e.preventDefault(); index = direction > 0 ? 0 : last; align(); paint(); wheel.hold();
      }
      return;
    }
    e.preventDefault();
    if (!e.repeat) { step(direction); wheel.hold(); }
  };
  deck.addEventListener('touchstart', e => {
    if (!on || e.touches.length !== 1 || blocked(e.target)) { touch = null; return; }
    touch = { x:e.touches[0].clientX, y:e.touches[0].clientY, used:false };
  }, { passive:true });
  deck.addEventListener('touchmove', e => {
    if (!on || !touch || touch.used || e.touches.length !== 1) return;
    const dy = touch.y - e.touches[0].clientY, dx = touch.x - e.touches[0].clientX;
    if (Math.abs(dy) < 36 || Math.abs(dy) <= Math.abs(dx) * 1.2) return;
    if (e.cancelable) e.preventDefault();
    touch.used = true;
    if (!pinned()) {
      const resume = phase === 'active';
      if (!resume) index = dy > 0 ? 0 : last;
      align(); paint();
      if (resume) step(Math.sign(dy));
    } else step(Math.sign(dy));
  }, { passive:false });
  ['touchend','touchcancel'].forEach(type => deck.addEventListener(type, () => { touch = null; }));

  const hashIndex = () => ['#projekty', '#case-studies'].includes(location.hash) ? 0 : slides.findIndex(s => '#' + s.id === location.hash);
  const onHash = () => {
    const i = hashIndex();
    if (i >= 0) {
      index = i;
      if (on) { align(); paint(); wheel.reset(); }
    } else if (on) { phase = top() > HEADER ? 'before' : 'after'; wheel.reset(); }
  };
  const disable = () => {
    if (!on) return;
    const keepPlace = phase === 'active';
    on = false; root.classList.remove('has-case-deck','is-case-deck-active'); dots.remove(); controls.remove();
    deck.classList.remove('is-light'); deck.style.removeProperty('--stage-h');
    slides.forEach(s => { s.classList.remove('is-past','is-current','is-next'); s.inert = false; s.removeAttribute('aria-hidden'); s.style.removeProperty('--deck-f'); });
    wheel.reset(); touch = null;
    if (keepPlace) slides[index].scrollIntoView({ block:'start', behavior:'auto' });
  };
  const sync = () => {
    if (!fit.matches || (window.visualViewport && window.visualViewport.scale > 1.05)) { disable(); return; }
    const keepPlace = on ? phase === 'active' : visible();
    if (!on) {
      if (keepPlace) index = slides.reduce((best, s, i) => Math.abs(s.getBoundingClientRect().top - HEADER) < Math.abs(slides[best].getBoundingClientRect().top - HEADER) ? i : best, 0);
      on = true; root.classList.add('has-case-deck'); deck.append(dots, controls);
    }
    if (!measure()) { disable(); return; }
    if (keepPlace) align();
    paint();
  };
  addEventListener('wheel', onWheel, { passive:false });
  addEventListener('keydown', onKey);
  addEventListener('hashchange', onHash);
  const onResize = () => requestAnimationFrame(sync);
  addEventListener('resize', onResize);
  addEventListener('scroll', () => root.classList.toggle('is-case-deck-active', on && pinned()), { passive:true });
  addEventListener('load', () => {
    sync();
    // Reload may restore the old list's scroll position after deferred scripts.
    // Resolve a case deep link once more after that browser restoration.
    requestAnimationFrame(() => {
      if (on && initial >= 0 && index === initial && phase === 'active' && hashIndex() === initial) { align(); paint(); }
    });
  }, { once:true });
  window.visualViewport?.addEventListener('resize', onResize);
  document.fonts?.ready.then(sync);
  fit.addEventListener('change', sync);
  const initial = hashIndex();
  sync();
  if (on && initial >= 0) { index = initial; align(); paint(); }
})();
