(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.video-duo,.conversion-case-media').forEach((rail) => {
    const slides = [...rail.querySelectorAll(':scope > .media-frame')];
    if (slides.length < 2) return;
    const controls = document.createElement('div');
    controls.className = 'mobile-snap-controls';
    controls.innerHTML = '<button type="button" data-snap-prev aria-label="Previous preview"><i aria-hidden="true"></i></button><span><b>1</b> / ' + slides.length + '</span><button type="button" data-snap-next aria-label="Next preview"><i aria-hidden="true"></i></button>';
    rail.after(controls);
    const current = controls.querySelector('b');
    const move = (direction) => {
      const railRect = rail.getBoundingClientRect();
      const index = slides.reduce((best,slide,i) => Math.abs(slide.getBoundingClientRect().left - railRect.left) < Math.abs(slides[best].getBoundingClientRect().left - railRect.left) ? i : best,0);
      const next = Math.max(0,Math.min(slides.length - 1,index + direction));
      slides[next].scrollIntoView({ behavior:reduceMotion.matches ? 'auto' : 'smooth', block:'nearest', inline:'start' });
    };
    controls.querySelector('[data-snap-prev]').addEventListener('click',() => move(-1));
    controls.querySelector('[data-snap-next]').addEventListener('click',() => move(1));
    let railFrame = 0;
    rail.addEventListener('scroll',() => {
      if (railFrame) return;
      railFrame = requestAnimationFrame(() => {
        const railRect = rail.getBoundingClientRect();
        const index = slides.reduce((best,slide,i) => Math.abs(slide.getBoundingClientRect().left - railRect.left) < Math.abs(slides[best].getBoundingClientRect().left - railRect.left) ? i : best,0);
        current.textContent = String(index + 1);
        railFrame = 0;
      });
    }, { passive:true });
  });

  const marquees = document.querySelectorAll('.work-brand-marquee,.logo-marquee,.ticker');
  if ('IntersectionObserver' in window) {
    const marqueeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-marquee-active',entry.isIntersecting && !reduceMotion.matches));
    }, { rootMargin:'120px 0px' });
    marquees.forEach((marquee) => marqueeObserver.observe(marquee));
  } else {
    marquees.forEach((marquee) => marquee.classList.add('is-marquee-active'));
  }
})();
