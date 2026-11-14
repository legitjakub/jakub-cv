/* Native page scrolling drives the project stack. No gesture is cancelled. */
(() => {
  const deck = document.querySelector('.case-deck');
  if (!deck) return;
  const slides = Array.from(deck.querySelectorAll(':scope > .project-showcase'));
  if (slides.length < 2) return;
  const root = document.documentElement;
  const english = root.lang === 'en';
  const HEADER = 68;
  const last = slides.length - 1;
  const fit = window.matchMedia('(min-width:320px) and (min-height:600px) and (prefers-reduced-motion:no-preference)');
  let enabled = false;
  let index = 0;
  let stepSize = 360;
  let framePending = false;

  const stage = document.createElement('div');
  stage.className = 'case-deck-stage';
  const dots = document.createElement('nav');
  dots.className = 'deck-dots';
  dots.setAttribute('aria-label', english ? 'Choose a case study' : 'Vybrat případovou studii');
  const names = slides.map(slide => {
    const name = slide.querySelector('h2 span, h2 img[alt]:not([alt=""])');
    return ((name && (name.textContent || name.alt)) || slide.id).trim();
  });
  const start = () => deck.getBoundingClientRect().top + scrollY - HEADER;
  function navigate(project) {
    const target = project < 0 ? start() - (innerHeight - HEADER) :
      project > last ? start() + last * stepSize + (innerHeight - HEADER) :
      start() + project * stepSize;
    scrollTo({ top:Math.max(0, target), behavior:'smooth' });
  }
  slides.forEach((slide, position) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(position + 1).padStart(2, '0');
    button.setAttribute('aria-label', names[position]);
    button.addEventListener('click', () => navigate(position));
    dots.append(button);
  });
  const controls = document.createElement('nav');
  controls.className = 'deck-controls';
  controls.setAttribute('aria-label', english ? 'Browse projects' : 'Procházení projektů');
  const status = document.createElement('output');
  status.className = 'deck-status';
  status.setAttribute('aria-live', 'polite');
  const hint = document.createElement('span');
  hint.className = 'deck-hint';
  hint.textContent = english ? 'Scroll to explore' : 'Pokračujte posunutím';
  const previous = document.createElement('button');
  previous.type = 'button';
  previous.textContent = '↑';
  previous.addEventListener('click', () => navigate(index - 1));
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = '↓';
  next.addEventListener('click', () => navigate(index + 1));
  controls.append(status, hint, previous, next);

  function paint(selected) {
    const focusMoved = selected !== index && slides[index].contains(document.activeElement);
    index = selected;
    slides.forEach((slide, position) => {
      slide.classList.toggle('is-past', position < index);
      slide.classList.toggle('is-current', position === index);
      slide.classList.toggle('is-next', position > index);
      slide.inert = position !== index;
      slide.setAttribute('aria-hidden', String(position !== index));
      if (position !== index) slide.querySelectorAll('video').forEach(video => video.pause());
    });
    const bounds = stage.getBoundingClientRect();
    if (!document.hidden && bounds.top < innerHeight && bounds.bottom > HEADER) {
      slides[index].querySelectorAll('video').forEach(video => {
        if (!video.closest('[hidden]') && video.dataset.userPaused !== '1') video.play().catch(() => {});
      });
    }
    Array.from(dots.children).forEach((button, position) => button.toggleAttribute('aria-current', position === index));
    stage.classList.toggle('is-light', slides[index].classList.contains('case-molecules-new') || slides[index].classList.contains('case-molecules'));
    status.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    status.setAttribute('aria-label', (index + 1) + ' / ' + slides.length + ': ' + names[index]);
    previous.setAttribute('aria-label', index ? (english ? 'Previous project' : 'Předchozí projekt') : (english ? 'Previous section' : 'Předchozí část stránky'));
    next.setAttribute('aria-label', index < last ? (english ? 'Next project' : 'Další projekt') : (english ? 'Continue down the page' : 'Pokračovat dál na stránce'));
    if (focusMoved) {
      const heading = slides[index].querySelector('h2');
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll:true });
    }
  }
  slides.forEach((slide, position) => slide.querySelectorAll('video').forEach(video => {
    video.addEventListener('play', () => { if (enabled && position !== index) video.pause(); });
  }));
  function update() {
    if (!enabled) return;
    const progress = scrollY - start();
    const selected = Math.max(0, Math.min(last, Math.round(progress / stepSize)));
    if (selected !== index) paint(selected);
    root.classList.toggle('is-case-deck-active', progress >= -8 && progress <= last * stepSize + 8);
  }
  const measure = () => {
    const available = innerHeight - HEADER;
    deck.style.setProperty('--stage-h', `${available}px`);
    stepSize = Math.min(360, available * 0.45);
    deck.style.setProperty('--track-h', `${available + last * stepSize}px`);
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
  function disable() {
    if (!enabled) return;
    enabled = false;
    slides.forEach(slide => {
      deck.append(slide);
      slide.inert = false;
      slide.removeAttribute('aria-hidden');
      slide.classList.remove('is-current', 'is-past', 'is-next');
      slide.style.removeProperty('--deck-f');
    });
    stage.remove();
    dots.remove();
    controls.remove();
    root.classList.remove('has-case-deck', 'is-case-deck-active');
    deck.style.removeProperty('--stage-h');
    deck.style.removeProperty('--track-h');
  }
  function sync() {
    if (!fit.matches || (window.visualViewport && window.visualViewport.scale > 1.05)) {
      disable();
      return;
    }
    if (!enabled) {
      enabled = true;
      root.classList.add('has-case-deck');
      slides.forEach(slide => stage.append(slide));
      stage.append(dots, controls);
      deck.append(stage);
    }
    if (!measure()) {
      disable();
      return;
    }
    paint(index);
    update();
  }
  function onHash() {
    const selected = ['#projekty', '#case-studies'].includes(location.hash) ? 0 :
      slides.findIndex(slide => '#' + slide.id === location.hash);
    if (enabled && selected >= 0) scrollTo({ top:start() + selected * stepSize, behavior:'auto' });
    update();
  }
  addEventListener('scroll', () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(() => { framePending = false; update(); });
  }, { passive:true });
  addEventListener('hashchange', onHash);
  addEventListener('resize', sync);
  window.visualViewport?.addEventListener('resize', sync);
  fit.addEventListener('change', sync);
  document.fonts?.ready.then(sync);
  addEventListener('load', sync, { once:true });
  sync();
  onHash();
})();
