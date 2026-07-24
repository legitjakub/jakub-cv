/* Cookie consent + Google Consent Mode v2
   Opt-in by default (CZ: zakon c. 127/2005 Sb., par. 89 odst. 3; GDPR cl. 6).
   The `consent default = denied` call lives inline in each page <head> so it
   runs before gtag.js; this file only renders the UI and pushes updates. */
(function () {
  "use strict";

  var STORE = "jh-consent";
  var VERSION = 1;

  var COPY = {
    cs: {
      title: "Cookies",
      body: "Nezbytné cookies potřebuje web k provozu. Analytické mi ukazují, které stránky dávají smysl. Bez souhlasu se nespustí nic navíc.",
      accept: "Přijmout vše",
      reject: "Odmítnout vše",
      settings: "Nastavit",
      save: "Uložit výběr",
      back: "Zpět",
      prefsTitle: "Nastavení cookies",
      manage: "Nastavení cookies",
      cats: {
        necessary: {
          name: "Nezbytné",
          always: "Vždy aktivní",
          desc: "Zajišťují základní chod webu a pamatují si tvoji volbu cookies. Bez nich web nefunguje."
        },
        analytics: {
          name: "Analytické",
          desc: "Google Analytics 4 — anonymizovaně měří návštěvnost a chování na webu, abych věděl, co zlepšit."
        },
        marketing: {
          name: "Marketingové",
          desc: "Měření reklamy a remarketing. Aktuálně je nepoužívám; zůstávají vypnuté, dokud je nezapneš."
        }
      }
    },
    en: {
      title: "Cookies",
      body: "Necessary cookies keep the site running. Analytics show me which pages actually work. Nothing else runs without your consent.",
      accept: "Accept all",
      reject: "Reject all",
      settings: "Customise",
      save: "Save choices",
      back: "Back",
      prefsTitle: "Cookie settings",
      manage: "Cookie settings",
      cats: {
        necessary: {
          name: "Necessary",
          always: "Always on",
          desc: "Run the site and remember your cookie choice. The site does not work without them."
        },
        analytics: {
          name: "Analytics",
          desc: "Google Analytics 4 — anonymised traffic and behaviour measurement so I know what to improve."
        },
        marketing: {
          name: "Marketing",
          desc: "Ad measurement and remarketing. Not currently used; stays off unless you turn it on."
        }
      }
    }
  };

  var t = COPY[(document.documentElement.lang || "cs").slice(0, 2).toLowerCase()] || COPY.cs;

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  function signals(state) {
    return {
      analytics_storage: state.analytics ? "granted" : "denied",
      ad_storage: state.marketing ? "granted" : "denied",
      ad_user_data: state.marketing ? "granted" : "denied",
      ad_personalization: state.marketing ? "granted" : "denied"
    };
  }

  function read() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return null;
      var saved = JSON.parse(raw);
      if (!saved || saved.v !== VERSION) return null;
      return saved;
    } catch (e) {
      return null;
    }
  }

  function persist(state) {
    var payload = {
      v: VERSION,
      at: new Date().toISOString(),
      analytics: !!state.analytics,
      marketing: !!state.marketing
    };
    try {
      localStorage.setItem(STORE, JSON.stringify(payload));
    } catch (e) {}
    gtag("consent", "update", signals(payload));
    /* GA4 only starts a session once storage is allowed, so send the pageview
       that the initial config call could not record. */
    if (payload.analytics) gtag("event", "page_view");
  }

  /* ---------- styles ---------- */

  var CSS =
    '.jh-consent,.jh-consent *{box-sizing:border-box}' +
    '.jh-consent{position:fixed;z-index:2147483000;right:max(16px,env(safe-area-inset-right));' +
    'bottom:max(16px,env(safe-area-inset-bottom));width:min(370px,calc(100vw - 32px));' +
    'background:#0d100e;color:#efeee8;border:1px solid rgba(255,255,255,.16);' +
    'font-family:"Manrope",system-ui,sans-serif;box-shadow:0 24px 60px rgba(0,0,0,.55);' +
    'opacity:0;transform:translateY(12px);transition:opacity .28s ease,transform .28s ease}' +
    '.jh-consent[data-open="1"]{opacity:1;transform:translateY(0)}' +
    '@media (prefers-reduced-motion:reduce){.jh-consent{transition:none}}' +
    '.jh-consent-in{padding:18px}' +
    '.jh-consent h2{margin:0 0 8px;font-size:8px;font-weight:700;letter-spacing:.22em;' +
    'text-transform:uppercase;color:#a8ff3e}' +
    '.jh-consent p{margin:0 0 14px;font-size:12px;line-height:1.55;color:#b9bbb3}' +
    '.jh-consent-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
    '.jh-consent button{min-height:40px;padding:10px 12px;border:1px solid transparent;' +
    'font:inherit;font-size:9px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;' +
    'cursor:pointer;transition:background .18s ease,color .18s ease,border-color .18s ease}' +
    '.jh-consent button:focus-visible{outline:2px solid #a8ff3e;outline-offset:2px}' +
    /* Accept and reject must carry equal visual weight: same size, same fill,
       same contrast. Only the hue differs (EDPB guidance / UOOU practice). */
    '.jh-btn-accept{background:#a8ff3e;color:#0a0a0a}' +
    '.jh-btn-accept:hover{background:#bcff6e}' +
    '.jh-btn-reject{background:#efeee8;color:#0a0a0a}' +
    '.jh-btn-reject:hover{background:#fff}' +
    '.jh-btn-link{grid-column:1/-1;background:transparent;color:#989a92;border-color:transparent;' +
    'min-height:0;padding:6px 0 0;letter-spacing:.14em;text-decoration:underline;' +
    'text-underline-offset:3px}' +
    '.jh-btn-link:hover{color:#efeee8}' +
    '.jh-consent-cat{display:grid;grid-template-columns:1fr auto;gap:6px 14px;align-items:start;' +
    'padding:15px 0;border-top:1px solid rgba(255,255,255,.12)}' +
    '.jh-consent-cat strong{font-size:12.5px;font-weight:700;letter-spacing:.02em}' +
    '.jh-consent-cat span{grid-column:1/-1;font-size:12px;line-height:1.55;color:#8f918a}' +
    '.jh-consent-fixed{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;' +
    'color:#656860;padding-top:3px}' +
    '.jh-switch{position:relative;width:40px;height:23px;flex:0 0 auto}' +
    '.jh-switch input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}' +
    '.jh-switch i{position:absolute;inset:0;background:rgba(255,255,255,.14);border-radius:999px;' +
    'transition:background .18s ease;pointer-events:none}' +
    '.jh-switch i::after{content:"";position:absolute;top:3px;left:3px;width:17px;height:17px;' +
    'border-radius:50%;background:#efeee8;transition:transform .18s ease}' +
    '.jh-switch input:checked+i{background:#a8ff3e}' +
    '.jh-switch input:checked+i::after{transform:translateX(17px);background:#0a0a0a}' +
    '.jh-switch input:focus-visible+i{outline:2px solid #a8ff3e;outline-offset:2px}' +
    '.jh-consent-manage{background:none;border:0;padding:0;font:inherit;color:inherit;' +
    'cursor:pointer;text-decoration:underline;text-underline-offset:3px}' +
    '@media (max-width:520px){.jh-consent{left:12px;right:12px;width:auto}' +
    '.jh-consent-in{padding:16px}.jh-consent p{font-size:11.5px}.jh-consent-row{grid-template-columns:1fr 1fr}}';

  function injectCSS() {
    var s = document.createElement("style");
    s.setAttribute("data-jh-consent", "");
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------- UI ---------- */

  var root = null;

  function close() {
    if (!root) return;
    root.removeAttribute("data-open");
    var node = root;
    root = null;
    setTimeout(function () {
      if (node && node.parentNode) node.parentNode.removeChild(node);
    }, 300);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function button(cls, label, onClick) {
    var b = el("button", cls, label);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }

  function mount() {
    if (root) return;
    root = el("aside", "jh-consent");
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "false");
    root.setAttribute("aria-label", t.prefsTitle);
    document.body.appendChild(root);
    requestAnimationFrame(function () {
      if (root) root.setAttribute("data-open", "1");
    });
  }

  function renderBanner() {
    mount();
    root.textContent = "";
    var box = el("div", "jh-consent-in");
    box.appendChild(el("h2", null, t.title));
    box.appendChild(el("p", null, t.body));

    var row = el("div", "jh-consent-row");
    row.appendChild(button("jh-btn-accept", t.accept, function () {
      persist({ analytics: true, marketing: true });
      close();
    }));
    row.appendChild(button("jh-btn-reject", t.reject, function () {
      persist({ analytics: false, marketing: false });
      close();
    }));
    row.appendChild(button("jh-btn-link", t.settings, renderPrefs));
    box.appendChild(row);
    root.appendChild(box);

    var focusTarget = box.querySelector(".jh-btn-accept");
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }

  function category(key, checked, locked) {
    var c = t.cats[key];
    var wrap = el("div", "jh-consent-cat");
    wrap.appendChild(el("strong", null, c.name));

    if (locked) {
      wrap.appendChild(el("div", "jh-consent-fixed", c.always));
    } else {
      var sw = el("label", "jh-switch");
      var input = document.createElement("input");
      input.type = "checkbox";
      input.checked = !!checked;
      input.setAttribute("data-cat", key);
      input.setAttribute("aria-label", c.name);
      sw.appendChild(input);
      sw.appendChild(el("i"));
      wrap.appendChild(sw);
    }

    wrap.appendChild(el("span", null, c.desc));
    return wrap;
  }

  function renderPrefs() {
    mount();
    var saved = read() || { analytics: false, marketing: false };
    root.textContent = "";

    var box = el("div", "jh-consent-in");
    box.appendChild(el("h2", null, t.prefsTitle));
    box.appendChild(category("necessary", true, true));
    box.appendChild(category("analytics", saved.analytics, false));
    box.appendChild(category("marketing", saved.marketing, false));

    var row = el("div", "jh-consent-row");
    row.style.marginTop = "18px";
    row.appendChild(button("jh-btn-accept", t.save, function () {
      var picked = {};
      Array.prototype.forEach.call(box.querySelectorAll("input[data-cat]"), function (i) {
        picked[i.getAttribute("data-cat")] = i.checked;
      });
      persist(picked);
      close();
    }));
    row.appendChild(button("jh-btn-reject", t.back, function () {
      if (read()) close();
      else renderBanner();
    }));
    box.appendChild(row);
    root.appendChild(box);

    var focusTarget = box.querySelector("input[data-cat]");
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }

  /* Withdrawal must stay as easy as giving consent, so every footer gets a
     link back into the preferences panel. */
  function addFooterLink() {
    var footer = document.querySelector("footer");
    if (!footer || footer.querySelector(".jh-consent-manage")) return;
    var b = button("jh-consent-manage", t.manage, renderPrefs);
    var holder = el("div");
    holder.style.cssText = "flex-basis:100%;margin-top:10px;font-size:11px;opacity:.72";
    holder.appendChild(b);
    footer.appendChild(holder);
  }

  function init() {
    injectCSS();
    addFooterLink();
    if (!read()) renderBanner();
  }

  window.jhConsent = { open: renderPrefs };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
