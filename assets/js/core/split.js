/**
 * Разбивает текст на строки в масках (блок 14, kinetic type).
 * Разметка: <h1 data-split>Текст</h1> → набор .line-mask > span.
 */
export const splitLines = (el) => {
  const text = el.dataset.splitText ?? el.textContent.trim();
  el.textContent = '';
  el.setAttribute('aria-label', text);

  const words = text.split(' ');
  const measure = document.createElement('span');
  measure.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;';
  el.appendChild(measure);

  const lines = [];
  let line = [];

  words.forEach((word) => {
    const candidate = [...line, word].join(' ');
    measure.textContent = candidate;
    const fits = measure.offsetWidth <= el.clientWidth || line.length === 0;
    if (fits) line.push(word);
    else {
      lines.push(line.join(' '));
      line = [word];
    }
  });
  if (line.length) lines.push(line.join(' '));
  measure.remove();

  lines.forEach((l, i) => {
    const mask = document.createElement('span');
    mask.className = 'line-mask';
    mask.style.setProperty('--i', i);
    mask.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.textContent = l;
    mask.appendChild(inner);
    el.appendChild(mask);
  });

  return lines.length;
};

export const initSplits = (root = document) =>
  [...root.querySelectorAll('[data-split]')].forEach(splitLines);
