/**
 * Главная курса: 11 разделов, глобальный поиск по 99 блокам, прогресс.
 * Порядок инициализации = порядок чтения (блок 49).
 */
import { COURSE, MODULES, BLOCKS, TAG_LABEL, moduleOf, pad } from './data/plan.js';
import { onFrame } from './core/raf.js';
import { initCursor } from './core/cursor.js';
import { initMagnetic } from './core/magnetic.js';
import { initReveal } from './core/reveal.js';
import { initSplits } from './core/split.js';
import { initScroll } from './core/scroll.js';
import { initDock } from './core/dock.js';
import { isDone, progress, reset, subscribe } from './core/state.js';

let query = '';

/* ---------- preloader: счётчик до 99, затем выход сцены (блок 77) ---------- */
const runPreloader = () =>
  new Promise((resolve) => {
    const box = document.querySelector('[data-preloader]');
    const num = document.querySelector('[data-preloader-count]');
    const bar = document.querySelector('[data-preloader-bar]');
    if (!box) return resolve();

    const total = BLOCKS.length;
    let value = 0;
    const stop = onFrame(({ dt }) => {
      value = Math.min(total, value + dt * 140);
      if (num) num.textContent = pad(Math.round(value));
      if (bar) bar.style.width = `${(value / total) * 100}%`;
      if (value >= total) {
        stop();
        box.dataset.done = '';
        setTimeout(resolve, 420);
      }
    });
  });

/* ---------- разделы ---------- */
const cardTemplate = (m) => {
  const blocks = BLOCKS.filter((b) => b.id >= m.from && b.id <= m.to);
  return `
  <a class="modcard" href="sections/${m.id}.html" data-module-card="${m.id}" data-reveal>
    <span class="modcard__id u-mono"><b>${m.id}</b> блоки ${pad(m.from)}–${pad(m.to)}</span>
    <h2 class="modcard__name">${m.name}</h2>
    <p class="modcard__note">${m.note}</p>
    <p class="modcard__out u-mono">артефакт: ${m.out}</p>
    <span class="modcard__bar"><i data-module-bar="${m.id}"></i></span>
    <span class="modcard__foot">
      <span class="u-mono"><span data-module-done="${m.id}">0</span> / ${blocks.length} блоков</span>
      <span class="u-mono">открыть раздел →</span>
    </span>
  </a>`;
};

const renderSections = () => {
  const host = document.querySelector('[data-sections]');
  if (host) host.innerHTML = MODULES.map(cardTemplate).join('');
};

/* ---------- глобальный поиск: разделы + конкретные блоки ---------- */
const matches = (b, q) => `${pad(b.id)} ${b.t} ${b.d} ${moduleOf(b.id).name}`.toLowerCase().includes(q);

const renderResults = () => {
  const host = document.querySelector('[data-results]');
  if (!host) return;
  const q = query.trim().toLowerCase();
  if (!q) {
    host.hidden = true;
    host.innerHTML = '';
    return;
  }
  const all = BLOCKS.filter((b) => matches(b, q));
  const hits = all.slice(0, 8);
  host.hidden = false;
  host.innerHTML = hits.length
    ? `<p class="u-mono">найдено блоков: ${all.length}</p>` +
      hits
        .map(
          (b) => `<a href="blocks/lesson.html?block=${pad(b.id)}">
            <span class="u-mono">${moduleOf(b.id).id} · ${pad(b.id)}</span>
            <b>${b.t}</b>
            <span>${TAG_LABEL[b.tag]}</span>
          </a>`,
        )
        .join('') +
      (all.length > hits.length ? `<p class="u-mono">показаны первые ${hits.length}</p>` : '')
    : `<p class="u-mono">по запросу «${query}» блоков нет</p>`;
};

const applyFilter = () => {
  const q = query.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll('[data-module-card]').forEach((card) => {
    const m = MODULES.find((x) => x.id === card.dataset.moduleCard);
    const blocks = BLOCKS.filter((b) => b.id >= m.from && b.id <= m.to);
    const hit = !q || `${m.id} ${m.name} ${m.note} ${m.out}`.toLowerCase().includes(q) || blocks.some((b) => matches(b, q));
    card.hidden = !hit;
    if (hit) visible += 1;
  });
  const counter = document.querySelector('[data-sections-count]');
  if (counter) counter.textContent = pad(visible);
  renderResults();
};

/* ---------- прогресс ---------- */
const syncProgress = () => {
  MODULES.forEach((m) => {
    const blocks = BLOCKS.filter((b) => b.id >= m.from && b.id <= m.to);
    const done = blocks.filter((b) => isDone(b.id)).length;
    const num = document.querySelector(`[data-module-done="${m.id}"]`);
    const bar = document.querySelector(`[data-module-bar="${m.id}"]`);
    if (num) num.textContent = done;
    if (bar) bar.style.width = `${(done / blocks.length) * 100}%`;
  });

  const done = BLOCKS.filter((b) => isDone(b.id)).length;
  const pct = Math.round(progress(BLOCKS.length) * 100);
  const elDone = document.querySelector('[data-stat-done]');
  const elPct = document.querySelector('[data-stat-pct]');
  if (elDone) elDone.textContent = pad(done);
  if (elPct) elPct.textContent = `${pct}%`;
};

/* ---------- счётчики в hero ---------- */
const animateNumber = (el, to) => {
  const start = performance.now();
  const dur = 900;
  const step = (now) => {
    const k = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

/* ---------- marquee ---------- */
const renderMarquee = () => {
  const track = document.querySelector('[data-marquee]');
  if (!track) return;
  const items = MODULES.map((m) => `<span class="marquee__item">${m.id} ${m.name}</span>`).join('');
  track.innerHTML = items + items;
};

/* ---------- boot ---------- */
const init = async () => {
  initScroll();
  initDock();
  renderSections();
  renderMarquee();
  syncProgress();

  const search = document.querySelector('[data-search]');
  search?.addEventListener('input', (e) => {
    query = e.target.value;
    applyFilter();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-reset]')) return;
    reset();
    syncProgress();
  });

  addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== search) {
      e.preventDefault();
      search?.focus();
    }
    if (e.key === 'Escape' && search) {
      search.value = '';
      query = '';
      applyFilter();
      search.blur();
    }
  });

  subscribe(syncProgress);

  const n1 = document.querySelector('[data-stat-blocks]');
  const n2 = document.querySelector('[data-stat-modules]');
  if (n1) animateNumber(n1, COURSE.blocks);
  if (n2) animateNumber(n2, COURSE.modules);

  applyFilter();
  initSplits();
  initReveal();
  initMagnetic();
  initCursor();

  await runPreloader();
  document.querySelector('[data-hero]')?.classList.add('is-in');
  initReveal();
};

init();
