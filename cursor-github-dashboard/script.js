const root = document.documentElement;
const commandBackdrop = document.querySelector('[data-command-backdrop]');
const commandInput = document.querySelector('[data-command-input]');
const modalBackdrop = document.querySelector('[data-modal-backdrop]');
const modalTitle = document.querySelector('#modal-title');
const modalCopy = document.querySelector('[data-modal-copy]');
const modalInput = document.querySelector('#repo-url');
const sidebar = document.querySelector('.sidebar');
const toast = document.querySelector('[data-toast]');

const modalContent = {
  open: {
    title: 'Nová žádost',
    copy: 'Pojmenujte svůj záměr. V dalším kroku vyberete vhodný program.',
    label: 'Název záměru',
    placeholder: 'Např. studentská mobilita 2026'
  },
  clone: {
    title: 'Najít program',
    copy: 'Napište, čeho chcete v mezinárodním vzdělávání dosáhnout.',
    label: 'Váš záměr',
    placeholder: 'Např. studijní pobyt v zahraničí'
  },
  ssh: {
    title: 'Domluvit konzultaci',
    copy: 'Stručně popište téma. Spojíme vás se správným odborníkem DZS.',
    label: 'Téma konzultace',
    placeholder: 'Např. podmínky výzvy Erasmus+'
  }
};

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem('dzs-hub-theme', theme);
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#000000' : '#F9F7F2';
}

setTheme(localStorage.getItem('dzs-hub-theme') || 'light');

document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

function openCommand() {
  commandBackdrop.hidden = false;
  requestAnimationFrame(() => commandInput.focus());
}

function closeCommand() {
  commandBackdrop.hidden = true;
  commandInput.value = '';
  filterCommands('');
}

function filterCommands(query) {
  const normalized = query.trim().toLowerCase();
  document.querySelectorAll('.command-results button').forEach((button) => {
    button.hidden = normalized && !button.textContent.toLowerCase().includes(normalized);
  });
}

document.querySelector('[data-command-open]').addEventListener('click', openCommand);
commandInput.addEventListener('input', (event) => filterCommands(event.target.value));
commandBackdrop.addEventListener('click', (event) => {
  if (event.target === commandBackdrop) closeCommand();
});

function openModal(type = 'clone') {
  closeCommand();
  const content = modalContent[type] || modalContent.clone;
  modalTitle.textContent = content.title;
  modalCopy.textContent = content.copy;
  modalInput.previousElementSibling.textContent = content.label;
  modalInput.placeholder = content.placeholder;
  modalInput.value = '';
  modalBackdrop.hidden = false;
  requestAnimationFrame(() => modalInput.focus());
}

function closeModal() {
  modalBackdrop.hidden = true;
}

document.querySelectorAll('[data-modal]').forEach((button) => {
  button.addEventListener('click', () => openModal(button.dataset.modal));
});
document.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', closeModal));
modalBackdrop.addEventListener('click', (event) => {
  if (event.target === modalBackdrop) closeModal();
});

document.querySelector('[data-modal-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  closeModal();
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 3200);
});

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.project-row').forEach((row) => {
      row.hidden = button.dataset.filter !== 'all' && row.dataset.kind !== button.dataset.filter;
    });
  });
});

document.querySelectorAll('.project-row').forEach((row) => {
  row.addEventListener('click', () => {
    const project = row.querySelector('strong').textContent;
    toast.querySelector('strong').textContent = `Otevírám ${project}`;
    toast.classList.add('visible');
    window.setTimeout(() => toast.classList.remove('visible'), 2600);
  });
});

document.querySelector('[data-menu-toggle]').addEventListener('click', () => sidebar.classList.toggle('open'));
document.querySelectorAll('.sidebar a').forEach((link) => link.addEventListener('click', () => sidebar.classList.remove('open')));

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openCommand();
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'o') {
    event.preventDefault();
    openModal(event.shiftKey ? 'clone' : 'open');
  }
  if (event.key === 'Escape') {
    if (!modalBackdrop.hidden) closeModal();
    else if (!commandBackdrop.hidden) closeCommand();
    else sidebar.classList.remove('open');
  }
});
