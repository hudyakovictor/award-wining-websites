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

// --- данные курса ---
assert(BLOCKS.length === COURSE.blocks, `блоков ${BLOCKS.length} = заявлено ${COURSE.blocks}`);
assert(MODULES.length === COURSE.modules, `модулей ${MODULES.length} = заявлено ${COURSE.modules}`);

const ids = BLOCKS.map((b) => b.id);
assert(new Set(ids).size === ids.length, 'id блоков уникальны');
assert(ids.every((id, i) => id === i + 1), 'id идут подряд 1..99');

BLOCKS.forEach((b) => {
  if (!b.t || !b.d || !b.tag) errors.push(`блок ${b.id}: не хватает t/d/tag`);
  if (!TAG_LABEL[b.tag]) errors.push(`блок ${b.id}: неизвестный тег ${b.tag}`);
  if (!moduleOf(b.id)) errors.push(`блок ${b.id}: не попал ни в один модуль`);
});

MODULES.forEach((m, i) => {
  if (!m.out) errors.push(`${m.id}: нет артефакта модуля`);
  const prev = MODULES[i - 1];
  if (prev && m.from !== prev.to + 1) errors.push(`${m.id}: разрыв после ${prev.id}`);
  const count = BLOCKS.filter((b) => b.id >= m.from && b.id <= m.to).length;
  if (count !== m.to - m.from + 1) errors.push(`${m.id}: диапазон не совпадает с количеством блоков`);
});
assert(MODULES[0].from === 1 && MODULES.at(-1).to === BLOCKS.length, 'модули покрывают весь курс');

// --- план ---
const plan = readFileSync(new URL('../COURSE_PLAN.md', import.meta.url), 'utf8');
const BLOCK_LINE = new RegExp(`^\\d{2} .+ — .+ \\[(${Object.values(TAG_LABEL).join('|')})\\]$`);
const planLines = plan.split('\n').filter((l) => BLOCK_LINE.test(l)).length;
assert(planLines === BLOCKS.length, `в COURSE_PLAN.md ${planLines} строк блоков (нужно ${BLOCKS.length})`);
assert(plan.length >= 7000, `объём плана ${plan.length} символов (минимум 7000)`);

// --- файлы, на которые ссылается разметка ---
const pages = ['index.html', 'blocks/lesson.html'];
for (const page of pages) {
  const html = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
  const refs = [...html.matchAll(/(?:href|src)="(\.[^"#?]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (ref.startsWith('http')) continue;
    const abs = new URL(ref, new URL(`../${page}`, import.meta.url));
    if (!existsSync(abs)) errors.push(`${page}: не найден ${ref}`);
  }
  ok.push(`${page}: ${refs.length} ссылок проверено`);
}

// --- каждый блок открывает урок ---
const lesson = readFileSync(new URL('../blocks/lesson.html', import.meta.url), 'utf8');
for (const sel of ['data-l-title', 'data-l-thesis', 'data-stage-inner', 'data-checklist', 'data-pager', 'data-lesson-done']) {
  if (!lesson.includes(sel)) errors.push(`lesson.html: нет ${sel}`);
}

const stats = Object.fromEntries(
  Object.keys(TAG_LABEL).map((k) => [k, BLOCKS.filter((b) => b.tag === k).length]),
);

console.log(ok.map((m) => `  ✓ ${m}`).join('\n'));
console.log(`\n  теория ${stats.core} · практика ${stats.build} · кейс ${stats.case} · чек-лист ${stats.qa}`);
console.log(`  план: ${plan.length} символов, пример: ${pad(1)} ${BLOCKS[0].t}`);

if (errors.length) {
  console.error(`\nОШИБКИ (${errors.length}):`);
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  process.exit(1);
}
console.log('\nPASS — данные курса и разметка согласованы.');
