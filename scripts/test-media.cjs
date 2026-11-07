const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function preview(initialReducedMotion) {
  const preferenceHandlers = [];
  const mediaHandlers = {};
  const preference = { matches: initialReducedMotion, addEventListener: (_, fn) => preferenceHandlers.push(fn) };
  const video = {
    paused: true,
    play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; (mediaHandlers.pause || []).forEach(fn => fn()); },
    addEventListener(name, fn) { (mediaHandlers[name] ||= []).push(fn); }
  };
  const context = {
    window: { matchMedia: () => preference, IntersectionObserver: true },
    document: { querySelectorAll: s => s === '.media-frame video' ? [video] : [], addEventListener() {} },
    IntersectionObserver: class { constructor(fn) { this.fn = fn; } observe(target) { this.fn([{ target, isIntersecting: true }]); } }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../media.js'), 'utf8'), context);
  return { video, change(reduced) { preference.matches = reduced; preferenceHandlers.forEach(fn => fn({ matches: reduced })); } };
}

test('turning on reduced motion stops an automatically started visible preview', () => {
  const page = preview(false);
  assert.equal(page.video.paused, false);
  page.change(true);
  assert.equal(page.video.paused, true);
});

test('reduced motion prevents autoplay but leaves manually started playback available', () => {
  const page = preview(true);
  assert.equal(page.video.paused, true);
  page.video.play();
  page.change(false);
  page.change(true);
  assert.equal(page.video.paused, false);
});
