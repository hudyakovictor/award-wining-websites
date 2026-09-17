# 2026 Award-Winning Website — интерактивный курс

Каркас курса: 11 разделов, 99 блоков, страницы разделов, живой шаблон урока, прогресс в localStorage.
Без сборщика и без рантайм-зависимостей — статика + ES-модули.

## Запуск

```bash
npm install          # только jsdom для тестов
npm start            # http://localhost:3000
npm run plan         # перегенерировать COURSE_PLAN.md из данных курса
npm run sections     # перегенерировать sections/M01…M11.html
npm run build        # план + разделы
npm run check        # целостность данных и ссылок
npm run test         # смоук-тест интерфейса в jsdom
npm run verify       # plan + check + test
```

## Структура

```
index.html                 главная: hero, 11 разделов, глобальный поиск, прогресс
sections/M01.html … M11.html  страница раздела: 9 блоков, артефакт, прогресс раздела
blocks/lesson.html         страница блока — любой блок: ?block=NN
templates/section.html     шаблон, из которого генерируются sections/*.html
assets/css/tokens.css      цвет, шкала типов, пространство, длительности, кривые, z-слои
assets/css/base.css        reset, сцена, focus-visible, reduced-motion
assets/css/layout.css      оболочка, сетка 12 колонок, sticky-сплит
assets/css/motion.css      состояния появления, line-mask, keyframes
assets/css/components.css  nav, preloader, карточки, урок, курсор
assets/js/data/plan.js     ЕДИНСТВЕННЫЙ источник правды: 11 разделов и 99 блоков
assets/js/data/checklists.js  чек-листы по типам блоков
assets/js/core/raf.js      один цикл rAF + delta-time + damp()
assets/js/core/state.js    прогресс и чек-листы (localStorage)
assets/js/app.js           главная: разделы, поиск, прогресс
assets/js/section.js       раздел: фильтр по типу блока, прогресс раздела
assets/js/lesson.js        блок: контент урока, чек-лист, пейджер
assets/js/core/dock.js     сквозная навигация: 11 разделов, превью, стрелки, [ ]
assets/js/core/*.js        reveal, split, magnetic, cursor, scroll, bus
demos/motion-lab.js        стартовое демо урока; сюда же demos/NN-*.js
tools/build-plan.mjs       COURSE_PLAN.md из plan.js
tools/build-sections.mjs   sections/M01…M11.html из templates/section.html
tools/check.mjs            проверка данных и ссылок
tools/check-dom.mjs        смоук-тест страниц
tools/serve.mjs            статический сервер
tools/type-scale.mjs       шкала типов в px по ширинам вьюпорта
COURSE_PLAN.md             план курса (генерируется, руками не правим)
sections/                  страницы разделов (генерируются, руками не правим)
```

## Три уровня навигации

`index.html` (разделы) → `sections/M06.html` (9 блоков раздела) → `blocks/lesson.html?block=46` (урок).

Плюс сквозной док на всех трёх уровнях: слева рельс из 11 разделов с превью (название, заметка,
прогресс, артефакт) на наведении и фокусе, кольцо общего прогресса, стрелки «предыдущий / следующий
раздел» и клавиши `[` `]`. Ниже 1280px рельс уезжает в нижнюю полосу — в gutter он не влезает.

## Как добавляется контент блока

1. `assets/js/data/plan.js` — правим заголовок `t` и тезис `d` (план и карточки обновятся сами).
2. `demos/NN-*.js` — пишем демо с экспортом `mount(host)`.
3. `assets/js/lesson.js` — подключаем демо блока вместо motion-lab:
   `const demo = await import(\`../../demos/${pad(block.id)}.js\`).catch(() => null);`
4. Разделы урока (демо → разбор → код → чек-лист) заполняются в `blocks/lesson.html`.
5. Если меняется состав или текст раздела — `npm run sections`, страницы разделов перегенерируются.
6. `npm run verify` — и коммит.

## Соглашения

- Все значения — токены из `tokens.css`; магические числа в компонентах запрещены.
- Кегли держим в шкале: hero ≤ 68px, заголовок раздела ≤ 46px (`node tools/type-scale.mjs`).
- Анимации только на `transform` / `opacity` / `clip-path`, длительности из `--d-*`.
- Каждое движение обязано выключаться при `prefers-reduced-motion`.
- Один блок = один приём = один проверяемый артефакт.
