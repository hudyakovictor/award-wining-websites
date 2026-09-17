/** Появление по скроллу через IntersectionObserver + stagger через --i. */
export const initReveal = (root = document) => {
  const items = [...root.querySelectorAll('[data-reveal]:not(.is-in)')];
  if (!items.length) return;

  // Стаггер внутри одного родителя
  const groups = new Map();
  items.forEach((el) => {
    const parent = el.parentElement;
    const n = groups.get(parent) ?? 0;
    el.style.setProperty('--i', el.dataset.stagger === 'false' ? 0 : n);
    groups.set(parent, n + 1);
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  );

  items.forEach((el) => io.observe(el));
  return io;
};
