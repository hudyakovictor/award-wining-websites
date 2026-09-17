/**
 * Логика страницы раздела: прогресс модуля, фильтр по типу блока, отметки.
 * Сами блоки напечатаны в HTML генератором — JS только оживляет.
 */
import { BLOCKS, MODULES, pad } from './data/plan.js';
import { initReveal } from './core/reveal.js';
import { initSplits } from './core/split.js';
import { initMagnetic } from './core/magnetic.js';
import { initScroll } from './core/scroll.js';
import { initDock } from './core/dock.js';
import { initCursor } from './core/cursor.js';
import { isDone, toggleDone } from './core/state.js';

const id = document.body.dataset.section;
const mod = MODULES.find((m) => m.id === id);
const rows = () => [...document.querySelectorAll('[data-blockrow]')];

const paint = () => {
  let done = 0;
  rows().forEach((r) => {
    const isComplete = isDone(Number(r.dataset.id));
    r.dataset.done = String(isComplete);
    const btn = r.querySelector('[data-done-toggle]');
    btn?.setAttribute('aria-pressed', String(isComplete));
    if (isComplete) done += 1;
  });
  const total = rows().length;
  const num = document.querySelector('[data-section-done]');
  const bar = document.querySelector('[data-section-bar]');
  if (num) num.textContent = done;
  if (bar) bar.style.width = `${total ? (done / total) * 100 : 0}%`;
};

const applyFilter = (tag) => {
  let visible = 0;
  rows().forEach((r) => {
    const show = tag === 'all' || r.dataset.tag === tag;
    r.hidden = !show;
    if (show) visible += 1;
  });
  const counter = document.querySelector('[data-filtered]');
  if (counter) counter.textContent = pad(visible);
};

document.querySelector('[data-chips]')?.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-filter-tag]');
  if (!chip) return;
  document.querySelectorAll('[data-filter-tag]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
  applyFilter(chip.dataset.filterTag);
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-done-toggle]');
  if (!btn) return;
  toggleDone(Number(btn.dataset.doneToggle));
  paint();
});

if (!mod) console.warn(`раздел ${id} не найден в plan.js`);
initScroll();
initDock();
paint();
initSplits();
initReveal();
initMagnetic();
initCursor();
