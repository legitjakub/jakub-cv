(() => {
  const workPage = document.querySelector('.work-page');
  if (!workPage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  if (finePointer.matches && !reduceMotion.matches) {
    document.querySelectorAll('.media-frame').forEach((frame) => {
      let animationFrame = 0;

      frame.addEventListener('pointermove', (event) => {
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(() => {
          const rect = frame.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          frame.style.setProperty('--media-rx', `${(-y * 2.8).toFixed(2)}deg`);
          frame.style.setProperty('--media-ry', `${(x * 2.8).toFixed(2)}deg`);
        });
      }, { passive: true });

      frame.addEventListener('pointerleave', () => {
        frame.style.removeProperty('--media-rx');
        frame.style.removeProperty('--media-ry');
      });
    });
  }

  const videos = [...document.querySelectorAll('.media-frame video')];
  if ('IntersectionObserver' in window && videos.length) {
    const visibleVideos = new Set();
    const syncVideo = (video) => {
      if (document.hidden || !visibleVideos.has(video)) {
        video.pause();
        return;
      }
      video.play().catch(() => {});
    };

    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleVideos.add(entry.target);
        else visibleVideos.delete(entry.target);
        syncVideo(entry.target);
      });
    }, { rootMargin: '120px 0px', threshold: 0.15 });

    videos.forEach((video) => videoObserver.observe(video));
    document.addEventListener('visibilitychange', () => videos.forEach(syncVideo));
  }

  const cases = document.querySelectorAll('.case-study');
  if ('IntersectionObserver' in window && cases.length) {
    const caseObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-current', entry.isIntersecting));
    }, { rootMargin: '-28% 0px -54% 0px', threshold: 0 });

    cases.forEach((caseStudy) => caseObserver.observe(caseStudy));
  }
})();
