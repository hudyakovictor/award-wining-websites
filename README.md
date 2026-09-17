# 2026 Award-Winning Website — интерактивный курс

Каркас курса: 11 модулей, 99 блоков, живой шаблон урока, прогресс в localStorage.
Без сборщика и без рантайм-зависимостей — статика + ES-модули.

## Запуск

```bash
npm install          # только jsdom для тестов
npm start            # http://localhost:3000
npm run plan         # перегенерировать COURSE_PLAN.md из данных курса
npm run check        # целостность данных и ссылок
npm run test         # смоук-тест интерфейса в jsdom
npm run verify       # plan + check + test
```

## Структура

```
index.html                 хаб курса: план, фильтры, поиск, прогресс
blocks/lesson.html         шаблон урока — любой блок: ?block=NN
assets/css/tokens.css      цвет, шкала типов, пространство, длительности, кривые, z-слои
assets/css/base.css        reset, сцена, focus-visible, reduced-motion
assets/css/layout.css      оболочка, сетка 12 колонок, sticky-сплит
assets/css/motion.css      состояния появления, line-mask, keyframes
assets/css/components.css  nav, preloader, карточки, урок, курсор
assets/js/data/plan.js     ЕДИНСТВЕННЫЙ источник правды: модули и 99 блоков
assets/js/data/checklists.js  чек-листы по типам блоков
assets/js/core/raf.js      один цикл rAF + delta-time + damp()
assets/js/core/state.js    прогресс, чек-листы, открытые модули (localStorage)
assets/js/core/*.js        reveal, split, magnetic, cursor, scroll, bus
demos/motion-lab.js        стартовое демо урока; сюда же demos/NN-*.js
tools/build-plan.mjs       COURSE_PLAN.md из plan.js
tools/check.mjs            проверка данных и ссылок
tools/check-dom.mjs        смоук-тест страниц
tools/serve.mjs            статический сервер
COURSE_PLAN.md             план курса (генерируется, руками не правим)
```

## Как добавляется контент блока

1. `assets/js/data/plan.js` — правим заголовок `t` и тезис `d` (план и карточки обновятся сами).
2. `demos/NN-*.js` — пишем демо с экспортом `mount(host)`.
3. `assets/js/lesson.js` — подключаем демо блока вместо motion-lab:
   `const demo = await import(\`../../demos/${pad(block.id)}.js\`).catch(() => null);`
4. Разделы урока (демо → разбор → код → чек-лист) заполняются в `blocks/lesson.html`.
5. `npm run verify` — и коммит.

## Соглашения

- Все значения — токены из `tokens.css`; магические числа в компонентах запрещены.
- Анимации только на `transform` / `opacity` / `clip-path`, длительности из `--d-*`.
- Каждое движение обязано выключаться при `prefers-reduced-motion`.
- Один блок = один приём = один проверяемый артефакт.
