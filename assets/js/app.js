/**
 * Boot страницы курса. Порядок = порядок чтения (блок 49).
 */
import { COURSE, MODULES, BLOCKS, TAG_LABEL, moduleOf, pad } from './data/plan.js';
import { onFrame } from './core/raf.js';
import { initCursor } from './core/cursor.js';
import { initMagnetic } from './core/magnetic.js';
import { initReveal } from './core/reveal.js';
import { initSplits } from './core/split.js';
import { initScroll } from './core/scroll.js';
import { isDone, toggleDone, toggleOpen, isOpen, progress, subscribe, reset } from './core/state.js';

const filters = { module: 'all', tag: 'all', q: '' };

/* ---------- preloader: счётчик 0→99, затем выход сцены ---------- */
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

/* ---------- рендер плана ---------- */
const cardTemplate = (b) => {
  const done = isDone(b.id);
  return `
  <article class="card" data-card data-id="${b.id}" data-tag="${b.tag}" data-module="${moduleOf(b.id).id}" data-done="${done}">
    <div class="card__top">
      <span class="card__num">${pad(b.id)}</span>
      <span class="card__tag">${TAG_LABEL[b.tag]}</span>
    </div>
    <h3 class="card__title">${b.t}</h3>
    <p class="card__desc">${b.d}</p>
    <div class="card__foot">
      <a class="card__cta" href="blocks/lesson.html?block=${pad(b.id)}">открыть блок ↗</a>
      <button class="done" type="button" data-done-toggle="${b.id}" aria-pressed="${done}" aria-label="Отметить блок ${pad(b.id)}">✓</button>
    </div>
  </article>`;
};

const moduleTemplate = (m) => {
  const items = BLOCKS.filter((b) => b.id >= m.from && b.id <= m.to);
  return `
  <section class="module" data-module-block="${m.id}" ${isOpen(m.id) ? 'data-open' : ''}>
    <button class="module__head" type="button" data-module-toggle="${m.id}" aria-expanded="${isOpen(m.id)}">
      <span class="module__id">${m.id} · ${pad(m.from)}–${pad(m.to)}</span>
      <span>
        <span class="module__name">${m.name}</span>
        <span class="module__note">${m.note}</span>
      </span>
      <span class="cluster" style="flex-wrap:nowrap;gap:var(--sp-3)">
        <span class="u-mono" data-module-count></span>
        <span class="module__toggle u-mono">+</span>
      </span>
    </button>
    <div class="module__panel"><div>
      <p class="module__out">артефакт: ${m.out}</p>
      <div class="blocks">${items.map(cardTemplate).join('')}</div>
    </div></div>
  </section>`;
};

const renderPlan = () => {
  const host = document.querySelector('[data-plan]');
  if (!host) return;
  host.innerHTML = MODULES.map(moduleTemplate).join('');
};

/* ---------- фильтрация ---------- */
const applyFilters = () => {
  let visible = 0;
  document.querySelectorAll('[data-card]').forEach((card) => {
    const b = BLOCKS.find((x) => x.id === Number(card.dataset.id));
    const byModule = filters.module === 'all' || card.dataset.module === filters.module;
    const byTag = filters.tag === 'all' || card.dataset.tag === filters.tag;
    const q = filters.q.trim().toLowerCase();
    const byQuery = !q || `${pad(b.id)} ${b.t} ${b.d}`.toLowerCase().includes(q);
    const show = byModule && byTag && byQuery;
    card.hidden = !show;
    if (show) visible += 1;
  });

  // модуль без совпадений скрываем целиком
  document.querySelectorAll('[data-module-block]').forEach((section) => {
    const any = [...section.querySelectorAll('[data-card]')].some((c) => !c.hidden);
    section.hidden = !any;
  });

  const empty = document.querySelector('[data-empty]');
  if (empty) empty.hidden = visible !== 0;
  const counter = document.querySelector('[data-filtered]');
  if (counter) counter.textContent = pad(visible);
};

