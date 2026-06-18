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
    title: 'Otevřít projekt',
    copy: 'Zadejte cestu k lokální složce, kterou chcete otevřít.',
    label: 'Cesta ke složce',
    placeholder: '~/Documents/GitHub/muj-projekt'
  },
  clone: {
    title: 'Klonovat repozitář',
    copy: 'Vložte HTTPS nebo SSH adresu Git repozitáře.',
    label: 'URL repozitáře',
    placeholder: 'https://github.com/username/repository.git'
  },
  ssh: {
    title: 'Připojit přes SSH',
    copy: 'Zadejte vzdáleného hostitele a otevřete projekt přes zabezpečené spojení.',
    label: 'SSH hostitel',
    placeholder: 'user@example.com'
  }
};

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem('cursor-hub-theme', theme);
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#0d1117' : '#f6f8fa';
}

setTheme(localStorage.getItem('cursor-hub-theme') || 'dark');

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
