const guideFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const guideReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const trackGuideAction = (label, destination) => {
  const payload = { event: 'cta_click', label, destination };
  if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent('shopify:track', { detail: payload }));
};

document.querySelectorAll('[data-track]').forEach((element) => {
  element.addEventListener('click', () => trackGuideAction(
    element.dataset.track,
    element.getAttribute('href') || ''
  ));
});

const guideSearch = document.querySelector('#guide-search-input');
if (guideSearch) {
  const guideRows = [...document.querySelectorAll('.guide-row')];
  const guideCount = document.querySelector('[data-guide-count]');
  const guideEmpty = document.querySelector('.guide-empty');
  const guideClear = guideSearch.parentElement.querySelector('button');
  const normalizeGuideText = (value) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('cs');

  const filterGuideRows = () => {
    const query = normalizeGuideText(guideSearch.value.trim());
    let visible = 0;

    guideRows.forEach((row) => {
      const searchableText = `${row.textContent} ${row.dataset.search || ''}`;
      const matches = !query || normalizeGuideText(searchableText).includes(query);
      row.hidden = !matches;
      if (matches) visible += 1;
    });

    guideClear.hidden = !guideSearch.value;
    guideEmpty.hidden = visible !== 0;
    guideCount.textContent = `${visible} ${visible === 1 ? 'článek' : visible > 1 && visible < 5 ? 'články' : 'článků'}`;
  };

  guideSearch.addEventListener('input', filterGuideRows);
  guideClear.addEventListener('click', () => {
    guideSearch.value = '';
    filterGuideRows();
    guideSearch.focus();
  });
}

if (guideFinePointer.matches && !guideReducedMotion.matches) {
  const glow = document.createElement('div');
  glow.className = 'guide-pointer-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.append(glow);

  let frame = 0;
  let pointerX = -600;
  let pointerY = -600;

  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;

    if (!frame) {
      frame = requestAnimationFrame(() => {
        glow.style.setProperty('--pointer-x', `${pointerX}px`);
        glow.style.setProperty('--pointer-y', `${pointerY}px`);
        frame = 0;
      });
    }

    glow.classList.add('is-visible');
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => glow.classList.remove('is-visible'));
}
