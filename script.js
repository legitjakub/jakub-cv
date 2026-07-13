const nav = document.querySelector('.nav-wrap');
const reveals = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroName = document.querySelector('.hero-title .title-main > span');
const toTop = document.querySelector('.to-top');

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

const revealHashTarget = () => {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (!target) return;

  target.querySelectorAll('.reveal').forEach((element) => {
    if (element.getBoundingClientRect().top < window.innerHeight * 1.2) {
      element.classList.add('visible');
    }
  });
};

window.addEventListener('load', revealHashTarget, { once: true });
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
  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
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
