#!/usr/bin/env node
/**
 * Генерирует COURSE_PLAN.md из assets/js/data/plan.js — единственный источник правды.
 * Запуск: node tools/build-plan.mjs  (печатает количество символов плана)
 */
import { writeFileSync } from 'node:fs';
import { COURSE, MODULES, BLOCKS, pad } from '../assets/js/data/plan.js';

const TAG = { core: 'теория', build: 'практика', case: 'кейс', qa: 'чек-лист' };

const head = [
  `# ${COURSE.title.toUpperCase()} — план курса`,
  '',
  `${BLOCKS.length} блоков · ${MODULES.length} модулей. Формат блока: ${COURSE.format}.`,
  'Каждый блок = живой демо + разбор решения + код + задание + чек-лист. Вода запрещена.',
  'Теги: core теория · build практика · case разбор кейса · qa чек-лист.',
  '',
].join('\n');

const body = MODULES.map((m) => {
  const rows = BLOCKS.filter((b) => b.id >= m.from && b.id <= m.to)
    .map((b) => `${pad(b.id)} ${b.t} — ${b.d} [${TAG[b.tag]}]`)
    .join('\n');
  return `${m.id} · ${m.name.toUpperCase()} (${m.from}–${m.to})\n// ${m.note}\n${rows}\n→ артефакт: ${m.out}`;
}).join('\n\n');

const tail = [
  '',
  'ПРАВИЛА НАПОЛНЕНИЯ',
  '1. Блок = 6–12 минут: демо 30 с → разбор 3 мин → код → задание → чек-лист.',
  '2. У каждого блока есть рабочий пример в blocks/lesson.html?block=NN, а не скриншот.',
  '3. Код блока живёт в demos/NN-*/ и подключается к уроку как есть, без «магии вне кадра».',
  '4. Каждый блок заканчивается проверяемым артефактом — файлом, компонентом или метрикой.',
  '5. Порядок можно менять внутри модуля; между модулями — только после артефакта.',
  '',
].join('\n');

const doc = `${head}\n${body}\n${tail}`;
writeFileSync(new URL('../COURSE_PLAN.md', import.meta.url), doc);
console.log(`COURSE_PLAN.md: ${doc.length} chars, ${BLOCKS.length} blocks, ${MODULES.length} modules`);