/* ---------- счётчики статистики ---------- */
const animateNumber = (el, to, suffix = '') => {
  let from = 0;
  const start = performance.now();
  const dur = 900;
  const step = (now) => {
    const k = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - k, 4);
    el.textContent = `${Math.round(from + (to - from) * eased)}${suffix}`;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

/* ---------- прогресс ---------- */
const syncStats = () => {
  const done = BLOCKS.filter((b) => isDone(b.id)).length;
  const pct = Math.round(progress(BLOCKS.length) * 100);
  const elDone = document.querySelector('[data-stat-done]');
  const elPct = document.querySelector('[data-stat-pct]');
  if (elDone) elDone.textContent = pad(done);
  if (elPct) elPct.textContent = `${pct}%`;
  document.querySelectorAll('[data-module-block]').forEach((section) => {
    const id = section.dataset.moduleBlock;
    const total = section.querySelectorAll('[data-card]').length;
    const ready = section.querySelectorAll('[data-card][data-done="true"]').length;
    const label = section.querySelector('[data-module-count]');
    if (label) label.textContent = `${ready}/${total}`;
  });
};

/* ---------- boot ---------- */
/* ---------- бегущая строка модулей (из того же источника данных) ---------- */
const renderMarquee = () => {
  const track = document.querySelector('[data-marquee]');
  if (!track) return;
  const items = MODULES.map((m) => `<span class="marquee__item">${m.id} ${m.name}</span>`).join('');
  track.innerHTML = items + items;
};

const init = async () => {
  initScroll();
  renderPlan();
  renderMarquee();
  syncStats();

  // chips модулей и тегов
  const chipsModules = document.querySelector('[data-chips-modules]');
  if (chipsModules) {
    chipsModules.innerHTML =
      `<button class="chip" type="button" data-filter-module="all" aria-pressed="true">все</button>` +
      MODULES.map((m) => `<button class="chip" type="button" data-filter-module="${m.id}" aria-pressed="false">${m.id}</button>`).join('');
  }
  const chipsTags = document.querySelector('[data-chips-tags]');
  if (chipsTags) {
    chipsTags.innerHTML =
      `<button class="chip" type="button" data-filter-tag="all" aria-pressed="true">все типы</button>` +
      Object.entries(TAG_LABEL)
        .map(([k, v]) => `<button class="chip" type="button" data-filter-tag="${k}" aria-pressed="false">${v}</button>`)
        .join('');
  }

  document.addEventListener('click', (e) => {
    const modChip = e.target.closest('[data-filter-module]');
    if (modChip) {
      filters.module = modChip.dataset.filterModule;
      document.querySelectorAll('[data-filter-module]').forEach((c) => (c.setAttribute('aria-pressed', String(c === modChip))));
      applyFilters();
    }

    const tagChip = e.target.closest('[data-filter-tag]');
    if (tagChip) {
      filters.tag = tagChip.dataset.filterTag;
      document.querySelectorAll('[data-filter-tag]').forEach((c) => (c.setAttribute('aria-pressed', String(c === tagChip))));
      applyFilters();
    }

    const toggle = e.target.closest('[data-module-toggle]');
    if (toggle) {
      const id = toggle.dataset.moduleToggle;
      toggleOpen(id);
      const section = document.querySelector(`[data-module-block="${id}"]`);
      const open = section.hasAttribute('data-open');
      if (open) section.removeAttribute('data-open');
      else section.setAttribute('data-open', '');
      toggle.setAttribute('aria-expanded', String(!open));
    }

    const doneBtn = e.target.closest('[data-done-toggle]');
    if (doneBtn) {
      const id = Number(doneBtn.dataset.doneToggle);
      const done = toggleDone(id);
      doneBtn.setAttribute('aria-pressed', String(done));
      doneBtn.closest('[data-card]').dataset.done = String(done);
      syncStats();
    }

    if (e.target.closest('[data-reset]')) {
      reset();
      document.querySelectorAll('[data-card]').forEach((c) => {
        c.dataset.done = 'false';
        c.querySelector('[data-done-toggle]')?.setAttribute('aria-pressed', 'false');
      });
      syncStats();
    }
  });

  const search = document.querySelector('[data-search]');
  search?.addEventListener('input', (e) => {
    filters.q = e.target.value;
    applyFilters();
  });

  addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== search) {
      e.preventDefault();
      search?.focus();
    }
    if (e.key === 'Escape') {
      search.value = '';
      filters.q = '';
      applyFilters();
      search.blur();
    }
  });

  subscribe(syncStats);

  // анимация чисел в шапке курса
  const n1 = document.querySelector('[data-stat-blocks]');
  const n2 = document.querySelector('[data-stat-modules]');
  if (n1) animateNumber(n1, COURSE.blocks);
  if (n2) animateNumber(n2, COURSE.modules);

  initSplits();
  initReveal();
  initMagnetic();
  initCursor();
  applyFilters();

  // первый модуль открыт по умолчанию — план должен быть виден сразу
  if (!isOpen('M01')) document.querySelector('[data-module-toggle="M01"]')?.click();

  await runPreloader();
  document.querySelector('[data-hero]')?.classList.add('is-in');
  initReveal();
};

init();
