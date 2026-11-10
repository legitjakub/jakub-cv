const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function page({ width = 1440, height = 900, reduced = false } = {}) {
  const state = { width, height, reduced, y: 0, deckTop:1200, time: 1000, hash: '#posedla' };
  const names = ['posedla','facederma','bohemian','molecules','peaceofalm','surprisedrinks'];
  const media = [];
  let activeElement;
  class Element {
    constructor(tag = 'div', classes = '') {
      this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.attrs = {}; this.handlers = {}; this.parentElement = null;
      this.classes = new Set(classes.split(' ').filter(Boolean));
      this.classList = { add: (...s) => s.forEach(v => this.classes.add(v)), remove: (...s) => s.forEach(v => this.classes.delete(v)), contains: s => this.classes.has(s), toggle: (s, force) => { const yes = force ?? !this.classes.has(s); yes ? this.classes.add(s) : this.classes.delete(s); return yes; } };
      const props = {};
      this.style = { setProperty: (k,v) => props[k] = String(v), getPropertyValue: k => props[k] || '', removeProperty: k => delete props[k] };
    }
    set className(v) { this.classes = new Set(v.split(' ').filter(Boolean)); }
    get className() { return [...this.classes].join(' '); }
    addEventListener(t,f) { (this.handlers[t] ||= new Set()).add(f); }
    removeEventListener(t,f) { this.handlers[t]?.delete(f); }
    emit(t,e) { this.handlers[t]?.forEach(f => f(e)); }
    append(...children) { children.forEach(c => { c.parentElement = this; this.children.push(c); }); }
    remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(c => c !== this); this.parentElement = null; }
    setAttribute(k,v) { this.attrs[k] = String(v); if (k.startsWith('data-')) this.dataset[k.slice(5).replace(/-([a-z])/g, (_,c) => c.toUpperCase())] = String(v); }
    getAttribute(k) { return this.attrs[k] ?? null; }
    removeAttribute(k) { delete this.attrs[k]; }
    toggleAttribute(k,on = !(k in this.attrs)) { on ? this.setAttribute(k,'') : this.removeAttribute(k); }
    contains(e) { return e === this || this.children.some(c => c.contains(e)); }
    matches(selector) { return selector.split(',').some(s => { s = s.trim(); if (s === '*') return true; if (s[0] === '.') return this.classes.has(s.slice(1)); if (s[0] === '[') { const m = s.match(/^\[([^=\]]+)(?:=["']?([^"'\]]+)["']?)?\]$/); return m && (m[2] ? this.getAttribute(m[1]) === m[2] : this.getAttribute(m[1]) !== null); } return s.toUpperCase() === this.tagName; }); }
    closest(s) { return this.matches(s) ? this : this.parentElement?.closest(s) || null; }
    querySelectorAll(s) { return this.children.flatMap(c => [...(c.matches(s) ? [c] : []), ...c.querySelectorAll(s)]); }
    querySelector(s) { return this.querySelectorAll(s)[0] || null; }
    focus() { activeElement = this; }
    getBoundingClientRect() { const top = state.deckTop - state.y; return { top, bottom:top + state.height - 68, height:state.height - 68, width:state.width }; }
    get scrollHeight() { return 500; }
    get clientHeight() { return state.height - 68; }
    get offsetHeight() { return this.classes.has('project-gallery') ? 260 : this.clientHeight; }
    scrollIntoView() { state.y = 1132; }
    set innerHTML(html) {
      this.children = [];
      for (const m of html.matchAll(/<(button|output|span)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
        const e = new Element(m[1]);
        for (const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g)) e.setAttribute(a[1],a[2]);
        e.textContent = m[3].replace(/<[^>]*>/g,''); this.append(e);
      }
    }
  }
  const root = new Element('html'); root.lang = 'cs';
  const deck = new Element('div','case-deck');
  const slides = names.map(id => {
    const s = new Element('section','project-showcase' + (id === 'molecules' ? ' case-molecules-new' : '')); s.id = id;
    const h = new Element('h2'); const label = new Element('span'); label.textContent = id; h.append(label); s.append(h);
    const gallery = new Element('div','project-gallery');
    const v = new Element('video'); v.paused = true; v.play = () => { v.paused = false; v.emit('play',{}); return Promise.resolve(); }; v.pause = () => { v.paused = true; };
    gallery.append(v); s.append(gallery); deck.append(s);
    const query = s.querySelector.bind(s);
    s.querySelector = q => q.startsWith('h2 ') ? label : query(q);
    return s;
  });
  const queryDeck = deck.querySelectorAll.bind(deck);
  deck.querySelectorAll = s => s.includes(':scope') ? slides : queryDeck(s);
  const body = new Element('body'); body.append(deck);
  const window = new Element('window');
  window.matchMedia = q => {
    const m = { get matches() { const w = q.match(/min-width:\s*(\d+)/), h = q.match(/min-height:\s*(\d+)/); return (!w || state.width >= +w[1]) && (!h || state.height >= +h[1]) && (!q.includes('prefers-reduced-motion:no-preference') || !state.reduced) && (!q.includes('prefers-reduced-motion:reduce') || state.reduced) && (!q.includes('hover:hover') || state.width >= 1024); }, handlers:[], addEventListener: (_,f) => m.handlers.push(f) }; media.push(m); return m;
  };
  const document = { documentElement:root, body, hidden:false, get activeElement() { return activeElement || body; }, createElement:t => new Element(t), querySelector:s => s === '.case-deck' ? deck : body.querySelector(s), querySelectorAll:s => body.querySelectorAll(s), addEventListener:(...a) => window.addEventListener(...a), removeEventListener:(...a) => window.removeEventListener(...a) };
  const context = { window, document, performance:{now:() => state.time}, location:{get hash() { return state.hash; }}, addEventListener:window.addEventListener.bind(window), removeEventListener:window.removeEventListener.bind(window), scrollTo:o => { state.y = o.top; }, requestAnimationFrame:f => { f(); return 1; }, cancelAnimationFrame() {}, setTimeout, clearTimeout, console };
  for (const [key, getter] of Object.entries({innerWidth:() => state.width, innerHeight:() => state.height, scrollY:() => state.y})) { Object.defineProperty(context,key,{get:getter}); Object.defineProperty(window,key,{get:getter}); }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../case-deck.js'),'utf8'),context);
  const event = (target,fields) => ({target,defaultPrevented:false,cancelable:true,preventDefault() { this.defaultPrevented = true; },...fields});
  return {
    slides, deck, root, state,
    get current() { return slides.findIndex(s => s.classList.contains('is-current')); },
    wheel(y, gap = 200, fields = {}) { state.time += gap; const e = event(deck,{deltaY:y,deltaX:0,deltaMode:0,timeStamp:state.time,...fields}); window.emit('wheel',e); if (!e.defaultPrevented) state.y += y; return e; },
    key(key,fields = {}) { const e = event(body,{key,...fields}); window.emit('keydown',e); return e; },
    touch(dy,dx = 0) { deck.emit('touchstart',event(deck,{touches:[{clientX:150,clientY:300}]})); const e = event(deck,{touches:[{clientX:150+dx,clientY:300-dy}]}); deck.emit('touchmove',e); deck.emit('touchend',event(deck,{touches:[]})); return e; },
    resize(w,h,reduced = state.reduced) { state.width=w;state.height=h;state.reduced=reduced; media.forEach(m => m.handlers.forEach(f => f())); window.emit('resize',{}); },
    buttonTarget:() => new Element('button'),
    goHash(id) { state.hash = '#'+id; window.emit('hashchange',{}); }
  };
}

