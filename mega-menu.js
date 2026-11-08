/* Mega menu for the desktop header (main site and blog).
   The header keeps plain links, so everything works without this script.
   On wide screens Realizace / Služby / Průvodce get a panel listing every
   subpage. It opens on hover with a short delay, on click of the small
   toggle beside the link, and closes on Escape, outside click or leaving. */
(() => {
  const en = document.documentElement.lang === 'en';
  const DATA = en ? {
    work: { title: 'Case studies', all: ['/en/#case-studies', 'All case studies'], cols: [
      { items: [
        ['/en/work/posedla/', 'Posedla', 'Shopify Plus across four markets'],
        ['/en/work/facederma/', 'Facederma', 'WooCommerce to Shopify Plus, B2B for salons'],
        ['/en/work/bohemian/', 'Bohemian Coffee House', 'Theme and coffee data model'],
      ] },
      { items: [
        ['/en/work/molecules/', 'Molecules of Life', 'A new store for the German market'],
        ['/en/work/peaceofalm/', 'Peace of Alm', 'Theme for certified baby skincare'],
        ['/en/work/surprisedrinks/', 'Surprise Drinks', 'Brand site with mini-games'],
      ] },
    ] },
    services: { title: 'Services', all: ['/en/#shopify-development', 'All services'], cols: [
      { items: [
        ['/en/#shopify-development', 'New store or redesign', 'From first design to launch'],
        ['/en/#shopify-development', 'Theme and custom features', 'Liquid sections and changes'],
        ['/en/#shopify-development', 'Integrations and B2B', 'Systems, Shopify Plus, wholesale'],
      ] },
      { items: [
        ['/shopify-plus/en/', 'Shopify Plus', 'When it pays off and what it costs'],
        ['/agentic-commerce/en/', 'Agentic commerce', 'Selling through AI agents'],
        ['mailto:jakub.hrncir24@gmail.com?subject=Shopify%20project', 'Start a project', 'Describe what you need'],
      ] },
    ] },
    guide: { title: 'Guide', all: ['/shopify-guide/', 'All articles'], cols: [
      { head: 'Platform and cost', items: [
        ['/shopify-guide/shopify-vs-shoptet/', 'Shopify vs Shoptet'],
        ['/shopify-guide/shopify-vs-woocommerce/', 'Shopify vs WooCommerce'],
        ['/shopify-guide/shopify-vs-upgates/', 'Shopify vs Upgates'],
        ['/shopify-guide/shopify-store-cost/', 'What a Shopify store costs'],
      ] },
      { head: 'Build and run', items: [
        ['/shopify-guide/shopify-theme-redesign/', 'Theme vs custom redesign'],
        ['/shopify-guide/migrate-to-shopify/', 'Migrating to Shopify'],
        ['/shopify-guide/shopify-functions-migration/', 'Scripts to Functions'],
        ['/shopify-guide/shopify-apps-integrations/', 'Apps and integrations'],
      ] },
      { head: 'Growth', items: [
        ['/shopify-guide/shopify-plus-czech-market/', 'Shopify Plus for Czech stores'],
        ['/shopify-guide/shopify-plus-b2b-d2c/', 'Shopify B2B'],
        ['/shopify-guide/shopify-markets-expansion/', 'Shopify Markets'],
        ['/shopify-guide/shopify-payments-czechia-slovakia/', 'Payments in CZ and SK'],
      ] },
      { head: 'Search, speed and AI', items: [
        ['/shopify-guide/shopify-ai-agent-optimization/', 'Optimising for AI agents'],
        ['/shopify-guide/shopify-agentic-commerce/', 'Agentic commerce'],
        ['/shopify-guide/shopify-seo/', 'Shopify SEO'],
        ['/shopify-guide/shopify-store-speed/', 'Store speed'],
      ] },
    ] },
  } : {
    work: { title: 'Realizace', all: ['/#projekty', 'Všechny realizace'], cols: [
      { items: [
        ['/realizace/posedla/', 'Posedla', 'Shopify Plus pro čtyři trhy'],
        ['/realizace/facederma/', 'Facederma', 'Z WooCommerce na Shopify Plus, B2B pro salony'],
        ['/realizace/bohemian/', 'Bohemian Coffee House', 'Šablona a datový model kávy'],
      ] },
      { items: [
        ['/realizace/molecules/', 'Molecules of Life', 'Nový e-shop pro německý trh'],
        ['/realizace/peaceofalm/', 'Peace of Alm', 'Šablona pro certifikovanou dětskou kosmetiku'],
        ['/realizace/surprisedrinks/', 'Surprise Drinks', 'Web značky s minihrami'],
      ] },
    ] },
    services: { title: 'Služby', all: ['/#reseni', 'Všechny služby'], cols: [
      { items: [
        ['/#novy-eshop', 'Nový e-shop a redesign', 'Od návrhu po spuštění'],
        ['/#liquid-upravy', 'Šablona a vlastní funkce', 'Sekce v Liquidu a úpravy'],
        ['/#integrace', 'Integrace a B2B', 'Napojení systémů a velkoobchod'],
        ['/#sprava', 'Správa a rozvoj', 'Opravy a průběžná vylepšení'],
      ] },
      { items: [
        ['/shopify-plus/', 'Shopify Plus', 'Kdy se vyplatí a kolik stojí'],
        ['/agentic-commerce/', 'Agentic commerce', 'Prodej přes AI agenty'],
        ['/shopify-poptavka/?zdroj=mega-menu', 'Poptat projekt', 'Krátký formulář'],
      ] },
    ] },
    guide: { title: 'Průvodce', all: ['/shopify-pruvodce/', 'Všechny články'], cols: [
      { head: 'Platforma a cena', items: [
        ['/shopify-pruvodce/shopify-vs-shoptet/', 'Shopify vs. Shoptet'],
        ['/shopify-pruvodce/shopify-vs-woocommerce/', 'Shopify vs. WooCommerce'],
        ['/shopify-pruvodce/shopify-vs-upgates/', 'Shopify vs. Upgates'],
        ['/shopify-pruvodce/cena-shopify-eshopu/', 'Kolik stojí Shopify e-shop'],
      ] },
      { head: 'Vývoj a provoz', items: [
        ['/shopify-pruvodce/shopify-sablona-a-redesign/', 'Kdy šablona nestačí'],
        ['/shopify-pruvodce/migrace-na-shopify/', 'Migrace na Shopify'],
        ['/shopify-pruvodce/shopify-functions-migrace/', 'Ze Scripts na Functions'],
        ['/shopify-pruvodce/sprava-a-podpora-shopify/', 'Kdo opraví Shopify e-shop'],
      ] },
      { head: 'Růst', items: [
        ['/shopify-pruvodce/shopify-plus-cesky-trh/', 'Shopify Plus pro český e-shop'],
        ['/shopify-pruvodce/shopify-plus-b2b-d2c/', 'Shopify B2B'],
        ['/shopify-pruvodce/shopify-markets-expanze/', 'Shopify Markets'],
        ['/shopify-pruvodce/shopify-payments-cesko-slovensko/', 'Platby v ČR a SR'],
      ] },
      { head: 'Vyhledávání, rychlost a AI', items: [
        ['/shopify-pruvodce/optimalizace-shopify-pro-ai-agenty/', 'Optimalizace pro AI agenty'],
        ['/shopify-pruvodce/shopify-agentic-commerce/', 'Agentic commerce'],
        ['/shopify-pruvodce/shopify-seo/', 'Shopify SEO'],
        ['/shopify-pruvodce/rychlost-shopify-eshopu/', 'Rychlost e-shopu'],
      ] },
    ] },
  };

  const header = document.querySelector('.nav-wrap, .guide-header');
  const nav = header?.querySelector('#primary-navigation, #guide-navigation');
  if (!header || !nav) return;
  const wide = window.matchMedia('(min-width:1024px) and (hover:hover)');
  const keyOf = (a) => {
    if (a.hasAttribute('lang') || a.classList.contains('guide-language-link') || a.classList.contains('mobile-nav-only')) return null;
    const h = a.getAttribute('href') || '';
    if (/#projekty|#case-studies/.test(h)) return 'work';
    if (/#reseni|#shopify-development/.test(h)) return 'services';
    if (/shopify-pruvodce\/?$|shopify-guide\/?$/.test(h)) return 'guide';
    return null;
  };

  const panels = [];
  let openItem = null, timer = 0;
  const close = (focusToggle) => {
    if (!openItem) return;
    openItem.panel.hidden = true;
    openItem.toggle.setAttribute('aria-expanded', 'false');
    header.classList.remove('mega-open');
    if (focusToggle) openItem.toggle.focus();
    openItem = null;
  };
  const open = (item) => {
    if (openItem === item) return;
    close(false);
    item.panel.hidden = false;
    item.toggle.setAttribute('aria-expanded', 'true');
    header.classList.add('mega-open');
    openItem = item;
  };

  [...nav.querySelectorAll(':scope > a')].forEach((link) => {
    const key = keyOf(link); if (!key) return;
    const d = DATA[key];
    const id = `mega-${key}`;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mega-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', id);
    toggle.setAttribute('aria-label', (en ? 'Show ' : 'Zobrazit: ') + d.title);
    link.after(toggle);
    link.classList.add('has-mega');

    const panel = document.createElement('div');
    panel.className = 'mega-panel';
    panel.id = id;
    panel.hidden = true;
    const cols = d.cols.map((c) => `<div class="mega-col">${c.head ? `<p class="mega-head">${c.head}</p>` : ''}<ul>${
      c.items.map(([href, t, sub]) => `<li><a href="${href}"><span>${t}</span>${sub ? `<small>${sub}</small>` : ''}</a></li>`).join('')}</ul></div>`).join('');
    panel.innerHTML = `<div class="mega-inner mega-${key}"><div class="mega-cols">${cols}</div><a class="mega-all" href="${d.all[0]}">${d.all[1]} <span aria-hidden="true">→</span></a></div>`;
    header.append(panel);
    const item = { key, link, toggle, panel };
    panels.push(item);

    toggle.addEventListener('click', () => (openItem === item ? close(false) : open(item)));
    const enter = () => { if (!wide.matches) return; clearTimeout(timer); timer = setTimeout(() => open(item), 120); };
    const leave = () => { if (!wide.matches) return; clearTimeout(timer); timer = setTimeout(() => { if (openItem === item) close(false); }, 220); };
    [link, toggle].forEach((el) => { el.addEventListener('mouseenter', enter); el.addEventListener('mouseleave', leave); });
    panel.addEventListener('mouseenter', () => clearTimeout(timer)); panel.addEventListener('mouseleave', leave);
    panel.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openItem) close(true); });
  document.addEventListener('click', (e) => { if (openItem && !header.contains(e.target)) close(false); });
  header.addEventListener('focusout', (e) => { if (openItem && !header.contains(e.relatedTarget)) close(false); });
  wide.addEventListener('change', () => close(false));
})();
