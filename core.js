(() => {
  const header = document.querySelector('.nav-wrap');
  const toTop = document.querySelector('.to-top');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  if (finePointer.matches && !reduceMotion.matches) {
    const glow = document.createElement('div');
    glow.className = 'site-pointer-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.append(glow);
    let frame = 0;
    window.addEventListener('pointermove', (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        glow.style.setProperty('--pointer-x', `${event.clientX}px`);
        glow.style.setProperty('--pointer-y', `${event.clientY}px`);
        glow.classList.add('is-visible');
        frame = 0;
      });
    }, { passive:true });
    document.documentElement.addEventListener('pointerleave', () => glow.classList.remove('is-visible'));
  }

  let maxScroll = 0;
  let scrollFrame = 0;
  const measure = () => { maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight); };
  const paint = () => {
    const progress = maxScroll ? Math.min(1, window.scrollY / maxScroll) : 0;
    header?.classList.toggle('scrolled', window.scrollY > 40);
    toTop?.classList.toggle('show', window.scrollY > 520);
    document.documentElement.style.setProperty('--scroll-p', progress.toFixed(4));
    scrollFrame = 0;
  };
  const refresh = () => { measure(); paint(); };
  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(paint);
  }, { passive:true });
  window.addEventListener('resize', refresh, { passive:true });
  window.addEventListener('load', refresh, { once:true });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.documentElement);
  refresh();

  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    reveals.forEach((item) => item.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold:.06, rootMargin:'0px 0px -6% 0px' });
    reveals.forEach((item) => observer.observe(item));
  }

  const revealHashTarget = () => {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    target.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible'));
  };
  window.addEventListener('load', revealHashTarget, { once:true });
  window.addEventListener('hashchange', revealHashTarget);

  toTop?.addEventListener('click', () => window.scrollTo({ top:0, behavior:reduceMotion.matches ? 'auto' : 'smooth' }));
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const menu = header?.querySelector(':scope > nav');
  const toggle = header?.querySelector('.mobile-nav-toggle');
  if (header && menu && toggle) {
    const isEnglish = document.documentElement.lang === 'en';
    const openLabel = isEnglish ? 'Open navigation' : 'Otevřít navigaci';
    const closeLabel = isEnglish ? 'Close navigation' : 'Zavřít navigaci';
    if (!menu.id) menu.id = 'primary-navigation';
    toggle.setAttribute('aria-controls', menu.id);

    if (!menu.querySelector('.mobile-profile-link')) {
      const profile = document.createElement('a');
      profile.className = 'mobile-nav-only mobile-profile-link';
      profile.href = isEnglish ? '/index.html' : '/cs.html';
      profile.textContent = isEnglish ? 'Personal profile' : 'Osobní profil';
      menu.append(profile);
    }
    if (!menu.querySelector(`a[lang="${isEnglish ? 'cs' : 'en'}"]`)) {
      const language = document.createElement('a');
      language.className = 'mobile-nav-only';
      language.href = isEnglish ? '/shopify-vyvoj/' : '/work.html';
      language.lang = isEnglish ? 'cs' : 'en';
      language.textContent = isEnglish ? 'Česká verze' : 'English version';
      menu.append(language);
    }

    const close = () => {
      header.classList.remove('mobile-menu-open');
      document.body.classList.remove('mobile-nav-open');
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label',openLabel);
    };
    toggle.addEventListener('click', () => {
      const open = !header.classList.contains('mobile-menu-open');
      header.classList.toggle('mobile-menu-open',open);
      document.body.classList.toggle('mobile-nav-open',open);
      toggle.setAttribute('aria-expanded',String(open));
      toggle.setAttribute('aria-label',open ? closeLabel : openLabel);
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click',close));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && header.classList.contains('mobile-menu-open')) { close(); toggle.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1050) close(); }, { passive:true });
  }

  const navLinks = [...document.querySelectorAll('.nav-wrap nav a[href^="#"]')];
  if (navLinks.length && 'IntersectionObserver' in window) {
    const targets = new Map();
    navLinks.forEach((link) => {
      (link.dataset.navTargets || link.hash.slice(1)).split(/\s+/).forEach((id) => {
        const target = document.getElementById(id);
        if (target) targets.set(target,id);
      });
    });
    const spy = new IntersectionObserver((entries) => {
      const current = entries.find((entry) => entry.isIntersecting);
      if (!current) return;
      const id = targets.get(current.target);
      navLinks.forEach((link) => link.classList.toggle('active',(link.dataset.navTargets || link.hash.slice(1)).split(/\s+/).includes(id)));
    }, { rootMargin:'-32% 0px -60%' });
    targets.forEach((_,target) => spy.observe(target));
  }
})();
