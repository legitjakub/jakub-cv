/* Offline walkthrough. These state transitions are also exercised by the
   dependency-free Node tests; the browser renders the same state. */
(function () {
  function journeyState(state) {
    var s = Object.assign({}, state.settings);
    s.route = s.channel === 'meta' && s.country === 'cz' ? 'unavailable' :
      s.channel === 'shop' ? 'shop' : s.channel === 'browser' ? 'browser' :
      (s.country === 'us' && ['copilot', 'google', 'meta'].indexOf(s.channel) > -1 ? 'direct' : 'store');
    s.unavailable = s.route === 'unavailable';
    s.available = !s.unavailable;
    s.gap = s.data === 'gap' && !s.unavailable;
    s.blocked = s.gap || s.unavailable;
    s.completed = state.confirmed && !s.blocked;
    s.pending = !s.completed && !s.blocked;
    s.catalog = s.channel === 'google' ? 'google' : s.channel === 'browser' ? 'storefront' : 'shopify';
    return s;
  }

  function transition(state, event) {
    if (event.type === 'settings') return { settings: Object.assign({}, event.settings), step: 0, confirmed: false };
    var next = Object.assign({}, state);
    if (event.type === 'go') next.step = Math.max(0, Math.min(5, event.step));
    if (event.type === 'restart') { next.step = 0; next.confirmed = false; }
    if (event.type === 'confirm' && next.step === 4 && !journeyState(next).blocked) {
      next.confirmed = true;
      next.step = 5;
    }
    return next;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { journeyState: journeyState, transition: transition };
  if (typeof document === 'undefined') return;
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
  var confirm = sim.querySelector('.sim-confirm');
  var dotsWrap = sim.querySelector('.sim-dots');
  var live = sim.querySelector('.sim-live');
  var restartTpl = sim.querySelector('.sim-restart-label');
  var nextLabel = next.textContent;
  var restartLabel = restartTpl ? restartTpl.textContent + ' ↺' : nextLabel;
  var state = transition(null, { type: 'settings', settings: readSettings() });

  function readSettings() {
    var values = {};
    ['country', 'channel', 'data'].forEach(function (name) {
      var el = form.querySelector('input[name="' + name + '"]:checked');
      values[name] = el ? el.value : '';
    });
    return values;
  }

  sim.classList.add('sim-js');
  nav.hidden = false;
  var dots = steps.map(function (step, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'sim-dot';
    var h = step.querySelector('h3');
    b.setAttribute('aria-label', (i + 1) + ': ' + (h ? h.lastChild.textContent : i + 1));
    b.innerHTML = '<span>' + (i + 1) + '</span>';
    b.addEventListener('click', function () { dispatch({ type: 'go', step: i }, true); });
    dotsWrap.appendChild(b);
    return b;
  });

  function matches(cond, s) {
    return cond.split(' ').every(function (tok) {
      if (tok === 'ok') return !s.blocked;
      if (['blocked', 'completed', 'pending', 'gap', 'unavailable', 'available'].indexOf(tok) > -1) return s[tok];
      var kv = tok.split(':');
      return s[kv[0]] === kv[1];
    });
  }

  function render(focus) {
    var view = journeyState(state);
    sim.querySelectorAll('[data-when]').forEach(function (el) { el.hidden = !matches(el.getAttribute('data-when'), view); });
    sim.classList.toggle('is-blocked', view.blocked);
    steps.forEach(function (step, k) { step.hidden = k !== state.step; });
    dots.forEach(function (d, k) {
      if (k === state.step) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
      d.classList.toggle('is-done', k < state.step);
    });
    var active = (steps[state.step].getAttribute('data-layers') || '').split(' ');
    layers.forEach(function (l) { l.classList.toggle('is-active', active.indexOf(l.getAttribute('data-layer')) > -1); });
    prev.disabled = state.step === 0;
    next.textContent = state.step === steps.length - 1 ? restartLabel : nextLabel;
    next.hidden = state.step === 4 && !view.blocked;
    if (confirm) confirm.hidden = state.step !== 4 || view.blocked;
    if (live && i18n.state) live.textContent = i18n.state.replace('{n}', state.step + 1).replace('{t}', steps.length);
    if (focus) {
      var h = steps[state.step].querySelector('h3');
      if (h) {
        h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
        h.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    }
  }

  function dispatch(event, focus) { state = transition(state, event); render(focus); }
  prev.addEventListener('click', function () { dispatch({ type: 'go', step: state.step - 1 }, true); });
  next.addEventListener('click', function () {
    dispatch(state.step === steps.length - 1 ? { type: 'restart' } : { type: 'go', step: state.step + 1 }, true);
  });
  if (confirm) confirm.addEventListener('click', function () { dispatch({ type: 'confirm' }, true); });
  dotsWrap.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      dispatch({ type: 'go', step: state.step + (e.key === 'ArrowRight' ? 1 : -1) }, false);
      dots[state.step].focus();
    }
  });
  form.addEventListener('change', function () { dispatch({ type: 'settings', settings: readSettings() }, false); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  render(false);
})();
