#!/usr/bin/env node
/**
 * Генерирует внутренние страницы разделов sections/M01.html … M11.html
 * из templates/section.html + данных курса (assets/js/data/plan.js).
 * Руками sections/*.html не правим — правим данные или шаблон.
 *
 * Запуск: npm run sections
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { MODULES, BLOCKS, TAG_LABEL, pad } from '../assets/js/data/plan.js';

const OUT = new URL('../sections/', import.meta.url);
const tpl = readFileSync(new URL('../templates/section.html', import.meta.url), 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

mkdirSync(OUT, { recursive: true });

const row = (b) => `          <li class="blockrow" data-blockrow data-id="${b.id}" data-tag="${b.tag}" data-done="false" data-reveal>
            <span class="blockrow__num">${pad(b.id)}</span>
            <div>
              <a class="blockrow__title" href="../blocks/lesson.html?block=${pad(b.id)}">${esc(b.t)}</a>
              <p class="blockrow__desc">${esc(b.d)}</p>
            </div>
            <span class="blockrow__tag">${TAG_LABEL[b.tag]}</span>
            <button class="done" type="button" data-done-toggle="${b.id}" aria-pressed="false" aria-label="Отметить блок ${pad(b.id)} пройденным">✓</button>
            <a class="blockrow__open" href="../blocks/lesson.html?block=${pad(b.id)}">открыть ↗</a>
          </li>`;

const pagerLink = (m, dir) =>
  m
    ? `          <a href="${m.id}.html"><span class="u-mono">${dir} · ${m.id}</span><b>${esc(m.name)}</b></a>`
    : `          <span><span class="u-mono">${dir}</span><b>—</b></span>`;

const written = [];

for (const m of MODULES) {
  const blocks = BLOCKS.filter((b) => b.id >= m.from && b.id <= m.to);
  const prev = MODULES[MODULES.indexOf(m) - 1];
  const next = MODULES[MODULES.indexOf(m) + 1];
  const desc = `${m.id} · ${m.name}: ${m.note} Блоки ${pad(m.from)}–${pad(m.to)}. Артефакт: ${m.out}.`;

  const map = {
    ID: m.id,
    NAME: esc(m.name),
    SHORT: esc(m.short),
    NOTE: esc(m.note),
    OUT: esc(m.out),
    RANGE: `${pad(m.from)}–${pad(m.to)}`,
    COUNT: String(blocks.length),
    DESC: esc(desc),
    ROWS: blocks.map(row).join('\n'),
    PAGER: [pagerLink(prev, 'назад'), pagerLink(next, 'вперёд')].join('\n'),
  };

  const html = Object.entries(map).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v), tpl);
  if (html.includes('{{')) throw new Error(`${m.id}: в шаблоне остались незаменённые токены`);

  writeFileSync(new URL(`${m.id}.html`, OUT), html);
  written.push(`${m.id}.html (${blocks.length} блоков)`);
}

console.log(`sections/: ${written.length} страниц — ${written.join(', ')}`);
