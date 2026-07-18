const guideFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const guideReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
