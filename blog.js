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


const setupGuideMobileNavigation = () => {
  const header = document.querySelector('.guide-header');
  const menu = header?.querySelector('.guide-nav');
  if (!header || !menu || header.querySelector('.guide-menu-toggle')) return;

  const brand = header.querySelector('.guide-brand');
  if (brand) {
    brand.href = '/shopify-vyvoj/';
    brand.setAttribute('aria-label', 'Shopify vývoj, úvodní stránka');
  }

  if (!menu.querySelector('.guide-mobile-only')) {
    const profile = document.createElement('a');
    profile.className = 'guide-mobile-only';
    profile.href = '/cs.html';
    profile.textContent = 'Osobní profil';
    menu.append(profile);
  }

  if (!menu.id) menu.id = 'guide-navigation';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-menu-toggle';
  toggle.setAttribute('aria-controls', menu.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Otevřít navigaci');
  toggle.innerHTML = '<span></span><span></span>';
  const back = header.querySelector('.guide-back');
  header.insertBefore(toggle, back || null);

  const close = () => {
    header.classList.remove('menu-open');
    document.body.classList.remove('guide-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Otevřít navigaci');
  };
  toggle.addEventListener('click', () => {
    const open = !header.classList.contains('menu-open');
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('guide-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Zavřít navigaci' : 'Otevřít navigaci');
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) {
      close();
      toggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1050) close();
  }, { passive:true });
};
setupGuideMobileNavigation();
