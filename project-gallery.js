/* Homepage previews: native videos first, labelled tabs as an enhancement. */
(() => {
  const english = document.documentElement.lang === 'en';
  const stacked = window.matchMedia('(max-width:900px)');

  document.querySelectorAll('[data-project-gallery]').forEach((gallery) => {
    const panels = [...gallery.querySelectorAll(':scope > .media-frame')];
    if (panels.length < 2) return;
    const project = gallery.closest('section').id;
    const picker = document.createElement('div');
    picker.className = 'project-gallery-picker';
    const heading = document.createElement('div');
    heading.className = 'project-gallery-heading';
    const label = document.createElement('span');
    label.textContent = english ? 'Project previews' : 'Ukázky projektu';
    const count = document.createElement('span');
    count.setAttribute('aria-hidden', 'true');
    heading.append(label, count);
    const tabs = document.createElement('div');
    tabs.className = 'project-gallery-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', label.textContent);
    tabs.style.setProperty('--preview-count', panels.length);
    picker.append(heading, tabs);

    let selected = 0;
    const buttons = panels.map((panel, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'project-gallery-tab';
      button.id = `${project}-preview-tab-${index + 1}`;
      button.setAttribute('role', 'tab');
      panel.id = `${project}-preview-${index + 1}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', button.id);
      panel.tabIndex = 0;
      button.setAttribute('aria-controls', panel.id);
      const poster = document.createElement('img');
      poster.src = panel.querySelector('video').poster;
      poster.alt = '';
      poster.width = 720;
      poster.height = 405;
      poster.loading = 'lazy';
      poster.decoding = 'async';
      const caption = document.createElement('span');
      caption.className = 'project-gallery-tab-label';
      caption.textContent = panel.querySelector('figcaption').textContent.trim();
      button.append(poster, caption);
      button.addEventListener('click', () => select(index));
      tabs.append(button);
      return button;
    });

    function select(index, focus = false) {
      selected = index;
      panels.forEach((panel, i) => {
        panel.hidden = i !== selected;
        if (panel.hidden) panel.querySelector('video').pause();
        buttons[i].setAttribute('aria-selected', String(i === selected));
        buttons[i].tabIndex = i === selected ? 0 : -1;
      });
      count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
      if (focus) buttons[index].focus({ preventScroll: true });
    }

    tabs.addEventListener('keydown', (event) => {
      let index = selected;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') index = (selected + 1) % panels.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') index = (selected - 1 + panels.length) % panels.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = panels.length - 1;
      else return;
      event.preventDefault();
      select(index, true);
    });

    const orient = () => tabs.setAttribute('aria-orientation', stacked.matches ? 'horizontal' : 'vertical');
    orient();
    stacked.addEventListener('change', orient);
    gallery.append(picker);
    gallery.classList.add('is-enhanced');
    select(0);
  });
})();
