const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

// Load the real script without mounting the optional walkthrough UI.
const context = { module: { exports: {} }, document: { querySelector: () => null } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../agentic.js'), 'utf8'), context);
const api = context.module.exports;
const settings = { country: 'us', channel: 'chatgpt', data: 'full' };
function initial(overrides = {}) {
  assert.equal(typeof api.transition, 'function', 'the walkthrough must expose its real state transitions');
  return api.transition(null, { type: 'settings', settings: { ...settings, ...overrides } });
}

test('every country/channel/data combination follows its payment route without confirming an order', () => {
  const routes = [
    ['cz', 'chatgpt', 'store'], ['us', 'chatgpt', 'store'],
    ['cz', 'copilot', 'store'], ['us', 'copilot', 'direct'],
    ['cz', 'google', 'store'], ['us', 'google', 'direct'],
    ['cz', 'browser', 'browser'], ['us', 'browser', 'browser']
  ];
  for (const [country, channel, route] of routes) {
    for (const data of ['full', 'gap']) {
      const state = initial({ country, channel, data });
      const view = api.journeyState(state);
      assert.equal(view.route, route);
      assert.equal(view.blocked, data === 'gap');
      assert.equal(view.completed, false);
    }
  }
});

test('missing returns policy prevents confirmation at checkout', () => {
  let state = initial({ data: 'gap' });
  state = api.transition(state, { type: 'go', step: 4 });
  state = api.transition(state, { type: 'confirm' });
  assert.equal(api.journeyState(state).completed, false);
  assert.equal(state.confirmed, false);
});

test('opening the last step does not place an order', () => {
  const state = api.transition(initial(), { type: 'go', step: 5 });
  assert.equal(api.journeyState(state).completed, false);
});

test('only explicit confirmation in the payment step completes the simulated order', () => {
  let state = initial();
  assert.equal(api.transition(state, { type: 'confirm' }).confirmed, false);
  state = api.transition(state, { type: 'go', step: 4 });
  state = api.transition(state, { type: 'confirm' });
  assert.equal(state.step, 5);
  assert.equal(api.journeyState(state).completed, true);
});

test('changing settings resets the step and invalidates an earlier confirmation', () => {
  let state = api.transition(initial(), { type: 'go', step: 4 });
  state = api.transition(state, { type: 'confirm' });
  state = api.transition(state, { type: 'settings', settings: { ...settings, country: 'cz' } });
  assert.equal(state.step, 0);
  assert.equal(state.confirmed, false);
  assert.equal(api.journeyState(state).blocked, false);
});

test('restart clears a purchase and step navigation stays inside the walkthrough', () => {
  let state = api.transition(initial(), { type: 'go', step: 4 });
  state = api.transition(state, { type: 'confirm' });
  state = api.transition(state, { type: 'restart' });
  assert.equal(state.step, 0);
  assert.equal(state.confirmed, false);
  assert.equal(api.transition(state, { type: 'go', step: -1 }).step, 0);
  assert.equal(api.transition(state, { type: 'go', step: 9 }).step, 5);
});
