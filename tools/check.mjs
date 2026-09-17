#!/usr/bin/env node
/**
 * Проверка данных курса и целостности файлов.
 * Запуск: npm run check
 */
import { readFileSync, existsSync } from 'node:fs';
import { COURSE, MODULES, BLOCKS, TAG_LABEL, moduleOf, pad } from '../assets/js/data/plan.js';

const errors = [];
const ok = [];
const assert = (cond, msg) => (cond ? ok.push(msg) : errors.push(msg));
const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');

// --- данные курса ---
assert(BLOCKS.length === COURSE.blocks, `блоков ${BLOCKS.length} = заявлено ${COURSE.blocks}`);
assert(MODULES.length === COURSE.modules, `разделов ${MODULES.length} = заявлено ${COURSE.modules}`);

const ids = BLOCKS.map((b) => b.id);
assert(new Set(ids).size === ids.length, 'id блоков уникальны');
assert(ids.every((id, i) => id === i + 1), 'id идут подряд 1..99');

BLOCKS.forEach((b) => {
  if (!b.t || !b.d || !b.tag) errors.push(`блок ${b.id}: не хватает t/d/tag`);
  if (!TAG_LABEL[b.tag]) errors.push(`блок ${b.id}: неизвестный тег ${b.tag}`);
  if (!moduleOf(b.id)) errors.push(`блок ${b.id}: не попал ни в один раздел`);
});

MODULES.forEach((m, i) => {
  if (!m.out) errors.push(`${m.id}: нет артефакта раздела`);
  if (!m.short) errors.push(`${m.id}: нет короткого имени`);
  const prev = MODULES[i - 1];
  if (prev && m.from !== prev.to + 1) errors.push(`${m.id}: разрыв после ${prev.id}`);
  const count = BLOCKS.filter((b) => b.id >= m.from && b.id <= m.to).length;
  if (count !== m.to - m.from + 1) errors.push(`${m.id}: диапазон не совпадает с количеством блоков`);
});
assert(MODULES[0].from === 1 && MODULES.at(-1).to === BLOCKS.length, 'разделы покрывают весь курс');

// --- план ---
const plan = read('COURSE_PLAN.md');
const BLOCK_LINE = new RegExp(`^\\d{2} .+ — .+ \\[(${Object.values(TAG_LABEL).join('|')})\\]$`);
const planLines = plan.split('\n').filter((l) => BLOCK_LINE.test(l)).length;
assert(planLines === BLOCKS.length, `в COURSE_PLAN.md ${planLines} строк блоков (нужно ${BLOCKS.length})`);
assert(plan.length >= 7000, `объём плана ${plan.length} символов (минимум 7000)`);

// --- страницы разделов: своя на каждый раздел ---
for (const m of MODULES) {
  const rel = `sections/${m.id}.html`;
  if (!existsSync(new URL(`../${rel}`, import.meta.url))) {
    errors.push(`нет страницы раздела ${rel} — запусти npm run build`);
    continue;
  }
  const html = read(rel);
  const blocks = BLOCKS.filter((b) => b.id >= m.from && b.id <= m.to);
  if (html.includes('{{')) errors.push(`${rel}: остались токены шаблона`);
  if (!html.includes(`data-section="${m.id}"`)) errors.push(`${rel}: нет data-section`);
  const missing = blocks.filter((b) => !html.includes(`../blocks/lesson.html?block=${pad(b.id)}`));
  if (missing.length) errors.push(`${rel}: нет ссылок на блоки ${missing.map((b) => pad(b.id)).join(', ')}`);
  const foreign = BLOCKS.filter((b) => b.id < m.from || b.id > m.to)
    .filter((b) => html.includes(`../blocks/lesson.html?block=${pad(b.id)}`));
  if (foreign.length) errors.push(`${rel}: лишние блоки ${foreign.map((b) => pad(b.id)).join(', ')}`);
}
assert(MODULES.every((m) => existsSync(new URL(`../sections/${m.id}.html`, import.meta.url))), `есть все ${MODULES.length} страниц разделов`);

// --- все локальные ссылки в разметке ведут на существующие файлы ---
const pages = ['index.html', 'blocks/lesson.html', ...MODULES.map((m) => `sections/${m.id}.html`)];
let checked = 0;
for (const page of pages) {
  const html = read(page);
  const refs = [...html.matchAll(/(?:href|src)="(\.[^"#?]*)/g)].map((m) => m[1]);
  for (const ref of refs) {
    const abs = new URL(ref, new URL(`../${page}`, import.meta.url));
    checked += 1;
    if (!existsSync(abs)) errors.push(`${page}: не найден ${ref}`);
  }
}
ok.push(`${pages.length} страниц: ${checked} локальных ссылок ведут на существующие файлы`);

// --- шаблон урока содержит все точки подстановки ---
const lesson = read('blocks/lesson.html');
for (const sel of ['data-l-title', 'data-l-thesis', 'data-l-section', 'data-stage-inner', 'data-checklist', 'data-pager', 'data-lesson-done']) {
  if (!lesson.includes(sel)) errors.push(`lesson.html: нет ${sel}`);
}

const stats = Object.fromEntries(Object.keys(TAG_LABEL).map((k) => [k, BLOCKS.filter((b) => b.tag === k).length]));

console.log(ok.map((m) => `  ✓ ${m}`).join('\n'));
console.log(`\n  теория ${stats.core} · практика ${stats.build} · кейс ${stats.case} · чек-лист ${stats.qa}`);
console.log(`  план: ${plan.length} символов · разделов: ${MODULES.length} · блоков: ${BLOCKS.length}`);

if (errors.length) {
  console.error(`\nОШИБКИ (${errors.length}):`);
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  process.exit(1);
}
console.log('\nPASS — данные курса, план, разделы и ссылки согласованы.');
