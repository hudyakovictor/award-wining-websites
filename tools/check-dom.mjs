#!/usr/bin/env node
/**
 * Смоук-тест интерфейса: грузим реальные страницы в jsdom,
 * исполняем настоящие модули (app.js / lesson.js) и проверяем поведение.
 * Запуск: npm run test
 */
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { BLOCKS, moduleOf, pad } from '../assets/js/data/plan.js';
import { CHECKLIST } from '../assets/js/data/checklists.js';

const errors = [];
const assert = (cond, msg) => (cond ? console.log(`  ✓ ${msg}`) : (errors.push(msg), console.log(`  ✗ ${msg}`)));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const load = async (file, search = '') => {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const dom = new JSDOM(html, { url: `http://localhost:3000/${file.replace('index.html', '')}${search}`, pretendToBeVisual: true });
  const { window } = dom;

  // то, чего нет в jsdom
  window.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { this.cb([{ isIntersecting: true, target: el }], this); }
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = (q) => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {} });

  // performance не трогаем: jsdom-реализация вызывает глобальный performance.now() → рекурсия
  for (const k of ['window', 'document', 'location', 'localStorage', 'matchMedia', 'IntersectionObserver',
    'requestAnimationFrame', 'cancelAnimationFrame', 'scrollY', 'innerWidth', 'innerHeight']) {
    globalThis[k] = window[k];
  }
  // navigator в Node 22 — getter-only, переопределяем явно
  Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
  globalThis.addEventListener = window.addEventListener.bind(window);
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  return { window, document: window.document };
};

/* ---------- главная: план, фильтры, прогресс ---------- */
console.log('\n[index.html]');
{
  const { document } = await load('index.html');
  await import(new URL('../assets/js/app.js', import.meta.url));
  await wait(2200);

  const cards = () => [...document.querySelectorAll('[data-card]')];
  assert(cards().length === BLOCKS.length, `отрисовано ${cards().length} карточек блоков`);
  assert(document.querySelectorAll('[data-module-block]').length === 11, 'отрисовано 11 модулей');
  assert(document.querySelectorAll('[data-reveal].is-in').length > 0, 'reveal сработал (появились .is-in)');
  assert(document.querySelector('[data-marquee]').children.length === 22, 'marquee продублирован (22 элемента)');
  assert(document.querySelector('[data-preloader]').hasAttribute('data-done'), 'preloader завершён');
  assert(document.querySelector('[data-stat-blocks]').textContent === '99', 'счётчик блоков = 99');

  // фильтр по модулю
  document.querySelector('[data-filter-module="M02"]').dispatchEvent(new globalThis.window.MouseEvent('click', { bubbles: true }));
  const visible = cards().filter((c) => !c.hidden);
  assert(visible.length === 9, `фильтр M02 оставил ${visible.length} карточек`);
  assert(visible.every((c) => c.dataset.module === 'M02'), 'в выдаче только блоки M02');
  assert(document.querySelector('[data-filtered]').textContent === '09', 'счётчик выдачи обновился (09)');

  // поиск
  document.querySelector('[data-filter-module="all"]').dispatchEvent(new globalThis.window.MouseEvent('click', { bubbles: true }));
  const input = document.querySelector('[data-search]');
  input.value = 'шейдер';
  input.dispatchEvent(new globalThis.window.Event('input', { bubbles: true }));
  const found = cards().filter((c) => !c.hidden);
  assert(found.length > 0 && found.every((c) => /шейдер/i.test(c.textContent)), `поиск «шейдер» → ${found.length} совпадений`);

  // отметка прогресса
  input.value = '';
  input.dispatchEvent(new globalThis.window.Event('input', { bubbles: true }));
  const btn = document.querySelector('[data-done-toggle="46"]');
  btn.dispatchEvent(new globalThis.window.MouseEvent('click', { bubbles: true }));
  assert(btn.closest('[data-card]').dataset.done === 'true', 'блок 46 отмечен пройденным');
  assert(document.querySelector('[data-stat-done]').textContent === '01', 'прогресс = 01');
  assert(JSON.parse(globalThis.localStorage.getItem('aw2026.v1')).done.includes(46), 'прогресс записан в localStorage');

  // аккордеон модуля
  const toggle = document.querySelector('[data-module-toggle="M05"]');
  toggle.dispatchEvent(new globalThis.window.MouseEvent('click', { bubbles: true }));
  assert(document.querySelector('[data-module-block="M05"]').hasAttribute('data-open'), 'модуль M05 раскрыт');
  assert(document.querySelector('[data-module-count]') !== null, 'у модулей есть счётчик готовности');
}

/* ---------- урок ---------- */
console.log('\n[blocks/lesson.html?block=46]');
{
  const { document } = await load('blocks/lesson.html', '?block=46');
  await import(new URL('../assets/js/lesson.js', import.meta.url));
  await wait(300);

  const b = BLOCKS.find((x) => x.id === 46);
  assert(document.querySelector('[data-l-title]').textContent === b.t, `заголовок урока = «${b.t}»`);
  assert(document.querySelector('[data-l-thesis]').textContent === b.d, 'тезис блока подставлен');
  assert(document.querySelector('[data-l-module]').textContent.startsWith('M06'), `модуль = ${moduleOf(46).id}`);
  const expected = CHECKLIST[b.tag].length;
  assert(document.querySelectorAll('[data-checklist] label').length === expected, `чек-лист «${b.tag}»: ${expected} пунктов`);
  assert(document.querySelector('[data-pager] a[href="lesson.html?block=47"]') !== null, 'пейджер ведёт на блок 47');
  assert(document.querySelector('[data-stage-inner] [data-lab-puck]') !== null, 'демо motion-lab смонтировано');
  assert(document.title.startsWith('46 ·'), `title = ${document.title}`);

  // чек-лист сохраняется
  const box = document.querySelector('[data-check]');
  box.checked = true;
  box.dispatchEvent(new globalThis.window.Event('change', { bubbles: true }));
  assert(JSON.parse(globalThis.localStorage.getItem('aw2026.v1')).checks['b46.0'] === true, 'отметка чек-листа сохранена');
}

if (errors.length) {
  console.error(`\nОШИБКИ (${errors.length}):`);
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  process.exit(1);
}
console.log(`\nPASS — интерфейс курса ведёт себя как задумано (пример блока: ${pad(46)}).`);
// rAF-цикл (курсор, magnetic, preloader) держит event loop — выходим явно
process.exit(0);
