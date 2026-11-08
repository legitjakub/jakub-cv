const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function preview(initialReducedMotion) {
  const preferenceHandlers = [];
  const mediaHandlers = {};
  const documentHandlers = {};
  let button;
  const caption = { classList: { add() {} }, append() {} };
  const preference = { matches: initialReducedMotion, addEventListener: (_, fn) => preferenceHandlers.push(fn) };
  const video = {
    controls: true,
    paused: true,
    play() { this.paused = false; (mediaHandlers.play || []).forEach(fn => fn()); return Promise.resolve(); },
    pause() { this.paused = true; (mediaHandlers.pause || []).forEach(fn => fn()); },
    addEventListener(name, fn) { (mediaHandlers[name] ||= []).push(fn); },
    closest() { return { querySelector: () => caption }; },
    getAttribute() { return 'Ukázka projektu'; }
  };
  const context = {
    window: { matchMedia: () => preference, IntersectionObserver: true },
    document: {
      documentElement: { lang: 'cs' },
      querySelectorAll: s => s === '.media-frame video' ? [video] : [],
      addEventListener(name, fn) { (documentHandlers[name] ||= []).push(fn); },
      createElement(tag) {
        const handlers = {};
        const element = { dataset: {}, setAttribute() {}, append() {}, addEventListener(name, fn) { handlers[name] = fn; }, click() { return handlers.click(); } };
        if (tag === 'button') button = element;
        return element;
      }
    },
    IntersectionObserver: class { constructor(fn) { this.fn = fn; } observe(target) { this.fn([{ target, isIntersecting: true }]); } }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../media.js'), 'utf8'), context);
  return { video, button, returnToTab() { (documentHandlers.visibilitychange || []).forEach(fn => fn()); }, change(reduced) { preference.matches = reduced; preferenceHandlers.forEach(fn => fn({ matches: reduced })); } };
}

test('native video controls and picture-in-picture stay disabled', () => {
  const page = preview(false);
  assert.equal(page.video.controls, false);
  assert.equal(page.video.disablePictureInPicture, true);
  assert.equal(page.video.disableRemotePlayback, true);
});

test('caption control preserves a manual pause when returning to the page', async () => {
  const page = preview(false);
  assert.equal(page.button.textContent, 'Pozastavit');
  await page.button.click();
  assert.equal(page.video.paused, true);
  assert.equal(page.button.textContent, 'Přehrát');
  page.returnToTab();
  assert.equal(page.video.paused, true);
  await page.button.click();
  assert.equal(page.video.paused, false);
});

test('caption control can start a preview when reduced motion prevents autoplay', async () => {
  const page = preview(true);
  assert.equal(page.video.paused, true);
  await page.button.click();
  assert.equal(page.video.paused, false);
  assert.equal(page.button.textContent, 'Pozastavit');
});

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
