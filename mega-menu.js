/* Mega menu for the desktop header (main site and blog).
   The header keeps plain links, so everything works without this script.
   On wide screens Realizace / Služby / Průvodce get a panel: project cards
   with a screen from each live store, and for services and articles a
   preview that follows the item under the pointer or keyboard focus.
   Images load the first time a panel opens. */
(() => {
  const en = document.documentElement.lang === 'en';
  const S = '/assets/work/menu/';
  const ARTICLES = {"cs":{"/shopify-pruvodce/cena-shopify-eshopu/":["Kolik stojí Shopify e-shop v roce 2026?","Náklady","Co tvoří cenu platformy, šablony, aplikací, vývoje, testování a následné technické podpory.","5 min čtení","/assets/covers/cs-cena-shopify-eshopu-720.webp"],"/shopify-pruvodce/shopify-vs-shoptet-vs-woocommerce/":["Jak vybrat e-shopovou platformu: Shopify, Shoptet, nebo WooCommerce?","Platforma","Věcné srovnání pro český a slovenský e-shop podle provozu, rozvoje a mezinárodních ambicí.","5 min čtení","/assets/covers/cs-shopify-vs-shoptet-vs-woocommerce-720.webp"],"/shopify-pruvodce/shopify-aplikace-a-integrace/":["Shopify aplikace a integrace: jak vybrat řešení","Vývoj","Kdy stačí hotová aplikace, kdy upravit šablonu a kdy má smysl samostatné řešení nebo napojení.","5 min čtení","/assets/covers/cs-shopify-aplikace-a-integrace-720.webp"],"/shopify-pruvodce/shopify-sablona-a-redesign/":["Shopify šablona a redesign e-shopu","Návrh & vývoj","Rozdíl mezi úpravou šablony, vlastními sekcemi a redesignem, který zůstane rychlý a udržitelný.","5 min čtení","/assets/covers/cs-shopify-sablona-a-redesign-720.webp"],"/shopify-pruvodce/shopify-plus-b2b-d2c/":["Shopify B2B v roce 2026: kdy stačí běžný tarif a kdy Plus","Růst","Firmy, katalogy, individuální ceny a rozhodnutí, zda pokročilejší plán odpovídá skutečným potřebám.","4 min čtení","/assets/covers/cs-shopify-plus-b2b-d2c-720.webp"],"/shopify-pruvodce/migrace-na-shopify/":["Migrace na Shopify: data, SEO a bezpečné spuštění","Migrace","Data, SEO, integrace, doména a kontrolované spuštění při přechodu z WooCommerce, Shoptetu nebo jiného řešení.","5 min čtení","/assets/covers/cs-migrace-na-shopify-720.webp"],"/shopify-pruvodce/shopify-seo/":["Shopify SEO: praktický návod pro e-shopy","SEO","Technické základy, struktura obchodu, produkty, kolekce, metadata, robots.txt a měření v Search Console.","7 min čtení","/assets/covers/cs-shopify-seo-720.webp"],"/shopify-pruvodce/shopify-markets-expanze/":["Shopify Markets: expanze e-shopu do zahraničí","Expanze","Trhy, jazyky, domény, měny, lokální ceny, obsah a mezinárodní SEO před vstupem do nové země.","7 min čtení","/assets/covers/cs-shopify-markets-expanze-720.webp"],"/shopify-pruvodce/rychlost-shopify-eshopu/":["Jak zrychlit Shopify e-shop: Core Web Vitals","Výkon","Core Web Vitals, reálná data, Lighthouse a dopad šablony, aplikací, JavaScriptu, médií a analytiky.","7 min čtení","/assets/covers/cs-rychlost-shopify-eshopu-720.webp"],"/shopify-pruvodce/shopify-payments-cesko-slovensko/":["Shopify Payments v Česku a platby na Slovensku","Platby","Aktuální dostupnost, karty, zrychlené platby, externí poskytovatelé, poplatky a testování pokladny.","7 min čtení","/assets/covers/cs-shopify-payments-cesko-slovensko-720.webp"],"/shopify-pruvodce/sprava-a-podpora-shopify/":["Shopify podpora: vývojář, nebo agentura?","Správa","Rozdělení odpovědnosti mezi Shopify Support, autora šablony, aplikaci, samostatného vývojáře a agenturu.","6 min čtení","/assets/covers/cs-sprava-a-podpora-shopify-720.webp"],"/shopify-pruvodce/shopify-plus-cesky-trh/":["Shopify Plus pro český e-shop: cena a funkce (2026)","Velké e-shopy","Výhody, reálná cena, specifika českého trhu a zkušenosti z projektů Posedla a Facederma. Včetně novinek ze Spring '26 Edition.","10 min čtení","/assets/covers/cs-shopify-plus-cesky-trh-720.webp"],"/shopify-pruvodce/shopify-editions-spring-26/":["Shopify Editions Spring '26: co je nového pro e-shopy","Novinky","Agentic commerce, Sidekick, B2B nově i mimo Shopify Plus, POS v11 a další novinky z vydání 17. června 2026.","6 min čtení","/assets/covers/cs-shopify-editions-spring-26-720.webp"],"/shopify-pruvodce/shopify-agentic-commerce/":["Agentic commerce: jak nakupují AI agenti (2026)","AI","Jak funguje Universal Commerce Protocol a Shopify Catalog a co musí e-shop udělat, aby ho AI agenti našli.","6 min čtení","/assets/covers/cs-shopify-agentic-commerce-720.webp"],"/shopify-pruvodce/optimalizace-shopify-pro-ai-agenty/":["Optimalizace Shopify pro AI agenty: praktický postup","AI","Co nastavit v Shopify Catalogu, kategoriích, metafieldech, variantách a zásadách, aby agenti nabídku správně pochopili.","8 min čtení","/assets/covers/cs-optimalizace-shopify-pro-ai-agenty-720.webp"],"/shopify-pruvodce/ai-vyvoj-shopify/":["AI ve vývoji Shopify e-shopů: co změnil AI Toolkit","Vývoj","Co přinesl Shopify AI Toolkit, kde AI vývoj zrychluje a kde je pořád potřeba člověk. K dispozici i v angličtině.","6 min čtení","/assets/covers/cs-ai-vyvoj-shopify-720.webp"],"/shopify-pruvodce/shopify-functions-migrace/":["Shopify Scripts skončily: přechod na Functions","Pokladna","Scripts se 30. června 2026 přestaly vykonávat. Co to rozbilo, čím to nahradit a kdy je potřeba Plus. K dispozici i v angličtině.","6 min čtení","/assets/covers/cs-shopify-functions-migrace-720.webp"],"/shopify-pruvodce/shopify-vs-shoptet/":["Shopify vs. Shoptet 2026: srovnání pro český e-shop","Srovnání 2026","Tarify, lokální provoz, vývoj na míru, správa a expanze ve srovnání dvou hostovaných platforem.","7 min čtení","/assets/covers/cs-shopify-vs-shoptet-720.webp"],"/shopify-pruvodce/shopify-vs-woocommerce/":["Shopify vs. WooCommerce 2026: co vybrat pro e-shop","Srovnání 2026","Hostovaná platforma versus otevřený WordPress ekosystém z pohledu nákladů, údržby, výkonu a vývoje.","7 min čtení","/assets/covers/cs-shopify-vs-woocommerce-720.webp"],"/shopify-pruvodce/shopify-vs-upgates/":["Shopify vs. Upgates 2026: srovnání e-shopových řešení","Srovnání 2026","Lokálně zaměřené řešení a globální platforma podle tarifů, jazyků, designu, integrací a růstu.","6 min čtení","/assets/covers/cs-shopify-vs-upgates-720.webp"]},"en":{"/shopify-guide/shopify-store-cost/":["How Much Does a Shopify Store Cost in 2026?","Costs","What determines the cost of the platform, theme, apps, development, testing and ongoing support.","5 min reading","/assets/covers/en-shopify-store-cost-720.webp"],"/shopify-guide/shopify-vs-shoptet-vs-woocommerce/":["How to Choose an Ecommerce Platform: Shopify, Shoptet or WooCommerce","Platform","A practical comparison for Czech and Slovak stores based on operations, customisation and international plans.","5 min reading","/assets/covers/en-shopify-vs-shoptet-vs-woocommerce-720.webp"],"/shopify-guide/shopify-apps-integrations/":["Shopify Apps and Integrations: Choosing the Right Approach","Development","When a ready-made app is enough, when to modify a theme and when a custom integration makes sense.","5 min reading","/assets/covers/en-shopify-apps-integrations-720.webp"],"/shopify-guide/shopify-theme-redesign/":["Shopify Theme vs Custom Redesign: When to Upgrade","Design & development","The difference between theme changes, custom sections and a redesign that remains fast and maintainable.","5 min reading","/assets/covers/en-shopify-theme-redesign-720.webp"],"/shopify-guide/shopify-plus-b2b-d2c/":["Shopify B2B in 2026: Standard Plans vs Shopify Plus","Growth","Companies, catalogues, individual pricing and deciding whether a more advanced plan fits your real needs.","4 min reading","/assets/covers/en-shopify-plus-b2b-d2c-720.webp"],"/shopify-guide/migrate-to-shopify/":["Migrating to Shopify: Data, SEO and a Safer Launch","Migration","Data, SEO, integration, domain and controlled launch when switching from WooCommerce, Shoptet or another solution.","5 min reading","/assets/covers/en-migrate-to-shopify-720.webp"],"/shopify-guide/shopify-seo/":["Shopify SEO: What Shopify Handles and What You Control","SEO","Technical basics, store structure, products, collections, metadata, robots.txt and measurement in Search Console.","7 min reading","/assets/covers/en-shopify-seo-720.webp"],"/shopify-guide/shopify-markets-expansion/":["Shopify Markets: International Expansion for Online Stores","Expansion","Markets, languages, domains, currencies, local prices, content and international SEO before entering a new country.","7 min reading","/assets/covers/en-shopify-markets-expansion-720.webp"],"/shopify-guide/shopify-store-speed/":["How to Improve Shopify Store Speed and Core Web Vitals","Performance","Core Web Vitals, Real Data, Lighthouse and Impact of Themes, Apps, JavaScript, Media and Analytics.","7 min reading","/assets/covers/en-shopify-store-speed-720.webp"],"/shopify-guide/shopify-payments-czechia-slovakia/":["Shopify Payments in Czechia and Payment Options in Slovakia (2026)","Payments","Current availability, cards, accelerated payments, third-party providers, fees and checkout testing.","7 min reading","/assets/covers/en-shopify-payments-czechia-slovakia-720.webp"],"/shopify-guide/shopify-support-developer-agency/":["Shopify Support vs Developer vs Agency","Maintenance","How responsibility is divided between Shopify Support, a theme or app vendor, an independent developer and an agency.","6 min reading","/assets/covers/en-shopify-support-developer-agency-720.webp"],"/shopify-guide/shopify-plus-czech-market/":["Shopify Plus for Czech Stores in 2026: Features and Cost","Enterprise","Current pricing, B2B features, expansion stores, Czech market requirements and experience from the Posedla project.","8 min reading","/assets/covers/en-shopify-plus-czech-market-720.webp"],"/shopify-guide/shopify-editions-spring-26/":["Shopify Editions Spring '26: Key Updates for Merchants","News","Agentic commerce, Sidekick, wider B2B access, POS v11 and other updates from the 17 June 2026 release.","6 min reading","/assets/covers/en-shopify-editions-spring-26-720.webp"],"/shopify-guide/shopify-agentic-commerce/":["Agentic Commerce: AI Shopping on Shopify in 2026","AI","How Universal Commerce Protocol and Shopify Catalog work, and what a store needs for discovery by AI agents.","6 min reading","/assets/covers/en-shopify-agentic-commerce-720.webp"],"/shopify-guide/shopify-ai-agent-optimization/":["Optimising Shopify for AI Agents: A Practical Guide","AI","What to set up in Shopify Catalog, categories, metafields, variants and policies so agents understand your offer.","8 min reading","/assets/covers/en-shopify-ai-agent-optimization-720.webp"],"/shopify-guide/ai-shopify-development/":["AI in Shopify Development: What the AI Toolkit Changes","Development","What Shopify AI Toolkit can speed up and where experienced review, testing and architectural decisions still matter.","6 min reading","/assets/covers/en-ai-shopify-development-720.webp"],"/shopify-guide/shopify-functions-migration/":["Shopify Scripts Have Ended: Moving to Shopify Functions","Checkout","What stopped working after 30 June 2026, how to audit the old logic and when Shopify Functions require Plus.","6 min reading","/assets/covers/en-shopify-functions-migration-720.webp"],"/shopify-guide/shopify-vs-shoptet/":["Shopify vs Shoptet 2026 for Czech and Slovak Stores","2026 comparison","Plans, local operations, custom development, management and expansion across two hosted platforms.","7 min reading","/assets/covers/en-shopify-vs-shoptet-720.webp"],"/shopify-guide/shopify-vs-woocommerce/":["Shopify vs WooCommerce 2026: Which Should You Choose?","2026 comparison","A hosted platform and an open WordPress ecosystem compared by costs, maintenance, performance and development.","7 min reading","/assets/covers/en-shopify-vs-woocommerce-720.webp"],"/shopify-guide/shopify-vs-upgates/":["Shopify vs Upgates 2026: A Practical Comparison","2026 comparison","A locally focused solution and a global platform compared by plans, languages, design, integrations and growth.","6 min reading","/assets/covers/en-shopify-vs-upgates-720.webp"]}};
  const A = ARTICLES[en ? 'en' : 'cs'];
  const DATA = en ? {
    work: { title: 'Case studies', all: ['/en/#case-studies', 'All case studies'], cards: [
      ['/en/work/posedla/', 'Posedla', 'Shopify Plus across four markets', S + 'po-domov.webp'],
      ['/en/work/facederma/', 'Facederma', 'WooCommerce to Shopify Plus, B2B for salons', S + 'fd-domov.webp'],
      ['/en/work/bohemian/', 'Bohemian Coffee House', 'Theme and coffee data model', S + 'bc-domov.webp'],
      ['/en/work/molecules/', 'Molecules of Life', 'A new store for the German market', S + 'mo-domov.webp'],
      ['/en/work/peaceofalm/', 'Peace of Alm', 'Theme for certified baby skincare', S + 'pa-domov.webp'],
      ['/en/work/surprisedrinks/', 'Surprise Drinks', 'Brand site with mini-games', S + 'sd-domov.webp'],
    ] },
    services: { title: 'Services', all: ['/en/#shopify-development', 'All services'], cols: [
      { items: [
        ['/en/#shopify-development', 'New store or redesign', 'From first design to launch', S + 'pa-domov.webp', 'Example: Peace of Alm', 'A theme adapted to the brand, its labels and bundles.'],
        ['/en/#shopify-development', 'Theme and custom features', 'Liquid sections and changes', S + 'bc-produkt.webp', 'Example: Bohemian Coffee House', 'Coffee data in metafields drives filters, scales and labels.'],
        ['/en/#shopify-development', 'Integrations and B2B', 'Systems, Shopify Plus, wholesale', S + 'fd-salony.webp', 'Example: Facederma', 'Salon sign-up and a separate B2B branch with its own prices.'],
      ] },
      { items: [
        ['/shopify-plus/en/', 'Shopify Plus', 'When it pays off and what it costs', S + 'po-joyseat.webp', 'Example: Posedla', 'Plus with several markets, B2B and an ERP connection.'],
        ['/agentic-commerce/en/', 'Agentic commerce', 'Selling through AI agents', '/assets/covers/en-shopify-agentic-commerce-720.webp', 'Guide', 'Which AI channels can sell your products and what to prepare.'],
        ['mailto:jakub.hrncir24@gmail.com?subject=Shopify%20project', 'Start a project', 'Describe what you need', '/assets/jakub-hrncir-portrait-480.webp', 'Jakub Hrnčíř', 'Send a short brief. I reply with questions and a realistic next step.'],
      ] },
    ] },
    guide: { title: 'Guide', all: ['/shopify-guide/', 'All articles'], featured: '/shopify-guide/shopify-ai-agent-optimization/', cols: [
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
    work: { title: 'Realizace', all: ['/#projekty', 'Všechny realizace'], cards: [
      ['/realizace/posedla/', 'Posedla', 'Shopify Plus pro čtyři trhy', S + 'po-domov.webp'],
      ['/realizace/facederma/', 'Facederma', 'Z WooCommerce na Shopify Plus, B2B pro salony', S + 'fd-domov.webp'],
      ['/realizace/bohemian/', 'Bohemian Coffee House', 'Šablona a datový model kávy', S + 'bc-domov.webp'],
      ['/realizace/molecules/', 'Molecules of Life', 'Nový e-shop pro německý trh', S + 'mo-domov.webp'],
      ['/realizace/peaceofalm/', 'Peace of Alm', 'Šablona pro certifikovanou dětskou kosmetiku', S + 'pa-domov.webp'],
      ['/realizace/surprisedrinks/', 'Surprise Drinks', 'Web značky s minihrami', S + 'sd-domov.webp'],
    ] },
    services: { title: 'Služby', all: ['/#reseni', 'Všechny služby'], cols: [
      { items: [
        ['/#novy-eshop', 'Nový e-shop a redesign', 'Od návrhu po spuštění', S + 'pa-domov.webp', 'Ukázka: Peace of Alm', 'Šablona přizpůsobená značce, jejím štítkům a balíčkům.'],
        ['/#liquid-upravy', 'Šablona a vlastní funkce', 'Sekce v Liquidu a úpravy', S + 'bc-produkt.webp', 'Ukázka: Bohemian Coffee House', 'Údaje o kávě v metafieldech řídí filtry, stupnice i štítky.'],
        ['/#integrace', 'Integrace a B2B', 'Napojení systémů a velkoobchod', S + 'fd-salony.webp', 'Ukázka: Facederma', 'Registrace salonů a oddělená B2B větev s vlastními cenami.'],
        ['/#sprava', 'Správa a rozvoj', 'Opravy a průběžná vylepšení', S + 'po-domov.webp', 'Ukázka: Posedla', 'Po projektu v agentuře navázala přímá spolupráce se značkou.'],
      ] },
      { items: [
        ['/shopify-plus/', 'Shopify Plus', 'Kdy se vyplatí a kolik stojí', S + 'po-joyseat.webp', 'Ukázka: Posedla', 'Plus s více trhy, B2B a napojením na ERP.'],
        ['/agentic-commerce/', 'Agentic commerce', 'Prodej přes AI agenty', '/assets/covers/cs-shopify-agentic-commerce-720.webp', 'Průvodce', 'Které AI kanály mohou prodávat vaše produkty a co připravit.'],
        ['/shopify-poptavka/?zdroj=mega-menu', 'Poptat projekt', 'Krátký formulář', '/assets/jakub-hrncir-portrait-480.webp', 'Jakub Hrnčíř', 'Pošlete stručné zadání. Odpovím s otázkami a realistickým dalším krokem.'],
      ] },
    ] },
    guide: { title: 'Průvodce', all: ['/shopify-pruvodce/', 'Všechny články'], featured: '/shopify-pruvodce/optimalizace-shopify-pro-ai-agenty/', cols: [
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
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const here = location.pathname;
  const cur = (href) => (!href.includes('#') && href.split('?')[0] === here ? ' aria-current="page"' : '');
  // keep words like "e-shop" on one line
  const nb = (s) => esc(s).replace(/(\S*-\S+)/g, '<span class="mega-nb">$1</span>');
  const thumb = (src, cls = '') => `<span class="mega-thumb${cls}"><img data-src="${src}" alt="" width="640" height="400" decoding="async" /></span>`;
  const preview = (p) => `<div class="mega-preview" aria-hidden="true">${thumb(p.img, ' mega-preview-img')}<p class="mega-preview-meta">${esc(p.meta)}</p><p class="mega-preview-title">${esc(p.title)}</p><p class="mega-preview-text">${esc(p.text)}</p></div>`;

  // Preview content for every link that has one, by href.
  const previews = {};
  DATA.services.cols.forEach((c) => c.items.forEach(([href, t, , img, meta, text]) => { previews[href + '|' + t] = { img, meta, title: t, text }; }));
  Object.entries(A).forEach(([href, [title, topic, desc, time, img]]) => { previews[href] = { img, meta: `${topic} · ${time}`, title, text: desc }; });

  const build = (key, d) => {
    if (key === 'work') {
      const cards = d.cards.map(([href, t, sub, img]) => `<li><a class="mega-card" href="${href}"${cur(href)}>${thumb(img)}<span class="mega-card-text"><span>${nb(t)}</span><small>${esc(sub)}</small></span></a></li>`).join('');
      return `<div class="mega-inner mega-work"><ul class="mega-cards">${cards}</ul><a class="mega-all" href="${d.all[0]}">${d.all[1]} <span aria-hidden="true">→</span></a></div>`;
    }
    const cols = d.cols.map((c) => `<div class="mega-col">${c.head ? `<p class="mega-head">${c.head}</p>` : ''}<ul>${
      c.items.map(([href, t, sub]) => {
        const pk = key === 'services' ? href + '|' + t : href;
        return `<li><a href="${href}" data-preview="${esc(pk)}"${cur(href)}><span>${nb(t)}</span>${sub ? `<small>${esc(sub)}</small>` : ''}</a></li>`;
      }).join('')}</ul></div>`).join('');
    const first = key === 'guide' ? previews[d.featured] : previews[d.cols[0].items[0][0] + '|' + d.cols[0].items[0][1]];
    return `<div class="mega-inner mega-split mega-${key}"><div class="mega-cols">${cols}</div>${preview(first)}<a class="mega-all" href="${d.all[0]}">${d.all[1]} <span aria-hidden="true">→</span></a></div>`;
  };

  const panels = [];
  let openItem = null, timer = 0;
  const setPreview = (panel, pk) => {
    const p = previews[pk];
    const box = panel.querySelector('.mega-preview');
    if (!p || !box || box.dataset.key === pk) return;
    box.dataset.key = pk;
    const img = box.querySelector('img');
    img.src = p.img;
    box.querySelector('.mega-preview-meta').textContent = p.meta;
    box.querySelector('.mega-preview-title').textContent = p.title;
    box.querySelector('.mega-preview-text').textContent = p.text;
    box.classList.remove('is-swapping'); void box.offsetWidth; box.classList.add('is-swapping');
  };
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
    item.panel.querySelectorAll('img[data-src]').forEach((i) => { i.src = i.dataset.src; i.removeAttribute('data-src'); });
    if (item.reset) setPreview(item.panel, item.reset);
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
    panel.innerHTML = build(key, d);
    header.append(panel);
    const item = { key, link, toggle, panel, reset: key === 'guide' ? d.featured : key === 'services' ? d.cols[0].items[0][0] + '|' + d.cols[0].items[0][1] : null };
    if (item.reset) panel.querySelector('.mega-preview').dataset.key = item.reset;
    panels.push(item);

    toggle.addEventListener('click', () => (openItem === item ? close(false) : open(item)));
    const enter = () => { if (!wide.matches) return; clearTimeout(timer); timer = setTimeout(() => open(item), 120); };
    const leave = () => { if (!wide.matches) return; clearTimeout(timer); timer = setTimeout(() => { if (openItem === item) close(false); }, 220); };
    [link, toggle].forEach((el) => { el.addEventListener('mouseenter', enter); el.addEventListener('mouseleave', leave); });
    panel.addEventListener('mouseenter', () => clearTimeout(timer)); panel.addEventListener('mouseleave', leave);
    panel.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
    const follow = (e) => { const a = e.target.closest('a[data-preview]'); if (a) setPreview(panel, a.dataset.preview); };
    panel.addEventListener('pointerover', follow);
    panel.addEventListener('focusin', follow);
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openItem) close(true); });
  document.addEventListener('click', (e) => { if (openItem && !header.contains(e.target)) close(false); });
  header.addEventListener('focusout', (e) => { if (openItem && !header.contains(e.relatedTarget)) close(false); });
  wide.addEventListener('change', () => close(false));
})();
