/**
 * Единственный источник правды курса.
 * Из этого файла рендерится: index.html (карточки), blocks/lesson.html (урок),
 * и tools/build-plan.mjs -> COURSE_PLAN.md.
 *
 * Формат блока: { id, t: заголовок, d: тезис-делай-так, tag: тип контента }
 * tag: 'core' теория | 'build' практика | 'case' разбор кейса | 'qa' чек-лист
 */

export const COURSE = {
  title: '2026 Award-Winning Website',
  blocks: 99,
  modules: 11,
  format: 'live-demo → разбор → код → задание → чек-лист',
};

export const MODULES = [
  { id: 'M01', short: 'Фундамент', from: 1, to: 9, name: 'Фундамент и арт-дирекшн', note: 'Решаем, что строим, до первого пикселя.', out: 'concept statement + референс-борд + токены + greybox' },
  { id: 'M02', short: 'Типографика', from: 10, to: 18, name: 'Типографика и ритм', note: 'Текст — главный носитель премиальности.', out: 'type scale, kinetic-заголовок, типографический экран' },
  { id: 'M03', short: 'Цвет', from: 19, to: 27, name: 'Цвет, свет, материал', note: 'Палитра и физика поверхности.', out: 'палитра OKLCH, материал-шейдер, grain-слой' },
  { id: 'M04', short: 'Сетка', from: 28, to: 36, name: 'Сетка, пространство, композиция', note: 'Layout как инструмент иерархии.', out: 'сетка 12 колонок + 3 композиционных экрана' },
  { id: 'M05', short: 'UI-кит', from: 37, to: 45, name: 'UI-кит и компоненты', note: 'Атомы, из которых собран сайт-победитель.', out: 'UI-кит: nav, кнопки, карточки, формы, оверлеи' },
  { id: 'M06', short: 'Motion', from: 46, to: 54, name: 'Motion-система', note: 'Длительности, кривые, хореография.', out: 'motion-tokens + timeline-библиотека проекта' },
  { id: 'M07', short: 'Scroll', from: 55, to: 63, name: 'Scroll-driven сценарий', note: 'Скролл как таймлайн повествования.', out: 'pin-секция, horizontal, sticky 2-col, sequence' },
  { id: 'M08', short: 'Effects', from: 64, to: 72, name: 'Effects: WebGL, шейдеры, частицы', note: 'То, что невозможно в Figma.', out: 'шейдер-сцена + частицы + postprocessing' },
  { id: 'M09', short: 'Transitions', from: 73, to: 81, name: 'Transitions и перестановка сцен', note: 'Переходы между состояниями и страницами.', out: 'preloader + page transition + FLIP-морф' },
  { id: 'M10', short: 'Interaction', from: 82, to: 90, name: 'Interaction', note: 'Курсор, физика, drag, звук, отклик.', out: 'курсор, magnetic, drag, sound, живые данные' },
  { id: 'M11', short: 'Продакшн', from: 91, to: 99, name: 'Продакшн, доступность, подача', note: 'От макета до награды.', out: 'Lighthouse 95+, a11y, кейс и submit на Awwwards' },
];

