const nav = document.querySelector('.nav-wrap');
const glow = document.querySelector('.cursor-glow');
const reveals = document.querySelectorAll('.reveal');
const counters = document.querySelectorAll('[data-count]');
const carouselQuery = '.testimonial-grid, .path-cards, .certs-grid';
const carouselContainers = document.querySelectorAll(carouselQuery);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroName = document.querySelector('.hero-title .title-main > span');
const portraitWrap = document.querySelector('.portrait-wrap');
const portraitImage = document.querySelector('.portrait-frame img');
const contactSection = document.querySelector('.contact');

window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
window.addEventListener('pointermove', (event) => {
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  const batch = entries.filter((entry) => entry.isIntersecting);
  batch.forEach((entry, index) => {
    const delay = Math.min(index * 90, 450);
    if (delay > 0 && !reduceMotion.matches) {
      entry.target.style.transitionDelay = `${delay}ms`;
      window.setTimeout(() => { entry.target.style.transitionDelay = ''; }, 1000 + delay);
    }
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.14 });
reveals.forEach((element) => observer.observe(element));

const revealHashTarget = () => {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (!target) return;

  target.querySelectorAll('.reveal').forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.15) element.classList.add('visible');
  });
};

window.addEventListener('load', revealHashTarget);
window.addEventListener('hashchange', () => window.requestAnimationFrame(revealHashTarget));

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count);
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / 900, 1);
      element.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(element);
  });
}, { threshold: 0.8 });
counters.forEach((counter) => counterObserver.observe(counter));

const heroFinalText = heroName ? heroName.textContent.trim() : '';
let scrambleRunning = false;

