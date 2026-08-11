(() => {
  const frames = [...document.querySelectorAll('[data-media-player]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  const saveData = Boolean(navigator.connection?.saveData);
  const manualOnly = reduceMotion.matches || coarsePointer.matches || saveData || window.innerWidth <= 760;
  let activeVideo = null;

  const attachVideo = (frame, shouldPlay = false) => {
    const video = frame.querySelector('video[data-video-src]');
    if (!video) return null;
    if (!video.src) {
      video.src = video.dataset.videoSrc;
      video.controls = true;
      video.load();
      frame.dataset.loaded = 'true';
    }
    if (shouldPlay) {
      if (activeVideo && activeVideo !== video) activeVideo.pause();
      activeVideo = video;
      const start = () => video.play().catch(() => {});
      if (video.readyState >= 2) start();
      else video.addEventListener('canplay', start, { once:true });
    }
    return video;
  };

  frames.forEach((frame) => {
    const video = frame.querySelector('video');
    const button = frame.querySelector('.media-play');
    button?.addEventListener('click', () => attachVideo(frame,true));
    video?.addEventListener('playing', () => {
      frame.dataset.playing = 'true';
      button?.setAttribute('hidden','');
    });
    video?.addEventListener('pause', () => {
      delete frame.dataset.playing;
      if (!document.hidden && frame.dataset.loaded === 'true') button?.removeAttribute('hidden');
    });
  });

  if (!manualOnly && frames.length && 'IntersectionObserver' in window) {
    const visibility = new Map(frames.map((frame) => [frame,0]));
    const chooseActive = () => {
      const best = [...visibility].sort((a,b) => b[1] - a[1])[0];
      if (!best || best[1] < .36 || document.hidden) {
        activeVideo?.pause();
        activeVideo = null;
        return;
      }
      const next = best[0].querySelector('video');
      if (activeVideo === next && !next.paused) return;
      attachVideo(best[0],true);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibility.set(entry.target,entry.isIntersecting ? entry.intersectionRatio : 0));
      chooseActive();
    }, { threshold:[0,.2,.36,.5,.7,.9] });
    frames.forEach((frame) => observer.observe(frame));
    document.addEventListener('visibilitychange',chooseActive);
  }

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
