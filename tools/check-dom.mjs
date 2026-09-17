#!/usr/bin/env node
/**
 * Смоук-тест интерфейса: грузим реальные страницы в jsdom,
 * исполняем настоящие модули (app.js / section.js / lesson.js) и проверяем поведение.
 * Запуск: npm run test
 */
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { BLOCKS, MODULES, moduleOf, pad } from '../assets/js/data/plan.js';
import { CHECKLIST } from '../assets/js/data/checklists.js';

const errors = [];
const assert = (cond, msg) => (cond ? console.log(`  ✓ ${msg}`) : (errors.push(msg), console.log(`  ✗ ${msg}`)));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const click = (el) => el.dispatchEvent(new globalThis.window.MouseEvent('click', { bubbles: true }));
const type = (el, value) => {
  el.value = value;
  el.dispatchEvent(new globalThis.window.Event('input', { bubbles: true }));
};

const load = async (file, search = '') => {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const url = `http://localhost:3000/${file.replace('index.html', '')}${search}`;
  const dom = new JSDOM(html, { url, pretendToBeVisual: true });
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

/* ---------- главная: разделы и глобальный поиск ---------- */
console.log('\n[index.html]');
{
  const { document } = await load('index.html');
  await import(new URL('../assets/js/app.js', import.meta.url));
  await wait(2200);

  const cards = () => [...document.querySelectorAll('[data-module-card]')];
  assert(cards().length === MODULES.length, `отрисовано ${cards().length} карточек разделов`);
  assert(
    cards().every((c) => c.getAttribute('href') === `sections/${c.dataset.moduleCard}.html`),
    'каждая карточка ведёт на свою страницу sections/MXX.html',
  );
  assert(document.querySelectorAll('[data-marquee]').length === 1
    && document.querySelector('[data-marquee]').children.length === 22, 'marquee из 11 разделов продублирован');
  assert(document.querySelector('[data-preloader]').hasAttribute('data-done'), 'preloader завершён');
  assert(document.querySelector('[data-stat-blocks]').textContent === '99', 'счётчик блоков = 99');
  assert(document.querySelector('[data-stat-modules]').textContent === '11', 'счётчик разделов = 11');

  // глобальный поиск: ищет и раздел, и конкретные блоки
  // «шейдер» законно матчит M03 (блок 23, артефакт «материал-шейдер») и M08
  type(document.querySelector('[data-search]'), 'шейдер');
  const shown = cards().filter((c) => !c.hidden).map((c) => c.dataset.moduleCard);
  assert(shown.length === 2 && shown.includes('M08') && shown.includes('M03'), `поиск «шейдер» оставил разделы ${shown.join(', ')}`);
  const hits = [...document.querySelectorAll('[data-results] a')];
  assert(hits.length > 0 && hits.every((a) => /lesson\.html\?block=\d\d/.test(a.getAttribute('href'))),
    `в результатах ${hits.length} блоков со ссылками на уроки`);
  assert(/найдено блоков: 10/.test(document.querySelector('[data-results]').textContent), 'показано общее число совпадений (10)');
  assert(document.querySelector('[data-sections-count]').textContent === '02', 'счётчик разделов обновился (02)');

  type(document.querySelector('[data-search]'), '');
  assert(cards().filter((c) => !c.hidden).length === 11, 'после сброса поиска снова 11 разделов');
  assert(document.querySelector('[data-results]').hidden, 'панель результатов скрыта');

  // сквозной док с превью разделов
  const dockLinks = [...document.querySelectorAll('.dock .dock__link')];
  assert(dockLinks.length === 11, `в доке ${dockLinks.length} разделов`);
  assert(dockLinks.every((a, i) => a.getAttribute('href') === `sections/M${pad(i + 1)}.html`), 'ссылки дока ведут на sections/MXX.html');
  assert(dockLinks.every((a) => a.closest('.dock__item').querySelector('.dock__preview b')), 'у каждого раздела есть превью с названием');
  assert(document.querySelector('.dock__preview b').textContent === 'Фундамент и арт-дирекшн', 'в превью M01 — название раздела');
  assert(document.querySelector('.dock__home').getAttribute('href') === 'index.html', 'кнопка «на главную» в доке');
  const homeNav = [...document.querySelectorAll('.dock__nav a')].map((a) => a.getAttribute('href'));
  assert(homeNav.length === 1 && homeNav[0] === 'sections/M01.html', 'на главной стрелка «→» открывает первый раздел');

  // прогресс раздела считается из тех же данных
  click(document.querySelector('[data-reset]'));
  assert(document.querySelector('[data-stat-done]').textContent === '00', 'сброс прогресса → 00');
}

/* ---------- страница раздела ---------- */
console.log('\n[sections/M06.html]');
{
  const { document } = await load('sections/M06.html');
  await import(new URL('../assets/js/section.js', import.meta.url));
  await wait(300);

  const mod = MODULES.find((m) => m.id === 'M06');
  const rows = () => [...document.querySelectorAll('[data-blockrow]')];
  assert(document.body.dataset.section === 'M06', 'body[data-section] = M06');
  assert(rows().length === 9, `в разделе ${rows().length} блоков`);
  assert(
    rows().every((r) => {
      const id = Number(r.dataset.id);
      return id >= mod.from && id <= mod.to;
    }),
    'все строки принадлежат диапазону 46–54',
  );
  assert(document.querySelector('[data-section-done]').textContent === '0', 'прогресс раздела 0 / 9');

  // фильтр по типу
  click(document.querySelector('[data-filter-tag="qa"]'));
  const qa = rows().filter((r) => !r.hidden);
  assert(qa.length === 1 && qa[0].dataset.id === '54', `фильтр «чек-лист» оставил блок ${qa[0]?.dataset.id}`);
  assert(document.querySelector('[data-filtered]').textContent === '01', 'счётчик выдачи = 01');
  click(document.querySelector('[data-filter-tag="all"]'));
  assert(rows().filter((r) => !r.hidden).length === 9, 'после сброса фильтра снова 9 блоков');

  // отметка блока
  click(document.querySelector('[data-done-toggle="46"]'));
  assert(document.querySelector('[data-blockrow][data-id="46"]').dataset.done === 'true', 'блок 46 отмечен');
  assert(document.querySelector('[data-section-done]').textContent === '1', 'прогресс раздела = 1');
  assert(document.querySelector('[data-section-bar]').style.width === `${(1 / 9) * 100}%`, 'полоса прогресса заполнена');
  assert(JSON.parse(globalThis.localStorage.getItem('aw2026.v1')).done.includes(46), 'отметка записана в localStorage');

  // пейджер по разделам
  const pager = [...document.querySelectorAll('.pager a')].map((a) => a.getAttribute('href'));
  assert(pager.includes('M05.html') && pager.includes('M07.html'), 'пейджер ведёт на M05 и M07');

  // док: активный раздел и стрелки
  const activeItem = document.querySelector('.dock__item[data-active]');
  assert(activeItem?.querySelector('.dock__link').getAttribute('href') === '../sections/M06.html', 'в доке подсвечен M06');
  assert(activeItem?.querySelector('.dock__link').getAttribute('aria-current') === 'true', 'у активного раздела aria-current');
  assert(activeItem?.querySelector('.dock__item, .dock__preview') && activeItem.querySelector('.dock__preview').textContent.includes('Motion'), 'превью активного раздела показывает Motion');
  const sectionDock = [...document.querySelectorAll('.dock .dock__link')];
  assert(sectionDock.length === 11, 'в доке 11 разделов');
  assert(sectionDock.every((a) => a.getAttribute('href').startsWith('../sections/')), 'ссылки дока с префиксом ../');
  const nav = [...document.querySelectorAll('.dock__nav a')].map((a) => a.getAttribute('href'));
  assert(nav.includes('../sections/M05.html') && nav.includes('../sections/M07.html'), 'стрелки дока ведут на M05 и M07');
  assert(document.querySelector('.dock__item[data-complete]') === null, 'раздел не помечен закрытым, пока пройден 1 блок из 9');
}

/* ---------- страница блока ---------- */
console.log('\n[blocks/lesson.html?block=46]');
{
  const { document } = await load('blocks/lesson.html', '?block=46');
  await import(new URL('../assets/js/lesson.js', import.meta.url));
  await wait(300);

  const b = BLOCKS.find((x) => x.id === 46);
  assert(document.querySelector('[data-l-title]').textContent === b.t, `заголовок урока = «${b.t}»`);
  assert(document.querySelector('[data-l-thesis]').textContent === b.d, 'тезис блока подставлен');
  assert(document.querySelector('[data-l-module]').textContent.startsWith('M06'), `раздел = ${moduleOf(46).id}`);
  assert(document.querySelector('[data-l-section]').getAttribute('href') === '../sections/M06.html', 'кнопка «к разделу» ведёт на sections/M06.html');
  assert(document.querySelectorAll('[data-crumbs] a').length === 11, 'в крошках 11 разделов');
  assert(document.body.dataset.section === 'M06', 'body[data-section] выставлен из блока');
  assert(document.querySelector('.dock__item[data-active] .dock__link')?.getAttribute('href') === '../sections/M06.html', 'док на уроке подсвечивает свой раздел');
  const expected = CHECKLIST[b.tag].length;
  assert(document.querySelectorAll('[data-checklist] label').length === expected, `чек-лист «${b.tag}»: ${expected} пунктов`);
  assert(document.querySelector('[data-pager] a[href="lesson.html?block=47"]') !== null, 'пейджер ведёт на блок 47');
  assert(document.querySelector('[data-stage-inner] [data-lab-puck]') !== null, 'демо motion-lab смонтировано');
  assert(document.title.startsWith('46 ·'), `title = ${document.title}`);

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
console.log(`\nPASS — три уровня навигации работают (пример: раздел M06, блок ${pad(46)}).`);
// rAF-цикл (курсор, magnetic, preloader) держит event loop — выходим явно
process.exit(0);
