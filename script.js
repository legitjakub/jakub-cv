const nav = document.querySelector('.nav-wrap');
const glow = document.querySelector('.cursor-glow');
const reveals = document.querySelectorAll('.reveal');
const counters = document.querySelectorAll('[data-count]');

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

document.getElementById('year').textContent = new Date().getFullYear();
