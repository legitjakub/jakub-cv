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
  const isEnglishGuide = document.documentElement.lang === 'en';
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
    guideCount.textContent = isEnglishGuide
      ? `${visible} ${visible === 1 ? 'article' : 'articles'}`
      : `${visible} ${visible === 1 ? 'článek' : visible > 1 && visible < 5 ? 'články' : 'článků'}`;
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
  if (!header || !menu) return;

  const isEnglishPage = document.documentElement.lang === 'en';
  const openMenuLabel = isEnglishPage ? 'Open navigation' : 'Otevřít navigaci';
  const closeMenuLabel = isEnglishPage ? 'Close navigation' : 'Zavřít navigaci';
  const closedText = 'Menu';
  const openText = isEnglishPage ? 'Close' : 'Zavřít';

  const brand = header.querySelector('.guide-brand');
  if (brand) {
    brand.href = isEnglishPage ? '/en/' : '/';
    brand.setAttribute('aria-label', isEnglishPage ? 'Shopify work, home' : 'Shopify vývoj, úvodní stránka');
  }


  menu.dataset.mobileLabel = isEnglishPage ? 'Navigation' : 'Navigace';

  const mobileFooter = menu.querySelector('.guide-mobile-footer') || document.createElement('div');
  mobileFooter.className = 'guide-mobile-footer guide-mobile-only';

  const language = menu.querySelector('.guide-language-link');
  if (language) {
    const languageClone = language.cloneNode(true);
    languageClone.classList.add('guide-mobile-language');
    mobileFooter.append(languageClone);
  }

  const back = header.querySelector('.guide-back');
  if (back) {
    const backClone = back.cloneNode(true);
    backClone.classList.add('guide-mobile-action');
    mobileFooter.append(backClone);
  }

  if (mobileFooter.childElementCount && !mobileFooter.isConnected) menu.append(mobileFooter);

  if (!menu.id) menu.id = 'guide-navigation';
  const toggle = header.querySelector('.guide-menu-toggle');
  if (!toggle) return;
  toggle.setAttribute('aria-controls', menu.id);
  toggle.setAttribute('aria-label', openMenuLabel);
  const toggleText = toggle.querySelector('.guide-menu-label');

  const close = () => {
    header.classList.remove('menu-open');
    document.body.classList.remove('guide-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', openMenuLabel);
    if (toggleText) toggleText.textContent = closedText;
  };
  toggle.addEventListener('click', () => {
    const open = !header.classList.contains('menu-open');
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('guide-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? closeMenuLabel : openMenuLabel);
    if (toggleText) toggleText.textContent = open ? openText : closedText;
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) {
      close();
      toggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) close();
  }, { passive:true });
};
setupGuideMobileNavigation();

document.querySelectorAll('.article-table').forEach((table) => {
  const labels = [...table.querySelectorAll('thead th')].map((cell) => cell.textContent.trim());
  table.querySelectorAll('tbody tr').forEach((row) => {
    [...row.cells].forEach((cell,index) => cell.dataset.label = labels[index] || '');
  });
  table.classList.add('is-mobile-ready');
});

document.querySelectorAll('.article-toc').forEach((toc,index) => {
  const list = toc.querySelector('ol');
  if (!list) return;
  const isEnglishPage = document.documentElement.lang === 'en';
  const toggle = document.createElement('button');
  const listId = `article-toc-list-${index + 1}`;
  list.id = listId;
  toggle.type = 'button';
  toggle.className = 'article-toc-toggle';
  toggle.setAttribute('aria-controls',listId);
  toggle.setAttribute('aria-expanded','false');
  toggle.innerHTML = `<span>${isEnglishPage ? 'Show sections' : 'Zobrazit kapitoly'}</span><i aria-hidden="true"></i>`;
  toc.insertBefore(toggle,list);
  const label = toggle.querySelector('span');
  const close = () => {
    toc.classList.remove('is-open');
    toggle.setAttribute('aria-expanded','false');
    label.textContent = isEnglishPage ? 'Show sections' : 'Zobrazit kapitoly';
  };
  toggle.addEventListener('click',() => {
    const open = !toc.classList.contains('is-open');
    toc.classList.toggle('is-open',open);
    toggle.setAttribute('aria-expanded',String(open));
    label.textContent = open ? (isEnglishPage ? 'Hide sections' : 'Skrýt kapitoly') : (isEnglishPage ? 'Show sections' : 'Zobrazit kapitoly');
  });
  list.querySelectorAll('a').forEach((link) => link.addEventListener('click',close));
});

// Hub: a cover of the article follows the pointer over its row (desktop with a mouse only).
(() => {
  const rows = document.querySelectorAll('.guide-row[href]');
  const fine = window.matchMedia('(min-width:1024px) and (hover:hover) and (pointer:fine)');
  if (!rows.length || !fine.matches || window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const lang = document.documentElement.lang === 'en' ? 'en' : 'cs';
  const peek = document.createElement('div');
  peek.className = 'row-peek';
  peek.setAttribute('aria-hidden','true');
  peek.innerHTML = '<img alt="" width="720" height="378" />';
  document.body.append(peek);
  const img = peek.querySelector('img');
  let x = 0, y = 0, frame = 0;
  const place = () => {
    frame = 0;
    const px = x + 328 > innerWidth ? x - 328 : x + 28;
    const py = Math.min(Math.max(y - 95, 12), innerHeight - 180);
    peek.style.transform = `translate3d(${px}px,${py}px,0)`;
  };
  rows.forEach((row) => {
    const slug = row.getAttribute('href').replace(/^\.?\/?|\/$/g,'').split('/').pop();
    const src = `/assets/covers/${lang}-${slug}-720.webp`;
    row.addEventListener('pointerenter',() => { if (img.getAttribute('src') !== src) img.src = src; peek.classList.add('is-on'); });
    row.addEventListener('pointerleave',() => peek.classList.remove('is-on'));
    row.addEventListener('pointermove',(e) => { x = e.clientX; y = e.clientY; if (!frame) frame = requestAnimationFrame(place); });
  });
  window.addEventListener('scroll',() => peek.classList.remove('is-on'),{ passive:true });
})();
