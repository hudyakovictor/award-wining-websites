/** Мини-шина событий: модули не знают друг о друге. */
const map = new Map();

export const on = (evt, fn) => {
  if (!map.has(evt)) map.set(evt, new Set());
  map.get(evt).add(fn);
  return () => off(evt, fn);
};

export const off = (evt, fn) => map.get(evt)?.delete(fn);

export const emit = (evt, payload) => map.get(evt)?.forEach((fn) => fn(payload));
