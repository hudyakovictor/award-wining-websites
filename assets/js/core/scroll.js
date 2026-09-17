/** Прогресс чтения + поведение шапки (hide-on-scroll, блок 39). */
export const initScroll = () => {
  const bar = document.querySelector('[data-progress-bar]');
  const nav = document.querySelector('[data-nav]');
  let lastY = scrollY;
  let ticking = false;

  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(scrollY / max, 1) : 0;
    if (bar) bar.style.transform = `scaleX(${p})`;
  };

  addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          const y = scrollY;
          if (nav) {
            if (y > lastY && y > 240) nav.dataset.hidden = '';
            else delete nav.dataset.hidden;
          }
          lastY = y;
          ticking = false;
        });
      }
    },
    { passive: true },
  );

  update();
};
