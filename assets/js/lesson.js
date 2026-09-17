/**
 * Шаблон урока. Любой блок курса открывается как blocks/lesson.html?block=NN
 * и берёт контент из data/plan.js. Демо подключается из demos/.
 */
import { BLOCKS, MODULES, TAG_LABEL, moduleOf, pad } from './data/plan.js';
import { initReveal } from './core/reveal.js';
import { initSplits } from './core/split.js';
import { initMagnetic } from './core/magnetic.js';
import { initScroll } from './core/scroll.js';
import { initDock } from './core/dock.js';
import { initCursor } from './core/cursor.js';
import { isDone, toggleDone, isChecked, toggleCheck } from './core/state.js';
import { mount as mountMotionLab } from '../../demos/motion-lab.js';
import { CHECKLIST } from './data/checklists.js';



const getCodeSample = (b) =>
  b.tag === 'build'
    ? `/* ${pad(b.id)} · ${b.t} */\n:root { --d-2: 320ms; --e-expo: cubic-bezier(.16,1,.3,1); }\n\n.block {\n  transition: transform var(--d-2) var(--e-expo);\n}\n.block:hover { transform: translate3d(0,-4px,0); }`
    : `// ${pad(b.id)} · ${b.t}\n// тезис: ${b.d}\n// артефакт блока: ${moduleOf(b.id).out}`;

const boot = () => {
  const params = new URLSearchParams(location.search);
  const id = Number(params.get('block')) || 1;
  const block = BLOCKS.find((b) => b.id === id) ?? BLOCKS[0];
  const mod = moduleOf(block.id);
  const prev = BLOCKS.find((b) => b.id === block.id - 1);
  const next = BLOCKS.find((b) => b.id === block.id + 1);

  document.title = `${pad(block.id)} · ${block.t} — ${mod.name}`;

  const set = (sel, value) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = value;
  };

  set('[data-l-module]', `${mod.id} · ${mod.name}`);
  set('[data-l-num]', `блок ${pad(block.id)} / 99`);
  set('[data-l-title]', block.t);
  set('[data-l-tag]', TAG_LABEL[block.tag]);
  set('[data-l-thesis]', block.d);
  set('[data-l-note]', mod.note);
  set('[data-l-out]', mod.out);
  set('[data-stage-label]', `demo · ${pad(block.id)} ${block.t}`);
  set('[data-code]', getCodeSample(block));

  // чек-лист блока
  const list = document.querySelector('[data-checklist]');
  if (list) {
    list.innerHTML = CHECKLIST[block.tag]
      .map((text, i) => {
        const key = `b${block.id}.${i}`;
        return `<label><input type="checkbox" data-check="${key}" ${isChecked(key) ? 'checked' : ''}><span>${text}</span></label>`;
      })
      .join('');
    list.addEventListener('change', (e) => {
      const box = e.target.closest('[data-check]');
      if (box) toggleCheck(box.dataset.check);
    });
  }

  // кнопка «блок пройден»
  const doneBtn = document.querySelector('[data-lesson-done]');
  const paintDone = () => {
    if (!doneBtn) return;
    const done = isDone(block.id);
    doneBtn.setAttribute('aria-pressed', String(done));
    doneBtn.textContent = done ? 'блок пройден ✓' : 'отметить пройденным';
  };
  doneBtn?.addEventListener('click', () => {
    toggleDone(block.id);
    paintDone();
  });
  paintDone();

  // пейджер
  const pager = document.querySelector('[data-pager]');
  if (pager) {
    const cell = (b, dir) =>
      b
        ? `<a href="lesson.html?block=${pad(b.id)}"><span class="u-mono">${dir} · ${pad(b.id)}</span><b>${b.t}</b></a>`
        : `<span class="u-mono">${dir}</span>`;
    pager.innerHTML = cell(prev, 'назад') + cell(next, 'вперёд');
  }

  // ссылка на раздел и хлебные крошки по разделам
  const back = document.querySelector('[data-l-section]');
  if (back) back.href = `../sections/${mod.id}.html`;

  const crumbs = document.querySelector('[data-crumbs]');
  if (crumbs) {
    crumbs.innerHTML = MODULES.map(
      (m) =>
        `<a class="u-mono" href="../sections/${m.id}.html" style="${m.id === mod.id ? 'color:var(--accent)' : ''}">${m.id}</a>`,
    ).join('<span class="u-mono">/</span>');
  }

  // стартовое демо курса: motion-лаборатория (блоки 46–47)
  const stage = document.querySelector('[data-stage-inner]');
  if (stage) mountMotionLab(stage);

  document.body.dataset.section = mod.id; // док подсвечивает свой раздел
  initScroll();
  initDock();
  initSplits();
  initReveal();
  initMagnetic();
  initCursor();
};

boot();
