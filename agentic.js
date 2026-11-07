/* Agentic commerce walkthrough. The markup is a complete ordered list of
   steps, so without this script the page still reads top to bottom. With it,
   the list becomes a stepper and the three controls (shopper country, channel,
   store data) pick which agent replies are shown. Nothing here talks to a
   network: it is a labelled simulation. */
(function () {
  var sim = document.querySelector('[data-sim]');
  if (!sim) return;
  var i18n = {};
  try { i18n = JSON.parse(sim.getAttribute('data-i18n') || '{}'); } catch (e) {}
  var steps = Array.prototype.slice.call(sim.querySelectorAll('.sim-step'));
  var layers = Array.prototype.slice.call(sim.querySelectorAll('.sim-layers [data-layer]'));
  var form = sim.querySelector('.sim-controls');
  var nav = sim.querySelector('.sim-nav');
  var prev = sim.querySelector('.sim-prev');
  var next = sim.querySelector('.sim-next');
  var dotsWrap = sim.querySelector('.sim-dots');
  var live = sim.querySelector('.sim-live');
  var restartTpl = sim.querySelector('.sim-restart-label');
  var nextLabel = next.textContent;
  var restartLabel = restartTpl ? restartTpl.innerHTML + ' ↺' : nextLabel;
  var current = 0;

  sim.classList.add('sim-js');
  nav.hidden = false;

  var dots = steps.map(function (step, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'sim-dot';
    var h = step.querySelector('h3');
    var title = h ? h.lastChild.textContent : String(i + 1);
    b.setAttribute('aria-label', (i + 1) + ': ' + title);
    b.innerHTML = '<span>' + (i + 1) + '</span>';
    b.addEventListener('click', function () { go(i, true); });
    dotsWrap.appendChild(b);
    return b;
  });

  function state() {
    var s = {};
    ['country', 'channel', 'data'].forEach(function (name) {
      var el = form.querySelector('input[name="' + name + '"]:checked');
      s[name] = el ? el.value : '';
    });
    s.blocked = s.channel !== 'browser' && s.country === 'cz';
    return s;
  }

  function matches(cond, s) {
    return cond.split(' ').every(function (tok) {
      if (tok === 'ok') return !s.blocked;
      if (tok === 'blocked') return s.blocked;
      var kv = tok.split(':');
      return s[kv[0]] === kv[1];
    });
  }

  function apply() {
    var s = state();
    sim.querySelectorAll('[data-when]').forEach(function (el) {
      el.hidden = !matches(el.getAttribute('data-when'), s);
    });
    sim.classList.toggle('is-blocked', s.blocked);
  }

  function go(i, focus) {
    current = Math.max(0, Math.min(steps.length - 1, i));
    steps.forEach(function (step, k) { step.hidden = k !== current; });
    dots.forEach(function (d, k) {
      if (k === current) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
      d.classList.toggle('is-done', k < current);
    });
    var active = (steps[current].getAttribute('data-layers') || '').split(' ');
    layers.forEach(function (l) { l.classList.toggle('is-active', active.indexOf(l.getAttribute('data-layer')) > -1); });
    prev.disabled = current === 0;
    next.innerHTML = current === steps.length - 1 ? restartLabel : nextLabel;
    if (live && i18n.state) live.textContent = i18n.state.replace('{n}', current + 1).replace('{t}', steps.length);
    if (focus) {
      var h = steps[current].querySelector('h3');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
  }

  prev.addEventListener('click', function () { go(current - 1, true); });
  next.addEventListener('click', function () { go(current === steps.length - 1 ? 0 : current + 1, true); });
  dotsWrap.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      go(current + (e.key === 'ArrowRight' ? 1 : -1), false);
      dots[current].focus();
    }
  });
  form.addEventListener('change', apply);
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  apply();
  go(0, false);
})();
