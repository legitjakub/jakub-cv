const nav = document.querySelector('.nav-wrap');
const reveals = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroName = document.querySelector('.hero-title .title-main > span');
const toTop = document.querySelector('.to-top');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

if (finePointer.matches && !reduceMotion.matches) {
  const pointerGlow = document.createElement('div');
  pointerGlow.className = 'site-pointer-glow';
  pointerGlow.setAttribute('aria-hidden', 'true');
  document.body.append(pointerGlow);

  let pointerFrame = 0;
  let pointerX = -600;
  let pointerY = -600;

  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;

    if (!pointerFrame) {
      pointerFrame = requestAnimationFrame(() => {
        pointerGlow.style.setProperty('--pointer-x', `${pointerX}px`);
        pointerGlow.style.setProperty('--pointer-y', `${pointerY}px`);
        pointerFrame = 0;
      });
    }

    const target = event.target instanceof Element ? event.target : null;
    const cyberContext = target?.closest('#cyber-profile,.cyber-profile,.cyber-track,.education,.certs');
    const commerceContext = document.body.classList.contains('work-page') || target?.closest('#shopify-profile,.shopify-profile,.commerce-track,.references,.experience');
    pointerGlow.dataset.tone = cyberContext ? 'cyber' : commerceContext ? 'commerce' : 'neutral';
    pointerGlow.classList.add('is-visible');
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => pointerGlow.classList.remove('is-visible'));
}

const updateViewportState = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  if (toTop) toTop.classList.toggle('show', window.scrollY > 520);
  document.documentElement.style.setProperty('--scroll-p', progress.toFixed(4));
};

let scrollFrame;
window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    updateViewportState();
    scrollFrame = null;
  });
}, { passive: true });
updateViewportState();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

reveals.forEach((element) => revealObserver.observe(element));

const revealHashTarget = (alignTarget = false) => {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (!target) return;

  target.querySelectorAll('.reveal').forEach((element) => {
    if (element.getBoundingClientRect().top < window.innerHeight * 1.2) {
      element.classList.add('visible');
    }
  });

  if (alignTarget) {
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }
};

window.addEventListener('load', () => revealHashTarget(true), { once: true });
window.addEventListener('hashchange', () => requestAnimationFrame(revealHashTarget));

const heroFinalText = heroName ? heroName.textContent.trim() : '';
let scrambleRunning = false;

const scrambleHeroName = () => {
  if (!heroName || reduceMotion.matches || scrambleRunning) return;
  scrambleRunning = true;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&<>/';
  let frame = 0;
  const totalFrames = 10;

  const run = () => {
    const progress = frame / totalFrames;
    heroName.textContent = heroFinalText
      .split('')
      .map((char, index) => {
        if (char === ' ') return ' ';
        return index / heroFinalText.length < progress
          ? heroFinalText[index]
          : chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');

    frame += 1;
    if (frame <= totalFrames) requestAnimationFrame(run);
    else {
      heroName.textContent = heroFinalText;
      scrambleRunning = false;
    }
  };

  requestAnimationFrame(run);
};

window.addEventListener('load', () => window.setTimeout(scrambleHeroName, 180), { once: true });
if (heroName) heroName.closest('.hero-title').addEventListener('pointerenter', scrambleHeroName);

if (toTop) {
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });
}

const navLinks = Array.from(document.querySelectorAll('.nav-wrap nav a[href^="#"]'));
if (navLinks.length) {
  const linkTargetIds = (link) => (link.dataset.navTargets || link.getAttribute('href').slice(1))
    .split(/\s+/)
    .filter(Boolean);

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('active', linkTargetIds(link).includes(id));
    });
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setActiveLink(entry.target.classList.contains('hero') ? '' : entry.target.id);
    });
  }, { rootMargin: '-38% 0px -55%' });

  const observedTargets = new Set();
  navLinks.forEach((link) => linkTargetIds(link).forEach((id) => {
    const target = document.getElementById(id);
    if (target && !observedTargets.has(target)) {
      observedTargets.add(target);
      spyObserver.observe(target);
    }
  }));

  const hero = document.querySelector('.hero');
  if (hero) spyObserver.observe(hero);
}

const contactLink = document.querySelector('.contact-link');
if (contactLink && contactLink.firstChild?.nodeType === Node.TEXT_NODE) {
  const wrap = document.createElement('span');
  wrap.className = 'cl-wrap';

  Array.from(contactLink.firstChild.textContent).forEach((char, index) => {
    if (char.trim() === '') {
      wrap.append(char);
      return;
    }

    const letter = document.createElement('b');
    letter.className = 'cl';
    letter.style.setProperty('--i', index);
    letter.textContent = char;
    wrap.append(letter);
  });

  contactLink.replaceChild(wrap, contactLink.firstChild);
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();


const setupMobileNavigation = () => {
  const header = document.querySelector('.nav-wrap');
  const menu = header?.querySelector(':scope > nav');
  if (!header || !menu || header.querySelector('.mobile-nav-toggle')) return;
  const isEnglish = document.documentElement.lang === 'en';
  const openLabel = isEnglish ? 'Open navigation' : 'Otevřít navigaci';
  const closeLabel = isEnglish ? 'Close navigation' : 'Zavřít navigaci';

  if (document.body.classList.contains('shopify-conversion-page') || document.body.classList.contains('shopify-inquiry-page')) {
    const brandLink = header.querySelector('.brand');
    if (brandLink) {
      brandLink.href = '/shopify-vyvoj/';
      brandLink.setAttribute('aria-label', 'Shopify vývoj, úvodní stránka');
    }

    if (!menu.querySelector('.mobile-profile-link')) {
      const profileLink = document.createElement('a');
      profileLink.className = 'mobile-nav-only mobile-profile-link';
      profileLink.href = '/cs.html';
      profileLink.textContent = 'Osobní profil';

      const englishLink = document.createElement('a');
      englishLink.className = 'mobile-nav-only';
      englishLink.href = '/work.html';
      englishLink.lang = 'en';
      englishLink.textContent = 'English portfolio';
      menu.append(profileLink, englishLink);
    }
  }

  if (!menu.id) menu.id = 'primary-navigation';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mobile-nav-toggle';
  toggle.setAttribute('aria-controls', menu.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', openLabel);
  toggle.innerHTML = '<span></span><span></span>';

  header.append(toggle);

  const closeMenu = () => {
    header.classList.remove('mobile-menu-open');
    document.body.classList.remove('mobile-nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', openLabel);
  };

  toggle.addEventListener('click', () => {
    const open = !header.classList.contains('mobile-menu-open');
    header.classList.toggle('mobile-menu-open', open);
    document.body.classList.toggle('mobile-nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? closeLabel : openLabel);
  });

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('mobile-menu-open')) {
      closeMenu();
      toggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  }, { passive: true });
};

setupMobileNavigation();
