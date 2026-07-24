(() => {
  const page = document.querySelector('.shopify-conversion-page, .shopify-inquiry-page');
  if (!page) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  const track = (event, details = {}) => {
    const payload = { event, ...details };
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
    window.dispatchEvent(new CustomEvent('shopify:track', { detail: payload }));
  };

  document.querySelectorAll('[data-track]').forEach((element) => {
    element.addEventListener('click', () => track('cta_click', {
      label: element.dataset.track,
      destination: element.getAttribute('href') || element.getAttribute('type') || ''
    }));
  });

  const journey = document.querySelector('.conversion-journey');
  if (journey) {
    const journeyLinks = Array.from(journey.querySelectorAll('[data-journey-target]'));
    const journeySections = journeyLinks
      .map((link) => ({ link, section: document.getElementById(link.dataset.journeyTarget) }))
      .filter((item) => item.section);

    const activateJourney = (activeLink) => {
      journeyLinks.forEach((link) => {
        const active = link === activeLink;
        link.classList.toggle('is-active', active);
        if (active) {
          link.setAttribute('aria-current', 'location');
          if (journey.scrollWidth > journey.clientWidth) {
            const left = link.offsetLeft - (journey.clientWidth - link.offsetWidth) / 2;
            journey.scrollTo({ left, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
          }
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    if (journeySections.length) activateJourney(journeySections[0].link);
    if ('IntersectionObserver' in window) {
      const journeyObserver = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const match = visible && journeySections.find((item) => item.section === visible.target);
        if (match) activateJourney(match.link);
      }, { rootMargin: '-24% 0px -62% 0px', threshold: [0, .08, .2] });
      journeySections.forEach((item) => journeyObserver.observe(item.section));
    }
  }

  if (finePointer.matches && !reduceMotion.matches) {
    let pointerFrame = 0;
    document.addEventListener('pointermove', (event) => {
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        const section = event.target instanceof Element ? event.target.closest('section') : null;
        if (section) {
          const rect = section.getBoundingClientRect();
          section.style.setProperty('--work-x', `${((event.clientX - rect.left) / rect.width * 100).toFixed(2)}%`);
          section.style.setProperty('--work-y', `${((event.clientY - rect.top) / rect.height * 100).toFixed(2)}%`);
        }
        pointerFrame = 0;
      });
    }, { passive: true });

    document.querySelectorAll('.media-frame').forEach((frame) => {
      let mediaFrame = 0;
      frame.addEventListener('pointermove', (event) => {
        cancelAnimationFrame(mediaFrame);
        mediaFrame = requestAnimationFrame(() => {
          const rect = frame.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          frame.style.setProperty('--media-rx', `${(-y * 2.2).toFixed(2)}deg`);
          frame.style.setProperty('--media-ry', `${(x * 2.2).toFixed(2)}deg`);
        });
      }, { passive: true });
      frame.addEventListener('pointerleave', () => {
        frame.style.removeProperty('--media-rx');
        frame.style.removeProperty('--media-ry');
      });
    });
  }

  const videos = [...document.querySelectorAll('.media-frame video')];
  if ('IntersectionObserver' in window && videos.length) {
    const visibleVideos = new Set();
    const syncVideo = (video) => {
      if (document.hidden || !visibleVideos.has(video) || reduceMotion.matches) {
        video.pause();
        return;
      }
      video.play().catch(() => {});
    };
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleVideos.add(entry.target);
        else visibleVideos.delete(entry.target);
        syncVideo(entry.target);
      });
    }, { rootMargin: '80px 0px', threshold: 0.2 });
    videos.forEach((video) => videoObserver.observe(video));
    document.addEventListener('visibilitychange', () => videos.forEach(syncVideo));
  }

  const diagnosticRoot = document.querySelector('[data-diagnostic]');
  const diagnosticLive = diagnosticRoot?.querySelector('.diagnostic-live');
  const diagnosticFallback = diagnosticRoot?.querySelector('.diagnostic-fallback');
  const stepLabel = document.querySelector('[data-diagnostic-step]');
  const progress = document.querySelector('[data-diagnostic-progress]');

  const questions = [
    {
      key: 'status',
      title: 'V jaké fázi je váš projekt?',
      hint: 'Vyberte možnost, která nejlépe popisuje současný stav.',
      options: [
        ['new', 'Připravuji nový e-shop'],
        ['existing', 'Mám existující Shopify e-shop'],
        ['migration', 'Přecházím z jiné platformy']
      ]
    },
    {
      key: 'need',
      title: 'Co potřebujete vyřešit především?',
      hint: 'Podle této odpovědi vyberu hlavní doporučenou cestu.',
      options: [
        ['redesign', 'Nový e-shop nebo redesign'],
        ['liquid', 'Úpravu šablony nebo vlastní funkci'],
        ['integrace', 'Integraci, Shopify Plus nebo B2B'],
        ['sprava', 'Opravu, správu nebo postupný rozvoj'],
        ['konzultace', 'Nejdřív potřebuji určit správný postup']
      ]
    },
    {
      key: 'platform',
      title: 'Na jaké platformě e-shop nyní běží?',
      hint: 'Pokud jde o nový projekt, vyberte poslední možnost.',
      options: [
        ['shopify', 'Shopify nebo Shopify Plus'],
        ['shoptet', 'Shoptet'],
        ['woocommerce', 'WooCommerce'],
        ['other', 'Jiná platforma'],
        ['none', 'Zatím žádná']
      ]
    },
    {
      key: 'scope',
      title: 'Jak velkou změnu očekáváte?',
      hint: 'Nemusíte znát přesný rozsah, stačí nejlepší odhad.',
      options: [
        ['small', 'Jedna konkrétní oprava nebo funkce'],
        ['medium', 'Více souvisejících úprav'],
        ['large', 'Redesign nebo rozsáhlejší projekt'],
        ['unknown', 'Rozsah potřebuji nejprve určit']
      ]
    },
    {
      key: 'timing',
      title: 'Kdy chcete projekt začít řešit?',
      hint: 'Výsledek diagnostiky můžete rovnou přenést do poptávky.',
      options: [
        ['now', 'Co nejdříve'],
        ['quarter', 'Během 1–3 měsíců'],
        ['later', 'Později, zatím připravuji zadání']
      ]
    }
  ];

  const recommendations = {
    redesign: {
      title: 'Nejdřív si ujasněte rozsah nového e-shopu nebo redesignu.',
      text: 'Doporučuji začít kontrolou současného stavu, priorit zákazníků a obsahu. Z toho lze odvodit, co zachovat, co změnit a jak projekt rozdělit.',
      type: 'redesign',
      links: [
        ['/shopify-pruvodce/shopify-sablona-a-redesign/', 'Kdy šablona nestačí'],
        ['/shopify-pruvodce/cena-shopify-eshopu/', 'Co určuje cenu projektu']
      ]
    },
    liquid: {
      title: 'Nejvhodnější bude cílená úprava šablony nebo vlastní funkce.',
      text: 'Pošlete URL e-shopu, popis současného chování a požadovaný výsledek. Nejdřív ověřím, zda stačí úprava šablony, nebo je vhodnější jiné řešení.',
      type: 'liquid',
      links: [
        ['/shopify-pruvodce/shopify-sablona-a-redesign/', 'Šablona a vývoj na míru'],
        ['/shopify-pruvodce/rychlost-shopify-eshopu/', 'Výkon Shopify e-shopu']
      ]
    },
    integrace: {
      title: 'Začněte technickým posouzením funkce a datových vazeb.',
      text: 'U integrací je důležité popsat požadovaný výsledek, zapojené systémy a odpovědnost za data. Teprve potom lze bezpečně zvolit aplikaci nebo vývoj.',
      type: 'integrace',
      links: [
        ['/shopify-pruvodce/shopify-aplikace-a-integrace/', 'Aplikace a integrace'],
        ['/shopify-pruvodce/shopify-plus-b2b-d2c/', 'Shopify Plus a B2B']
      ]
    },
    sprava: {
      title: 'Dává smysl začít technickou kontrolou konkrétního požadavku.',
      text: 'Připravte URL e-shopu, prioritu a informaci o posledních změnách. Podle toho lze určit, zda jde o jednorázovou opravu, nebo dlouhodobější práci.',
      type: 'sprava',
      links: [
        ['/shopify-pruvodce/sprava-a-podpora-shopify/', 'Správa a podpora Shopify'],
        ['/shopify-pruvodce/shopify-seo/', 'Technické Shopify SEO']
      ]
    },
    konzultace: {
      title: 'Nejdřív společně vymezíme problém a realistický další krok.',
      text: 'Nemusíte mít hotové technické zadání. Stačí popsat současný stav, obchodní cíl a to, co dnes zákazníky nebo tým nejvíc omezuje.',
      type: 'konzultace',
      links: [
        ['/shopify-pruvodce/', 'Projít Shopify průvodce'],
        ['/shopify-pruvodce/shopify-vs-shoptet-vs-woocommerce/', 'Porovnání platforem']
      ]
    }
  };

  if (diagnosticRoot && diagnosticLive && diagnosticFallback) {
    const answers = {};
    let currentQuestion = 0;

    const setProgress = (index) => {
      if (stepLabel) stepLabel.textContent = String(Math.min(index + 1, questions.length)).padStart(2, '0');
      if (progress) progress.style.width = `${Math.min((index + 1) / questions.length * 100, 100)}%`;
    };

    const renderQuestion = () => {
      const question = questions[currentQuestion];
      diagnosticLive.replaceChildren();
      const title = document.createElement('h3');
      title.textContent = question.title;
      const hint = document.createElement('p');
      hint.textContent = question.hint;
      const options = document.createElement('div');
      options.className = 'diagnostic-options';

      question.options.forEach(([value, label], index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'diagnostic-option';
        button.dataset.value = value;
        button.innerHTML = `<i>${String(index + 1).padStart(2, '0')}</i><span></span><b aria-hidden="true">→</b>`;
        button.querySelector('span').textContent = label;
        button.addEventListener('click', () => {
          answers[question.key] = value;
          currentQuestion += 1;
          if (currentQuestion < questions.length) {
            setProgress(currentQuestion);
            renderQuestion();
          } else {
            renderResult();
          }
        });
        options.append(button);
      });

      diagnosticLive.append(title, hint, options);
    };

    const renderResult = () => {
      const recommendation = recommendations[answers.need] || recommendations.konzultace;
      const readableSummary = questions.map((question) => {
        const selected = question.options.find(([value]) => value === answers[question.key]);
        return `${question.title} ${selected ? selected[1] : 'Neuvedeno'}`;
      }).join(' | ');
      const label = document.createElement('span');
      label.className = 'diagnostic-result-label';
      label.textContent = 'Doporučený další krok';
      const title = document.createElement('h3');
      title.textContent = recommendation.title;
      const text = document.createElement('p');
      text.textContent = recommendation.text;
      const links = document.createElement('div');
      links.className = 'diagnostic-result-links';
      recommendation.links.forEach(([href, titleText]) => {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = `${titleText} →`;
        links.append(link);
      });
      const actions = document.createElement('div');
      actions.className = 'diagnostic-result-actions';
      const inquiry = document.createElement('a');
      inquiry.href = `/shopify-poptavka/?typ=${encodeURIComponent(recommendation.type)}&zdroj=diagnostika&souhrn=${encodeURIComponent(readableSummary)}`;
      inquiry.textContent = 'Přenést výsledek do poptávky →';
      inquiry.addEventListener('click', () => track('diagnostic_to_inquiry', { type: recommendation.type }));
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'diagnostic-reset';
      reset.textContent = 'Začít znovu';
      reset.addEventListener('click', () => {
        Object.keys(answers).forEach((key) => delete answers[key]);
        currentQuestion = 0;
        setProgress(0);
        renderQuestion();
        track('diagnostic_restart');
      });
      actions.append(inquiry, reset);
      diagnosticLive.replaceChildren(label, title, text, links, actions);
      setProgress(questions.length - 1);
      track('diagnostic_complete', { type: recommendation.type });
    };

    diagnosticFallback.hidden = true;
    diagnosticLive.hidden = false;
    setProgress(0);
    renderQuestion();
    if ('IntersectionObserver' in window) {
      const diagnosticObserver = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        track('diagnostic_open');
        diagnosticObserver.disconnect();
      }, { threshold: 0.2 });
      diagnosticObserver.observe(diagnosticRoot);
    }
  }

  const forms = document.querySelectorAll('.project-form');
  forms.forEach((form) => {
    const status = form.querySelector('[data-form-status]');
    const params = new URLSearchParams(window.location.search);
    const projectType = form.elements.namedItem('project_type');
    const source = form.elements.namedItem('source');
    const summary = form.elements.namedItem('diagnostic_summary');
    let formStarted = false;

    if (projectType && params.get('typ')) projectType.value = params.get('typ');
    if (source) source.value = params.get('zdroj') || form.dataset.formContext || 'web';
    if (summary) summary.value = params.get('souhrn') || '';

    form.addEventListener('input', (event) => {
      if (event.target instanceof HTMLElement) event.target.removeAttribute('aria-invalid');
      if (!formStarted) {
        formStarted = true;
        track('form_start', { source: source?.value || 'web' });
      }
    });

    form.addEventListener('invalid', (event) => {
      if (event.target instanceof HTMLElement) event.target.setAttribute('aria-invalid', 'true');
    }, true);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) {
        if (status) {
          status.textContent = 'Doplňte prosím povinná pole.';
          status.className = 'form-status is-error';
        }
        return;
      }

      const data = new FormData(form);
      if (data.get('_gotcha')) return;
      const submit = form.querySelector('button[type="submit"]');
      const endpoint = form.dataset.formspreeEndpoint;
      if (submit) submit.disabled = true;
      if (status) {
        status.textContent = 'Připravuji odeslání…';
        status.className = 'form-status';
      }
      track('form_submit_attempt', { source: data.get('source') || 'web' });

      if (endpoint && endpoint.startsWith('https://formspree.io/f/')) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            body: data,
            headers: { Accept: 'application/json' }
          });
          if (!response.ok) throw new Error('Form service rejected the request');
          form.reset();
          if (status) {
            status.textContent = 'Děkuji. Poptávka byla odeslána a ozvu se s dalším postupem.';
            status.className = 'form-status is-success';
          }
          track('form_complete', { source: data.get('source') || 'web' });
        } catch {
          if (status) {
            status.textContent = 'Odeslání se nepodařilo. Použijte prosím přímý e-mail uvedený vedle formuláře.';
            status.className = 'form-status is-error';
          }
          track('form_error', { source: data.get('source') || 'web' });
        } finally {
          if (submit) submit.disabled = false;
        }
        return;
      }

      const labels = {
        name: 'Jméno', email: 'E-mail', company: 'Firma nebo značka', store_url: 'URL e-shopu', platform: 'Současná platforma',
        project_type: 'Typ projektu', timing: 'Požadovaný termín', budget: 'Rámcový rozpočet', message: 'Popis projektu',
        source: 'Zdroj poptávky', diagnostic_summary: 'Souhrn diagnostiky'
      };
      const body = [...data.entries()]
        .filter(([key, value]) => key !== '_gotcha' && String(value).trim())
        .map(([key, value]) => `${labels[key] || key}:\n${String(value).trim()}`)
        .join('\n\n');
      const subject = `Shopify poptávka – ${data.get('company') || data.get('name')}`;
      if (status) {
        status.textContent = 'Otevírám připravený e-mail. Pokud se neotevře, napište na jakub.hrncir24@gmail.com.';
        status.className = 'form-status is-success';
      }
      track('form_mailto_fallback', { source: data.get('source') || 'web' });
      window.location.href = `mailto:jakub.hrncir24@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (submit) submit.disabled = false;
    });
  });
})();
