const nav = document.querySelector('.nav-wrap');
const glow = document.querySelector('.cursor-glow');
const reveals = document.querySelectorAll('.reveal');
const counters = document.querySelectorAll('[data-count]');
const carouselQuery = '.testimonial-grid, .path-cards, .edu-list, .certs-grid';
const carouselContainers = document.querySelectorAll(carouselQuery);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
window.addEventListener('pointermove', (event) => {
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
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
