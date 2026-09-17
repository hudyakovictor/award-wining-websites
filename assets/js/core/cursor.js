/** Кастомный курсор с lerp и состояниями (блок 82). */
import { onFrame, damp } from './raf.js';

export const initCursor = () => {
  if (!matchMedia('(pointer: fine)').matches) return;

  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);

  const target = { x: innerWidth / 2, y: innerHeight / 2 };
  const pos = { ...target };

  addEventListener('pointermove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
  });

  addEventListener('pointerdown', () => el.dataset.state = 'down');
  addEventListener('pointerup', () => delete el.dataset.state);

  document.addEventListener(
    'pointerover',
    (e) => {
      const hot = e.target.closest('a, button, [data-cursor]');
      if (hot) el.dataset.state = 'hover';
    },
    true,
  );
  document.addEventListener(
    'pointerout',
    (e) => {
      if (e.target.closest('a, button, [data-cursor]')) delete el.dataset.state;
    },
    true,
  );

  onFrame(({ dt }) => {
    pos.x = damp(pos.x, target.x, 18, dt);
    pos.y = damp(pos.y, target.y, 18, dt);
    el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
  });
};
