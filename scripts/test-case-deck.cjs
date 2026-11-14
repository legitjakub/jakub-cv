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
    append(...children) { children.forEach(c => { c.remove(); c.parentElement = this; this.children.push(c); }); }
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
    scrollEvent() { window.emit('scroll',{}); },
    get current() { return slides.findIndex(s => s.classList.contains('is-current')); },
    wheel(y, gap = 200, fields = {}) { state.time += gap; const e = event(deck,{deltaY:y,deltaX:0,deltaMode:0,timeStamp:state.time,...fields}); window.emit('wheel',e); if (!e.defaultPrevented) state.y += y; window.emit('scroll',{}); return e; },
    key(key,fields = {}) { const e = event(body,{key,...fields}); window.emit('keydown',e); return e; },
    touch(dy,dx = 0) { const start=event(deck,{touches:[{clientX:150,clientY:300}]});deck.emit('touchstart',start);window.emit('touchstart',start); const e = event(deck,{touches:[{clientX:150+dx,clientY:300-dy}]}); deck.emit('touchmove',e);window.emit('touchmove',e);const end=event(deck,{touches:[]});deck.emit('touchend',end);window.emit('touchend',end); return e; },
    resize(w,h,reduced = state.reduced) { state.width=w;state.height=h;state.reduced=reduced; media.forEach(m => m.handlers.forEach(f => f())); window.emit('resize',{}); },
    buttonTarget:() => new Element('button'),
    goHash(id) { state.hash = '#'+id; window.emit('hashchange',{}); }
  };
}


test('native wheel scrolling advances projects and continues past the last one', () => {
  const p=page();let lastY=p.state.y;
  for(let i=0;i<15;i++){const e=p.wheel(200,16);assert.equal(e.defaultPrevented,false);assert.ok(p.state.y>lastY);lastY=p.state.y}
  assert.equal(p.current,5);assert.ok(p.state.y>1132+5*360);
});
test('scrolling up returns to the first project and leaves above the section', () => {
  const p=page();p.state.y=1132+5*360;p.scrollEvent();assert.equal(p.current,5);
  for(let i=0;i<15;i++)assert.equal(p.wheel(-200,16).defaultPrevented,false);
  assert.equal(p.current,0);assert.ok(p.state.y<1132);
});
test('a short native movement does not skip the first project', () => {
  const p=page();p.wheel(80);assert.equal(p.current,0);
  p.wheel(200);assert.equal(p.current,1);
});
test('touch gestures and native keyboard scrolling are never cancelled', () => {
  const p=page({width:390,height:844});
  assert.equal(p.touch(150).defaultPrevented,false);
  assert.equal(p.key('PageDown').defaultPrevented,false);
});
test('deep links scroll to the corresponding project and make it accessible', () => {
  const p=page();p.goHash('peaceofalm');assert.equal(p.current,4);
  assert.equal(p.slides[4].inert,false);assert.ok(p.slides.filter((_,i)=>i!==4).every(s=>s.inert));
});
test('a manually paused video stays paused after scrolling away and back', () => {
  const p=page();const v=p.slides[0].querySelector('video');v.dataset.userPaused='1';v.pause();
  p.wheel(360);p.wheel(-360);assert.equal(v.paused,true);
});
test('reduced motion and short viewports retain the ordinary list', () => {
  const p=page({reduced:true});assert.equal(p.current,-1);
  const q=page();q.resize(390,500);assert.equal(q.current,-1);assert.ok(q.slides.every(s=>!s.inert));
});
