// Keep the articles readable as a list until the topic picker is ready.
(() => {
  const topics = document.querySelector('#role .ac-roles');
  if (!topics) return;
  const articles = Array.from(topics.children);
  const picker = document.createElement('fieldset');
  picker.className = 'ac-picker';
  const legend = document.createElement('legend');
  legend.textContent = topics.dataset.pickerLabel;
  picker.append(legend);

  function selectTopic(selected) {
    articles.forEach((article, index) => { article.hidden = index !== selected; });
  }

  articles.forEach((article, index) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'agentic-topic';
    input.checked = index === 0;
    article.id = 'agentic-topic-' + index;
    input.setAttribute('aria-controls', article.id);
    input.addEventListener('change', () => selectTopic(index));
    const name = document.createElement('span');
    name.textContent = article.querySelector('h3').textContent;
    label.append(input, name);
    picker.append(label);
  });

  topics.prepend(picker);
  topics.classList.add('ac-explorer');
  selectTopic(0);
})();
