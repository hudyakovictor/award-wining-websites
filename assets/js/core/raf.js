/**
 * Один цикл rAF на страницу (блок 53).
 * Подписка получает { t, dt, delta } — dt в секундах, нормализованный к 60 Гц.
 */
const subs = new Set();
let raf = 0;
let last = performance.now();

const tick = (now) => {
  const dt = Math.min((now - last) / 1000, 0.05); // защита от фоновых табов
  last = now;
  for (const fn of subs) fn({ t: now, dt, delta: dt * 60 });
  raf = subs.size ? requestAnimationFrame(tick) : 0;
};

export const onFrame = (fn) => {
  subs.add(fn);
  if (!raf) raf = requestAnimationFrame(tick);
  return () => {
    subs.delete(fn);
    if (!subs.size && raf) cancelAnimationFrame(raf), (raf = 0);
  };
};

/** Экспоненциальное сглаживание, независимое от частоты кадров. */
export const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));
