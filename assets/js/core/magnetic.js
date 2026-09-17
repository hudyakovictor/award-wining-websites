/** Магнитные элементы: притяжение к указателю с возвратом (блок 83). */
import { onFrame, damp } from './raf.js';

export const initMagnetic = (root = document) => {
  if (!matchMedia('(pointer: fine)').matches) return;

  [...root.querySelectorAll('[data-magnetic]')].forEach((el) => {
    const strength = Number(el.dataset.magnetic || 0.28);
    const pos = { x: 0, y: 0 };
    const goal = { x: 0, y: 0 };
    let active = false;

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      goal.x = (e.clientX - (r.left + r.width / 2)) * strength;
      goal.y = (e.clientY - (r.top + r.height / 2)) * strength;
      active = true;
    });
    el.addEventListener('pointerleave', () => {
      goal.x = 0;
      goal.y = 0;
      active = false;
    });

    onFrame(({ dt }) => {
      pos.x = damp(pos.x, goal.x, active ? 12 : 8, dt);
      pos.y = damp(pos.y, goal.y, active ? 12 : 8, dt);
      if (Math.abs(pos.x) < 0.05 && Math.abs(pos.y) < 0.05 && !active) {
        pos.x = 0;
        pos.y = 0;
      }
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    });
  });
};
