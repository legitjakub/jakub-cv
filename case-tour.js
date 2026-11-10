/* Case pages: a tabbed walk through the client's store and an enlarge view
   for every screenshot. Without this script every screen is simply listed.
   Recorded clips (.tour-video) load on first view and play only while their
   tab is on and they are on screen; each switch to a tab starts its clip
   from the beginning. Reduced motion or Save-Data keeps the poster until the
   visitor presses play. */
(() => {
  const en = document.documentElement.lang === 'en';

  const clips = [...document.querySelectorAll('video.tour-video')];
  // Sharper encodes where the browser can use them, as listed in data-v:
  // h = an HEVC copy (.hevc.mp4); w = that copy is the large cut, for wide
  // screens only (narrow screens keep the lighter H.264 file).
  const HEVC = (() => { try { return !!document.createElement('video').canPlayType('video/mp4; codecs="hvc1.1.6.L120.90"'); } catch (e) { return false; } })();
  const clipSrc = (v) => {
    const f = (v.dataset.v || '').split(','); let s = v.dataset.src;
    if (HEVC && f.includes('h') && !(f.includes('w') && innerWidth < 900)) s = s.replace(/\.mp4$/, '.hevc.mp4');
    return s;
  };
  const reduce = window.matchMedia('(prefers-reduced-motion:reduce)');
  const auto = () => !reduce.matches && !(navigator.connection && navigator.connection.saveData);
  const held = new Set(), seen = new Set();
  const prime = (v) => { if (v.dataset.poster) { v.poster = v.dataset.poster; v.removeAttribute('data-poster'); } };
  const fetchClip = (v) => { prime(v); if (v.dataset.src) { v.src = clipSrc(v); v.removeAttribute('data-src'); } };
  const shown = (v) => !v.closest('[hidden]');
  const update = (v) => {
    if (shown(v)) prime(v);
    if (shown(v) && seen.has(v) && !held.has(v) && !document.hidden && auto()) { fetchClip(v); v.play().catch(() => {}); }
    else if (!v.paused) v.pause();
  };
  clips.forEach((v) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tour-play';
    const sync = () => {
      const label = v.paused ? (en ? 'Play' : 'Přehrát') : (en ? 'Pause' : 'Pozastavit');
      btn.dataset.playing = String(!v.paused);
      btn.setAttribute('aria-label', `${label}: ${v.getAttribute('aria-label') || ''}`);
    };
    btn.addEventListener('click', () => {
      if (v.paused) { held.delete(v); fetchClip(v); v.play().catch(() => {}); }
      else { held.add(v); v.pause(); }
    });
    ['play', 'pause'].forEach((t) => v.addEventListener(t, sync));
    v.after(btn);
    sync();
  });
  if (clips.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target);
      update(e.target);
    }), { threshold: 0.3 });
    clips.forEach((v) => io.observe(v));
    document.addEventListener('visibilitychange', () => clips.forEach(update));
    reduce.addEventListener('change', () => clips.forEach(update));
  } else clips.forEach(prime);
  // a tab switch restarts the clip it reveals
  const onShow = (panel) => clips.forEach((v) => {
    if (panel.contains(v)) { held.delete(v); if (v.src) v.currentTime = 0; }
    update(v);
  });

  document.querySelectorAll('[data-tour]').forEach((tour) => {
    const tabs = [...tour.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    let current = 0;
    const show = (i, focus) => {
      i = (i + tabs.length) % tabs.length;
      tabs.forEach((t, k) => {
        const on = k === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
      });
      if (i !== current || !tour.classList.contains('is-ready')) onShow(panels[i]);
      current = i;
      if (focus) tabs[i].focus();
      tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => show(i)));
    tour.querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
      const map = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      show(map[e.key], true);
    });
    tour.querySelector('.tour-prev')?.addEventListener('click', () => show(current - 1));
    tour.querySelector('.tour-next')?.addEventListener('click', () => show(current + 1));
    show(0);
    tour.classList.add('is-ready');
  });

  const zooms = [...document.querySelectorAll('.shot-zoom')];
  if (!zooms.length || typeof HTMLDialogElement !== 'function') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'shot-dialog';
  dialog.innerHTML = `<figure><img alt="" /><figcaption></figcaption></figure>
    <div class="shot-dialog-bar"><button type="button" data-step="-1" aria-label="${en ? 'Previous screen' : 'Předchozí snímek'}">←</button><span></span><button type="button" data-step="1" aria-label="${en ? 'Next screen' : 'Další snímek'}">→</button><button type="button" data-close>${en ? 'Close' : 'Zavřít'}</button></div>`;
  document.body.append(dialog);
  const img = dialog.querySelector('img');
  const cap = dialog.querySelector('figcaption');
  const count = dialog.querySelector('.shot-dialog-bar span');
  let group = [], at = 0, opener = null;

  const caption = (btn) => {
    const fig = btn.closest('figure');
    const h = fig?.querySelector('figcaption h3');
    const p = fig?.querySelector('figcaption p');
    return h ? `<b>${h.textContent}</b> ${p ? p.textContent : ''}` : (fig?.querySelector('figcaption')?.textContent || '');
  };
  const load = (i) => {
    at = (i + group.length) % group.length;
    const b = group[at], src = b.querySelector('img');
    img.src = src.currentSrc || src.src;
    img.alt = src.alt;
    img.className = src.width < src.height ? 'is-tall' : '';
    cap.innerHTML = caption(b);
    count.textContent = `${at + 1} / ${group.length}`;
    dialog.querySelectorAll('[data-step]').forEach((s) => { s.hidden = group.length < 2; });
  };
  zooms.forEach((b) => b.addEventListener('click', () => {
    opener = b;
    group = [...(b.closest('[data-tour], .phone-row') || document).querySelectorAll('.shot-zoom')];
    load(group.indexOf(b));
    dialog.showModal();
  }));
  dialog.addEventListener('click', (e) => {
    const step = e.target.closest('[data-step]');
    if (step) return load(at + Number(step.dataset.step));
    if (e.target.closest('[data-close]') || e.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') load(at + 1);
    if (e.key === 'ArrowLeft') load(at - 1);
  });
  dialog.addEventListener('close', () => {
    // keep the tour in step with the screen last viewed
    const tour = opener?.closest('[data-tour]');
    if (tour && group[at] !== opener) {
      const panel = group[at].closest('[role="tabpanel"]');
      tour.querySelector(`[aria-controls="${panel.id}"]`)?.click();
    }
    group[at]?.focus();
  });
})();
