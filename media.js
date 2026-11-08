(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.video-duo,.conversion-case-media').forEach((rail) => {
    const slides = [...rail.querySelectorAll(':scope > .media-frame')];
    if (slides.length < 2) return;
    const controls = document.createElement('div');
    controls.className = 'mobile-snap-controls';
    const isEnglish = document.documentElement.lang === 'en';
    controls.innerHTML = '<button type="button" data-snap-prev aria-label="' + (isEnglish ? 'Previous preview' : 'Předchozí ukázka') + '"><i aria-hidden="true"></i></button><span><b>1</b> / ' + slides.length + '</span><button type="button" data-snap-next aria-label="' + (isEnglish ? 'Next preview' : 'Další ukázka') + '"><i aria-hidden="true"></i></button>';
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

  /* Previews use a caption button, keeping the image free of browser panels.
     Without JavaScript the poster remains visible. Clips are fetched on view. */
  const previews = document.querySelectorAll('.media-frame video');
  const manuallyPaused = new Set();
  previews.forEach((video) => {
    video.controls = false;
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;
    const caption = video.closest('.media-frame')?.querySelector('figcaption');
    if (!caption) return;
    const english = document.documentElement.lang === 'en';
    const label = document.createElement('span');
    label.className = 'media-caption-text';
    while (caption.firstChild) label.append(caption.firstChild);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'media-toggle';
    const sync = () => {
      const action = video.paused ? (english ? 'Play' : 'Přehrát') : (english ? 'Pause' : 'Pozastavit');
      button.textContent = action;
      button.dataset.playing = String(!video.paused);
      button.setAttribute('aria-label', action + ': ' + (video.getAttribute('aria-label') || (english ? 'Project preview' : 'Ukázka projektu')));
    };
    button.addEventListener('click', async () => {
      if (video.paused) {
        manuallyPaused.delete(video);
        try { await video.play(); } catch { sync(); }
      } else {
        manuallyPaused.add(video);
        video.pause();
      }
    });
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    video.addEventListener('ended', sync);
    caption.classList.add('has-playback-toggle');
    caption.append(label, button);
    sync();
  });
  if (previews.length && 'IntersectionObserver' in window) {
    const inView = new Set();
    const autoStarted = new Set();
    const start = (video) => {
      if (reduceMotion.matches || manuallyPaused.has(video) || !video.paused) return;
      autoStarted.add(video);
      video.play().catch(() => autoStarted.delete(video));
    };
    const playObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) { inView.add(video); start(video); }
        else { inView.delete(video); if (!video.paused) video.pause(); }
      });
    }, { rootMargin:'150px 0px', threshold:0.2 });
    previews.forEach((video) => {
      video.addEventListener('pause', () => autoStarted.delete(video));
      playObserver.observe(video);
    });
    reduceMotion.addEventListener('change', () => {
      if (reduceMotion.matches) autoStarted.forEach((video) => video.pause());
    });
    /* A backgrounded tab refuses play() outright, and the rejection is the end
       of it — so retry whatever is still on screen once the tab comes back. */
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) inView.forEach(start);
    });
  } else {
    previews.forEach((video) => { video.preload = 'metadata'; });
  }

  /* The scope list ships open so it is there without JS and on desktop, where
     the column has room. On phones it is the tallest block in a case study, so
     collapse it and let the reader open the ones they care about. */
  const scopes = document.querySelectorAll('.case-scope-box');
  if (scopes.length) {
    const narrow = window.matchMedia('(max-width:760px)');
    const syncScopes = () => scopes.forEach((box) => { box.open = !narrow.matches; });
    syncScopes();
    narrow.addEventListener('change', syncScopes);
  }

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
