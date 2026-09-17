/**
 * Dock — сквозная навигация по 11 разделам с превью раздела.
 * Рендерится на каждой странице; активный раздел берётся из body[data-section].
 * Клавиши [ и ] — предыдущий/следующий раздел.
 */
import { MODULES, BLOCKS, pad } from '../data/plan.js';
import { isDone, subscribe } from './state.js';

const blocksOf = (m) => BLOCKS.filter((b) => b.id >= m.from && b.id <= m.to);
const doneOf = (m) => blocksOf(m).filter((b) => isDone(b.id)).length;

export const initDock = () => {
  const host = document.querySelector('[data-dock]');
  if (!host) return;

  const base = host.dataset.dockBase ?? '';
  const activeId = document.body.dataset.section || '';
  const index = MODULES.findIndex((m) => m.id === activeId);
  const prev = MODULES[index - 1];
  const next = MODULES[index + 1];

  const item = (m) => {
    const all = blocksOf(m);
    const ready = doneOf(m);
    const flags = [
      m.id === activeId ? 'data-active' : '',
      ready === all.length ? 'data-complete' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `
      <div class="dock__item" ${flags}>
        <a class="dock__link" href="${base}sections/${m.id}.html"
           aria-label="Раздел ${m.id} — ${m.name}: ${ready} из ${all.length} блоков пройдено"${
             m.id === activeId ? ' aria-current="true"' : ''
           }>${m.id.slice(1)}</a>
        <div class="dock__preview">
          <span class="u-mono">${m.id} · блоки ${pad(m.from)}–${pad(m.to)} · пройдено ${ready}/${all.length}</span>
          <b>${m.name}</b>
          <p>${m.note}</p>
          <span class="modcard__bar"><i style="width:${(ready / all.length) * 100}%"></i></span>
          <span class="u-mono">артефакт: ${m.out}</span>
        </div>
      </div>`;
  };

  const step = (m, arrow, label) =>
    m
      ? `<a href="${base}sections/${m.id}.html" aria-label="${label}: ${m.id} ${m.name}">${arrow}</a>`
      : `<span aria-hidden="true">${arrow}</span>`;

  const render = () => {
    const done = BLOCKS.filter((b) => isDone(b.id)).length;
    const pct = Math.round((done / BLOCKS.length) * 100);

    host.innerHTML = `
      <a class="dock__home" href="${base}index.html" aria-label="На главную курса">AW</a>
      <span class="dock__ring" style="--p:${pct}%" role="img" aria-label="Пройдено ${pct}% курса"><i>${pct}</i></span>
      ${MODULES.map(item).join('')}
      <span class="dock__nav">
        ${step(prev, '←', 'Предыдущий раздел')}
        ${step(next, '→', 'Следующий раздел')}
      </span>`;
  };

  render();
  subscribe(render);

  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.activeElement?.matches('input, textarea')) return;
    if (e.key === '[' && prev) location.href = `${base}sections/${prev.id}.html`;
    if (e.key === ']' && next) location.href = `${base}sections/${next.id}.html`;
  });
};