export const BLOCKS = [
  // M01 · 1-9
  { id: 1, t: 'Критерии жюри', d: 'Дизайн / юзабилити / креатив / контент / разработчик — как реально считают баллы.', tag: 'core' },
  { id: 2, t: 'Одна сильная идея', d: 'Concept statement в 1 предложение; 20 средних идей = 0 наград.', tag: 'core' },
  { id: 3, t: 'Референс-борд', d: 'Сбор и декомпозиция; anti-референс; граница «вдохновение / копипаст».', tag: 'build' },
  { id: 4, t: 'Art-direction statement', d: 'Тон, температура, плотность, уровень шума — до вёрстки.', tag: 'core' },
  { id: 5, t: 'Архитектура проекта', d: 'Слои, папки, нейминг, точки расширения; что переживёт редизайн.', tag: 'build' },
  { id: 6, t: 'Дизайн-токены', d: 'color / type / space / motion / z / radius — CSS custom properties.', tag: 'build' },
  { id: 7, t: 'Стек 2026', d: 'Vanilla vs GSAP vs Lenis vs Three/R3F: когда что и чем платить.', tag: 'core' },
  { id: 8, t: 'Greybox за 60 минут', d: 'Прототип структуры до пикселей: проверка ритма без стиля.', tag: 'build' },
  { id: 9, t: 'Питч концепта', d: '90 секунд: проблема → идея → вау-момент → почему это работает.', tag: 'case' },
  // M02 · 10-18
  { id: 10, t: 'Пара шрифтов', d: 'Дисплейный + текстовый: контраст ролей, а не два похожих гротеска.', tag: 'core' },
  { id: 11, t: 'Fluid type scale', d: 'clamp() + токены --fs-*; шкала 1.25/1.333 и отказ от px-фиксов.', tag: 'build' },
  { id: 12, t: 'Ритм текста', d: 'leading, tracking, optical margin, hanging punctuation, висячие строки.', tag: 'build' },
  { id: 13, t: 'Variable fonts', d: 'weight/width/slant как анимация; fvar, axis, font-variation-settings.', tag: 'build' },
  { id: 14, t: 'Kinetic type', d: 'per-char stagger, mask-reveal, wave, scramble-decode.', tag: 'build' },
  { id: 15, t: 'Текст как графика', d: 'outline, clip-path, mask-image, mix-blend, text-fill анимации.', tag: 'build' },
  { id: 16, t: 'Заголовки 20vw+', d: 'Гигантский кегль, вертикальный ритм, переносы, обрезка по маске.', tag: 'case' },
  { id: 17, t: 'Микро-типографика', d: 'tabular-nums, надстрочники, кавычки, дефисы, метаданные-подписи.', tag: 'core' },
  { id: 18, t: 'Type QA', d: 'AA-контраст, orphan/widow, тест 320–2560, скорость чтения.', tag: 'qa' },
  // M03 · 19-27
  { id: 19, t: 'Палитра 2026', d: '2–3 цвета + шум; почему градиент-дефолт убивает премиальность.', tag: 'core' },
  { id: 20, t: 'OKLCH', d: 'Перцептивная равномерность, токены light/dark без пересборки.', tag: 'build' },
  { id: 21, t: 'Иерархия цветом', d: 'Контраст и акцент вместо бесконечного роста кегля.', tag: 'core' },
  { id: 22, t: 'Тёмная тема как база', d: 'Свечения, bloom, подъём фона, «подсвеченный» текст.', tag: 'build' },
  { id: 23, t: 'Материалы', d: 'Стекло / металл / бумага / пластик: как получить шейдером и CSS.', tag: 'build' },
  { id: 24, t: 'Зерно и шум', d: 'grain, halftone, scanline, SVG feTurbulence — оживляем плоскость.', tag: 'build' },
  { id: 25, t: 'Свет и тени', d: 'ambient + key, цветные тени, inset, elevation без серой грязи.', tag: 'build' },
  { id: 26, t: 'Логика акцента', d: 'Один hot-color на экран; правило 90/10; акцент = действие.', tag: 'core' },
  { id: 27, t: 'Color QA', d: 'CVD-симуляция, delta-E, проверка в grayscale, dark-bleed.', tag: 'qa' },
  // M04 · 28-36
  { id: 28, t: 'Сетка и асимметрия', d: '12 колонок + offset и overlap: где ломать сетку осознанно.', tag: 'core' },
  { id: 29, t: 'Container queries', d: 'Компонент сам знает свой размер; layout-примитивы без медиа-хаков.', tag: 'build' },
  { id: 30, t: 'Vertical rhythm', d: '8pt против baseline grid; когда baseline обязателен.', tag: 'core' },
  { id: 31, t: 'Negative space', d: 'Пустота как признак дорогих сайтов; плотность по секциям.', tag: 'core' },
  { id: 32, t: 'Композиция экрана', d: 'Focal point, Z/F/диагональ, визуальный вес, вход и выход взгляда.', tag: 'case' },
  { id: 33, t: 'Слои и глубина', d: 'z-scale, порядок parallax, occlusion, перекрытие планов.', tag: 'build' },
  { id: 34, t: 'Breakpoint-стратегия', d: 'Mobile-first без деградации; что убирать, что переставлять.', tag: 'build' },
  { id: 35, t: 'Editorial layout', d: 'Брейкауты, pull-quote, журнальная сетка, капсы и сноски.', tag: 'case' },
  { id: 36, t: 'Layout QA', d: '320 → 2560 без поломки, overflow-x, safe-area, zoom 200%.', tag: 'qa' },
  // M05 · 37-45
  { id: 37, t: 'UI-кит атомов', d: 'Кнопки, инпуты, теги, меню, разделители — один источник стилей.', tag: 'build' },
  { id: 38, t: 'Кнопка как событие', d: '4 состояния + тактильный отклик: scale, glow, label-slide, звук.', tag: 'build' },
  { id: 39, t: 'Навигация', d: 'Sticky header, hide-on-scroll, fullscreen menu с stagger.', tag: 'build' },
  { id: 40, t: 'Карточки проектов', d: 'Hover-state, clip reveal медиа, meta-строка, hover-follow.', tag: 'build' },
  { id: 41, t: 'Формы 2026', d: 'Floating label, валидация как анимация, автозаполнение, ошибки.', tag: 'build' },
  { id: 42, t: 'Оверлеи', d: 'Модалка, drawer, toast — без layout shift и с focus trap.', tag: 'build' },
  { id: 43, t: 'Табы и аккордеон', d: 'State → motion mapping; FLIP при смене контента; высота без дёрга.', tag: 'build' },
  { id: 44, t: 'Микро-графика', d: 'Иконки stroke-dashoffset, спрайты, без Lottie и лишних кб.', tag: 'build' },
  { id: 45, t: 'UI QA', d: 'focus-visible, клавиатура, touch targets 44px, состояния загрузки.', tag: 'qa' },
  // M06 · 46-54
  { id: 46, t: 'Длительности', d: '150 / 300 / 600 / 900 мс: шкала --d-* и правило «короче = дороже».', tag: 'core' },
  { id: 47, t: 'Кривые', d: 'expo, quart, back, spring; cubic-bezier против физической пружины.', tag: 'build' },
  { id: 48, t: 'Entrance / exit / loop', d: 'Три разных набора правил: вход медленный, выход быстрый, цикл редкий.', tag: 'core' },
  { id: 49, t: 'Stagger-хореография', d: 'Порядок чтения = порядок движения; 40–80 мс между элементами.', tag: 'build' },
  { id: 50, t: 'Spring-физика', d: 'stiffness / damping / mass; inertia после drag; overshoot.', tag: 'build' },
  { id: 51, t: 'Timeline-мышление', d: 'Labels, относительные позиции, паузы, пересборка сцен.', tag: 'build' },
  { id: 52, t: 'GPU-безопасные свойства', d: 'transform / opacity / clip-path; почему top и width ломают fps.', tag: 'core' },
  { id: 53, t: 'rAF и delta-time', d: 'Один цикл на страницу, независимость от скролла и от 120 Гц.', tag: 'build' },
  { id: 54, t: 'Motion QA', d: '60 fps, dropped frames, will-change без мусора, reduced-motion.', tag: 'qa' },
  // M07 · 55-63
  { id: 55, t: 'Smooth scroll', d: 'Lenis / lerp, синхронизация со ScrollTrigger, цена на мобильном.', tag: 'build' },
  { id: 56, t: 'Pinned-секции', d: 'Скраббинг таймлайна скроллом: scrub, anticipate, snap.', tag: 'build' },
  { id: 57, t: 'Горизонталь внутри вертикали', d: 'transform-подход без native-скролла и дёрганья.', tag: 'build' },
  { id: 58, t: 'Sticky two-column', d: 'Текст идёт, медиа стоит; точки смены контента.', tag: 'build' },
  { id: 59, t: 'Parallax-слои', d: 'Скорость = глубина; лимит смещения, чтобы не тошнило.', tag: 'build' },
  { id: 60, t: 'Image sequence', d: 'Кадр = прогресс; preloading, canvas-рисование, вес vs плавность.', tag: 'build' },
  { id: 61, t: 'Текст на скролле', d: 'mask-reveal per line, blur-in, подсветка активной строки.', tag: 'build' },
  { id: 62, t: 'Скролл → uniform', d: 'Прогресс секции как переменная для canvas/WebGL.', tag: 'build' },
  { id: 63, t: 'Scroll QA', d: 'iOS bounce, 120 Гц, anchor offsets, address bar, CLS.', tag: 'qa' },
  // M08 · 64-72
  { id: 64, t: 'Что отдавать WebGL', d: 'Разделение труда CSS / canvas 2D / Three.js по бюджету кадра.', tag: 'core' },
  { id: 65, t: 'Шейдер-плоскость', d: 'UV, time, resolution, mouse: минимальный фрагментный шейдер.', tag: 'build' },
  { id: 66, t: 'Displacement + RGB shift', d: 'Искажение на hover, каналы, скорость возврата.', tag: 'build' },
  { id: 67, t: 'Liquid и gooey', d: 'Metaballs через feGaussianBlur + contrast; SVG-фильтры в UI.', tag: 'build' },
  { id: 68, t: 'Частицы', d: 'Points, инстансинг, 100k частиц в 16 мс; аттракторы и шум.', tag: 'build' },
  { id: 69, t: 'Video-маски', d: 'Текст-маска, luma-matte, mix-blend-mode с видео-подложкой.', tag: 'build' },
  { id: 70, t: 'Курсор-реакция', d: 'Distortion, ripple, магнитное поле под указателем.', tag: 'build' },
  { id: 71, t: 'Postprocessing', d: 'Bloom, film grain, chromatic aberration, DOF — и когда это лишнее.', tag: 'build' },
  { id: 72, t: 'Effects QA', d: 'Fallback на слабых GPU, DPR cap, батарея, отключение в фоне.', tag: 'qa' },
  // M09 · 73-81
  { id: 73, t: 'Переход как жест', d: 'Page transition — фирменный приём, а не задержка перед контентом.', tag: 'core' },
  { id: 74, t: 'View Transitions API', d: 'Cross-document и same-document; snapshot, naming, fallback.', tag: 'build' },
  { id: 75, t: 'Shared element morph', d: 'FLIP: first-last-invert-play; морф карточки в страницу.', tag: 'build' },
  { id: 76, t: 'Mask-wipe и curtain', d: 'clip-path circle/rect reveal, шторы, диагональные срезы.', tag: 'build' },
  { id: 77, t: 'Preloader', d: 'Counter, logo draw, exit-хореография и правило 1.5 с.', tag: 'build' },
  { id: 78, t: 'Route-timeline', d: 'out → swap → in без белого кадра; прерываемость перехода.', tag: 'build' },
  { id: 79, t: 'Скролл и история', d: 'Возврат позиции, якоря, back-button, scrollRestoration.', tag: 'build' },
  { id: 80, t: 'Micro-transitions', d: 'Смена состояния экрана: фильтры, сортировка, раскладка.', tag: 'build' },
  { id: 81, t: 'Transitions QA', d: 'Прерываемость, back-button, бюджет 300 мс, prefers-reduced.', tag: 'qa' },
  // M10 · 82-90
  { id: 82, t: 'Кастомный курсор', d: 'lerp, mix-blend-mode, состояния hover/drag/text, скрытие нативного.', tag: 'build' },
  { id: 83, t: 'Magnetic и drag', d: 'Притяжение элементов, inertia-скролл, velocity carry-over.', tag: 'build' },
  { id: 84, t: 'Hover vs touch', d: 'pointer-fine / pointer-coarse: разные сценарии одного блока.', tag: 'core' },
  { id: 85, t: 'Физика отклика', d: 'Bounce, трение, наследование скорости, ограничение overshoot.', tag: 'build' },
  { id: 86, t: 'Sound design', d: 'WebAudio: hover/click/scroll cues, mute-first, громкость −18 дБ.', tag: 'build' },
  { id: 87, t: 'Живые данные', d: 'Каунтеры, графики, real-time цифры как элемент доверия.', tag: 'build' },
  { id: 88, t: 'Пасхалки', d: 'Konami, reward-состояния, скрытые сцены — дозировано.', tag: 'case' },
  { id: 89, t: 'UX-мелочи', d: 'Sticky CTA, recovery после ошибки, автозаполнение, подсказки.', tag: 'core' },
  { id: 90, t: 'Interaction QA', d: 'Input latency < 100 мс, no dead zones, отклик на каждое действие.', tag: 'qa' },
  // M11 · 91-99
  { id: 91, t: 'Performance-бюджет', d: 'LCP < 1.2 с, CLS = 0, TBT; бюджет в кб на слой сайта.', tag: 'core' },
  { id: 92, t: 'Ассеты', d: 'AVIF/WebP, subset шрифтов, preload, lazy, декодирование вне потока.', tag: 'build' },
  { id: 93, t: 'Рендер-стратегия', d: 'Static vs SSR vs islands: что даёт награда, а что — цена.', tag: 'core' },
  { id: 94, t: 'Доступность 2026', d: 'Семантика, a11y-tree, prefers-reduced-motion / contrast / data.', tag: 'build' },
  { id: 95, t: 'SEO и мета', d: 'OG, structured data, каноникалы для шоукейс-сайта.', tag: 'build' },
  { id: 96, t: 'Кросс-браузер', d: 'Safari-баги, iOS 100vh, Android lag, filter/blend ограничения.', tag: 'build' },
  { id: 97, t: 'Контент и копирайт', d: 'Тон, длина, иерархия сообщения, текст вместо lorem.', tag: 'core' },
  { id: 98, t: 'Упаковка кейса', d: 'Скриншоты, видео 15 с, структура подачи на Behance/Readme.', tag: 'case' },
  { id: 99, t: 'Подача на Awwwards', d: 'Submit, теги, тайминг, self-promo, работа с фидбеком жюри.', tag: 'case' },
];

export const TAG_LABEL = { core: 'теория', build: 'практика', case: 'кейс', qa: 'чек-лист' };

export const moduleOf = (id) => MODULES.find((m) => id >= m.from && id <= m.to);
export const pad = (n) => String(n).padStart(2, '0');
