/** Считает реальные px шкалы типов из tokens.css по ширинам вьюпорта. */
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../assets/css/tokens.css', import.meta.url), 'utf8');
const tokens = [...css.matchAll(/(--fs-[a-z0-9]+):\s*clamp\(([^)]+)\)/g)].map(([, name, args]) => {
  const [min, mid, max] = args.split(',').map((s) => s.trim());
  return { name, min, mid, max };
});

const px = (v, vw) => {
  const n = Number.parseFloat(v);
  if (v.endsWith('vw')) return (n * vw) / 100;
  return n * 16;
};
const widths = [320, 390, 768, 1024, 1280, 1440, 1920, 2560];

console.log('токен       ' + widths.map((w) => String(w).padStart(6)).join(''));
for (const t of tokens) {
  const [midVal, midUnit] = t.mid.split(' ').join('').match(/([-\d.]+)(rem|vw)?/)?.slice(1) ?? [];
  const row = widths.map((w) => {
    const base = Number.parseFloat(t.mid);
    const rest = t.mid.replace(/^[-\d.]+(rem|vw)?/, '').replace(/^\s*\+\s*/, '');
    const value = px(`${base}rem`, w) + (rest ? px(rest, w) : 0);
    return Math.round(Math.min(px(t.max, w), Math.max(px(t.min, w), value)));
  });
  console.log(t.name.padEnd(12) + row.map((v) => `${v}px`.padStart(6)).join(''));
}