test('separate equal wheel gestures advance without a long pause', () => {
  const p = page();
  for (let i=1;i<=5;i++) { p.wheel(40,220); assert.equal(p.current,i); }
});
test('one long decaying trackpad gesture advances only once', () => {
  const p = page();
  [90,82,70,51,37,22,13,7,3,1].forEach(y => p.wheel(y,12));
  assert.equal(p.current,1);
});
test('a new rising gesture after momentum is accepted immediately', () => {
  const p = page();
  [80,60,30,10,2].forEach(y => p.wheel(y,12));
  [4,16,38].forEach(y => p.wheel(y,20));
  assert.equal(p.current,2);
});
test('a reverse gesture immediately returns to the previous project', () => {
  const p = page();p.wheel(50);p.wheel(-50,100);assert.equal(p.current,0);
});
test('a large wheel delta does not skip projects', () => {
  const p = page();p.wheel(1800);assert.equal(p.current,1);
});
test('zoom and horizontal gestures do not navigate', () => {
  const p = page();p.wheel(100,200,{ctrlKey:true});p.wheel(10,200,{deltaX:120});assert.equal(p.current,0);
});
test('touch works on a phone and horizontal swipes do not change project', () => {
  const p = page({width:390,height:844});assert.equal(p.current,0);
  p.touch(64);assert.equal(p.current,1);p.touch(12,100);assert.equal(p.current,1);p.touch(-64);assert.equal(p.current,0);
});
test('keys already handled by a gallery do not navigate the case deck', () => {
  const p = page();p.key('ArrowDown',{defaultPrevented:true});assert.equal(p.current,0);
});
test('Space on a playback or navigation button keeps its native action', () => {
  const p = page();const e=p.key(' ',{target:p.buttonTarget()});assert.equal(e.defaultPrevented,false);assert.equal(p.current,0);
});
test('deep links select the matching case and inactive cases cannot receive focus', () => {
  const p=page();p.goHash('peaceofalm');assert.equal(p.current,4);assert.equal(p.slides[4].inert,false);assert.ok(p.slides.filter((_,i)=>i!==4).every(s=>s.inert));
});
test('the main navigation opens the first project in either language', () => {
  for (const id of ['projekty','case-studies']) {
    const p=page();p.goHash('molecules');p.goHash(id);assert.equal(p.current,0);assert.equal(p.state.y,1132);
  }
});
test('a manually paused clip stays paused when its project returns', () => {
  const p=page();const clip=p.slides[0].querySelector('video');clip.pause();clip.dataset.userPaused='1';
  p.wheel(60);p.wheel(-60);assert.equal(clip.paused,true);
});
test('leaving the last case lets the page continue; the deck never wraps', () => {
  const p=page();p.goHash('surprisedrinks');p.wheel(80,600);assert.equal(p.current,5);assert.ok(p.state.y>1132);
});
test('resizing after leaving does not pull the reader back into an old deep link', () => {
  const p=page();p.goHash('surprisedrinks');p.wheel(80,600);const outside=p.state.y;
  p.resize(1440,1000);assert.equal(p.state.y,outside);
});
test('changing viewport while in the deck keeps the current project', () => {
  const p=page();p.wheel(60);p.resize(390,844);assert.equal(p.current,1);assert.equal(p.state.y,1132);
});
test('responsive changes above the deck do not shift the active frame out of view', () => {
  const p=page();p.wheel(60);p.state.deckTop=2100;p.resize(390,844);assert.equal(p.current,1);assert.equal(p.state.y,2032);
});
test('focus scrolling inside a gallery does not swallow the next gesture', () => {
  const p=page();p.state.y+=24;p.wheel(60);assert.equal(p.current,1);assert.equal(p.state.y,1132);
  const q=page({width:390,height:844});q.state.y+=24;q.touch(60);assert.equal(q.current,1);assert.equal(q.state.y,1132);
  const r=page();r.state.y+=24;r.key('PageDown');assert.equal(r.current,1);assert.equal(r.state.y,1132);
});
test('reduced motion and short windows keep an accessible plain list', () => {
  const p=page({reduced:true});assert.equal(p.current,-1);assert.ok(p.slides.every(s=>!s.inert));
  const q=page();q.resize(390,500);assert.equal(q.current,-1);assert.ok(q.slides.every(s=>!s.inert));
});