const scrambleHeroName = () => {
  if (!heroName || reduceMotion.matches || scrambleRunning) return;
  scrambleRunning = true;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&<>/';
  let frame = 0;
  const totalFrames = 30;

  const run = () => {
    const progress = frame / totalFrames;
    heroName.textContent = heroFinalText
      .split('')
      .map((char, index) => {
        if (char === ' ') return ' ';
        if (index / heroFinalText.length < progress) return heroFinalText[index];
        return chars[Math.floor(Math.random() * chars.length)];
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

window.addEventListener('load', () => window.setTimeout(scrambleHeroName, 620), { once: true });
if (heroName) heroName.closest('.hero-title').addEventListener('pointerenter', scrambleHeroName);

document.querySelectorAll('.magnetic').forEach((element) => {
  element.addEventListener('pointermove', (event) => {
    const rect = element.getBoundingClientRect();
    element.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * 0.12}px, ${(event.clientY - rect.top - rect.height / 2) * 0.16}px)`;
  });
  element.addEventListener('pointerleave', () => { element.style.transform = ''; });
});

const tilt = document.querySelector('[data-tilt]');
tilt.addEventListener('pointermove', (event) => {
  const rect = tilt.getBoundingClientRect();
  const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -4;
  const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 4;
  tilt.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
});
tilt.addEventListener('pointerleave', () => { tilt.style.transform = ''; });

const updatePortraitParallax = () => {
  if (!portraitWrap || !portraitImage || reduceMotion.matches || window.matchMedia('(max-width: 760px)').matches) return;
  const rect = portraitWrap.getBoundingClientRect();
  const viewportCenter = window.innerHeight / 2;
  const elementCenter = rect.top + rect.height / 2;
  const shift = Math.max(Math.min((viewportCenter - elementCenter) * 0.045, 18), -18);
  portraitImage.style.setProperty('--portrait-shift', `${shift}px`);
};

let portraitTicking = false;
const requestPortraitParallax = () => {
  if (portraitTicking) return;
  portraitTicking = true;
  requestAnimationFrame(() => {
    updatePortraitParallax();
    portraitTicking = false;
  });
};

updatePortraitParallax();
window.addEventListener('scroll', requestPortraitParallax, { passive: true });
window.addEventListener('resize', requestPortraitParallax, { passive: true });

if (contactSection) {
  contactSection.addEventListener('pointermove', (event) => {
    const rect = contactSection.getBoundingClientRect();
    contactSection.classList.add('is-lit');
    contactSection.style.setProperty('--contact-x', `${event.clientX - rect.left}px`);
    contactSection.style.setProperty('--contact-y', `${event.clientY - rect.top}px`);
  }, { passive: true });

  contactSection.addEventListener('pointerleave', () => {
    contactSection.classList.remove('is-lit');
  });
}

document.querySelectorAll('[data-spotlight]').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  });
});

const getCarouselItems = (carousel) => Array.from(carousel.children).filter((child) => child instanceof HTMLElement);

const getCarouselTargetLeft = (carousel, item) => {
  const paddingLeft = Number.parseFloat(window.getComputedStyle(carousel).paddingLeft) || 0;
  const maxScroll = carousel.scrollWidth - carousel.clientWidth;
  return Math.min(Math.max(item.offsetLeft - paddingLeft, 0), maxScroll);
};

const isCarouselInView = (carousel) => {
  const rect = carousel.getBoundingClientRect();
  return rect.bottom > window.innerHeight * 0.18 && rect.top < window.innerHeight * 0.82;
};

const setActiveCarouselItem = (carousel) => {
  const items = getCarouselItems(carousel);
  if (!items.length) return;
  const center = carousel.scrollLeft + carousel.clientWidth / 2;
  let active = items[0];
  let distance = Infinity;

  items.forEach((item) => {
    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    const nextDistance = Math.abs(center - itemCenter);
    if (nextDistance < distance) {
      distance = nextDistance;
      active = item;
    }
  });

  items.forEach((item) => item.classList.toggle('auto-slide-active', item === active));
};

const startMobileCarousels = () => {
  if (reduceMotion.matches) return;
  const canAutoplay = window.matchMedia('(max-width: 1050px)').matches;

  carouselContainers.forEach((carousel) => {
    const items = getCarouselItems(carousel);
    const isScrollable = carousel.scrollWidth > carousel.clientWidth + 8;
    const shouldRun = canAutoplay && isScrollable && items.length > 1;

    carousel.classList.toggle('is-auto-carousel', shouldRun);
    setActiveCarouselItem(carousel);

    if (!shouldRun || carousel.dataset.carouselReady === 'true') return;

    carousel.dataset.carouselReady = 'true';
    let timer;
    let paused = false;

    const nextSlide = () => {
      if (paused || document.hidden || reduceMotion.matches) return;
      if (!window.matchMedia('(max-width: 1050px)').matches || carousel.scrollWidth <= carousel.clientWidth + 8) return;
      if (!isCarouselInView(carousel)) return;
      const currentIndex = items.findIndex((item) => item.classList.contains('auto-slide-active'));
      const nextIndex = currentIndex >= 0 && currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      const nextLeft = getCarouselTargetLeft(carousel, items[nextIndex]);

      carousel.scrollTo({ left: nextLeft, behavior: 'smooth' });
      items.forEach((item, index) => item.classList.toggle('auto-slide-active', index === nextIndex));
    };

    const schedule = () => {
      window.clearInterval(timer);
      timer = window.setInterval(nextSlide, 2200);
    };

    const pauseBriefly = () => {
      paused = true;
      window.clearInterval(timer);
      window.setTimeout(() => {
        paused = false;
        schedule();
      }, 3800);
    };

    carousel.addEventListener('scroll', () => window.requestAnimationFrame(() => setActiveCarouselItem(carousel)), { passive: true });
    carousel.addEventListener('pointerdown', pauseBriefly, { passive: true });
    carousel.addEventListener('touchstart', pauseBriefly, { passive: true });
    carousel.addEventListener('focusin', () => { paused = true; window.clearInterval(timer); });
    carousel.addEventListener('focusout', () => { paused = false; schedule(); });
    carousel.addEventListener('mouseenter', () => { paused = true; window.clearInterval(timer); });
    carousel.addEventListener('mouseleave', () => { paused = false; schedule(); });

    schedule();
  });
};

startMobileCarousels();
window.addEventListener('resize', startMobileCarousels, { passive: true });

document.getElementById('year').textContent = new Date().getFullYear();

/* ── Scroll progress + back-to-top ─────────────────────────────── */
const toTop = document.querySelector('.to-top');
let progressTicking = false;

const updateScrollProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  document.documentElement.style.setProperty('--scroll-p', progress.toFixed(4));
  if (toTop) toTop.classList.toggle('show', window.scrollY > 520);
};

window.addEventListener('scroll', () => {
  if (progressTicking) return;
  progressTicking = true;
  requestAnimationFrame(() => {
    updateScrollProgress();
    progressTicking = false;
  });
}, { passive: true });
updateScrollProgress();

if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' }));

/* ── Scroll-spy: highlight active nav link ─────────────────────── */
const navLinks = Array.from(document.querySelectorAll('.nav-wrap nav a[href^="#"]'));

if (navLinks.length) {
  const setActiveLink = (id) => {
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setActiveLink(entry.target.classList.contains('hero') ? '' : entry.target.id);
    });
  }, { rootMargin: '-38% 0px -55%' });

  navLinks.forEach((link) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) spyObserver.observe(target);
  });
  const hero = document.querySelector('.hero');
  if (hero) spyObserver.observe(hero);
}

/* ── Ticker: skew with scroll velocity ─────────────────────────── */
const ticker = document.querySelector('.ticker');

if (ticker && !reduceMotion.matches) {
  let lastScrollY = window.scrollY;
  let skewResetTimer;

  window.addEventListener('scroll', () => {
    const velocity = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    const skew = Math.max(-6, Math.min(6, velocity * 0.16));
    ticker.style.transform = `skewX(${skew.toFixed(2)}deg)`;
    window.clearTimeout(skewResetTimer);
    skewResetTimer = window.setTimeout(() => { ticker.style.transform = 'skewX(0deg)'; }, 140);
  }, { passive: true });
}

/* ── Custom cursor: dot + trailing ring ────────────────────────── */
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

if (cursorDot && cursorRing && finePointer.matches && !reduceMotion.matches) {
  let targetX = -100;
  let targetY = -100;
  let ringX = -100;
  let ringY = -100;
  let cursorRaf = null;

  const followRing = () => {
    ringX += (targetX - ringX) * 0.16;
    ringY += (targetY - ringY) * 0.16;
    cursorRing.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`;
    if (Math.abs(targetX - ringX) + Math.abs(targetY - ringY) > 0.3) cursorRaf = requestAnimationFrame(followRing);
    else cursorRaf = null;
  };

  window.addEventListener('pointermove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    cursorDot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
    document.body.classList.add('has-cursor');
    if (cursorRaf === null) cursorRaf = requestAnimationFrame(followRing);
  }, { passive: true });

  document.addEventListener('pointerover', (event) => {
    document.body.classList.toggle('cursor-hover', Boolean(event.target.closest('a, button, summary, [data-spotlight]')));
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => document.body.classList.remove('has-cursor'));
}

/* ── Contact link: split letters for hover wave ────────────────── */
const contactLink = document.querySelector('.contact-link');

if (contactLink && contactLink.firstChild && contactLink.firstChild.nodeType === Node.TEXT_NODE) {
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

/* ── Scroll-driven effects: pins, mask reveal, parallax ─────────── */
const clamp01 = (value) => Math.max(0, Math.min(1, value));
const heroSection = document.querySelector('.hero');
const journeyPin = document.querySelector('.journey-pin');
const journeyStage = journeyPin ? journeyPin.querySelector('.journey-stage') : null;
const journeyTrack = journeyPin ? journeyPin.querySelector('.timeline') : null;
const contactPin = document.querySelector('.contact-pin');
const contactStage = contactPin ? contactPin.querySelector('.contact-stage') : null;
const watermarkSections = [document.querySelector('.experience'), document.querySelector('.project-reviews')].filter(Boolean);

const setupJourneyPin = () => {
  if (!journeyPin || !journeyStage || !journeyTrack) return;
  const active = window.matchMedia('(min-width: 1051px)').matches && !reduceMotion.matches;
  journeyPin.classList.toggle('journey-active', active);
  if (!active) {
    journeyPin.style.height = '';
    journeyPin.style.removeProperty('--j-travel');
    return;
  }
  const travel = Math.max(journeyTrack.scrollWidth - journeyStage.clientWidth, 0);
  journeyPin.style.setProperty('--j-travel', `${travel}px`);
  journeyPin.style.height = `calc(100vh + ${Math.round(travel * 1.1)}px)`;
};

const setupContactPin = () => {
  if (!contactPin) return;
  const active = window.matchMedia('(min-width: 761px)').matches && !reduceMotion.matches;
  contactPin.classList.toggle('contact-pin-active', active);
  if (!active) {
    contactPin.style.height = '';
    return;
  }
  contactPin.style.height = '240vh';
};

const updateScrollEffects = () => {
  if (reduceMotion.matches) return;

  if (heroSection && window.matchMedia('(min-width: 761px)').matches) {
    heroSection.style.setProperty('--hx', clamp01(window.scrollY / (heroSection.offsetHeight * 0.85)).toFixed(3));
  }

  watermarkSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const progress = clamp01((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
    section.style.setProperty('--wm', `${((progress - 0.5) * 140).toFixed(1)}px`);
  });

  if (journeyPin && journeyPin.classList.contains('journey-active')) {
    const total = journeyPin.offsetHeight - window.innerHeight;
    if (total > 0) {
      journeyPin.style.setProperty('--jp', clamp01(-journeyPin.getBoundingClientRect().top / total).toFixed(4));
    }
  }

  if (contactPin && contactStage && contactPin.classList.contains('contact-pin-active')) {
    const total = contactPin.offsetHeight - window.innerHeight;
    if (total > 0) {
      const progress = clamp01(-contactPin.getBoundingClientRect().top / total);
      contactPin.style.setProperty('--cp', progress.toFixed(4));
      contactStage.dataset.phase = String(Math.min(3, Math.floor(progress * 4)));
    }
  }
};

let effectsTicking = false;
const requestScrollEffects = () => {
  if (effectsTicking) return;
  effectsTicking = true;
  requestAnimationFrame(() => {
    updateScrollEffects();
    effectsTicking = false;
  });
};

setupJourneyPin();
setupContactPin();
updateScrollEffects();
window.addEventListener('scroll', requestScrollEffects, { passive: true });
window.addEventListener('resize', () => {
  setupJourneyPin();
  setupContactPin();
  requestScrollEffects();
}, { passive: true });
window.addEventListener('load', () => {
  setupJourneyPin();
  requestScrollEffects();
}, { once: true });

/* ── Hero: interactive particle constellation ──────────────────── */
const heroCanvas = document.querySelector('.hero-canvas');

if (heroCanvas && !reduceMotion.matches) {
  const hero = heroCanvas.closest('.hero');
  const context = heroCanvas.getContext('2d');
  const colors = [[99, 216, 255], [183, 255, 60]];
  const pointer = { x: -9999, y: -9999 };
  let width = 0;
  let height = 0;
  let particles = [];
  let particleRaf = null;
  let heroVisible = true;

  const buildParticles = () => {
    if (!window.matchMedia('(min-width: 761px)').matches) {
      particles = [];
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.clientWidth;
    height = hero.clientHeight;
    heroCanvas.width = width * dpr;
    heroCanvas.height = height * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(Math.round((width * height) / 26000), 72);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      radius: Math.random() * 1.5 + 0.7,
      color: colors[Math.random() < 0.5 ? 0 : 1],
    }));
  };

  const drawFrame = () => {
    particleRaf = null;
    if (!heroVisible || document.hidden || !particles.length) return;
    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq < 24000 && distanceSq > 0.01) {
        const distance = Math.sqrt(distanceSq);
        particle.vx += (dx / distance) * 0.045;
        particle.vy += (dy / distance) * 0.045;
      }
      particle.vx = Math.max(-0.65, Math.min(0.65, particle.vx * 0.995));
      particle.vy = Math.max(-0.65, Math.min(0.65, particle.vy * 0.995));
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;

      const [r, g, b] = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${r},${g},${b},.5)`;
      context.fill();
    });

    const linkDistance = 130;
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distanceSq = dx * dx + dy * dy;
        if (distanceSq > linkDistance * linkDistance) continue;
        const alpha = (1 - Math.sqrt(distanceSq) / linkDistance) * 0.16;
        const [r, g, bl] = a.color;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.strokeStyle = `rgba(${r},${g},${bl},${alpha.toFixed(3)})`;
        context.lineWidth = 1;
        context.stroke();
      }
    }

    particleRaf = requestAnimationFrame(drawFrame);
  };

  const startParticles = () => {
    if (particleRaf === null) particleRaf = requestAnimationFrame(drawFrame);
  };

  const heroObserver = new IntersectionObserver((entries) => {
    heroVisible = entries[0].isIntersecting;
    if (heroVisible) startParticles();
  });
  heroObserver.observe(hero);

  document.addEventListener('visibilitychange', () => { if (!document.hidden) startParticles(); });

  hero.addEventListener('pointermove', (event) => {
    const rect = heroCanvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      buildParticles();
      startParticles();
    }, 180);
  }, { passive: true });

  buildParticles();
  startParticles();
}
