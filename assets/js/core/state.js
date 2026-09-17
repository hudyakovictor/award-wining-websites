/** Прогресс курса в localStorage: пройденные блоки, чек-листы, открытые модули. */
import { on, emit } from './bus.js';

const KEY = 'aw2026.v1';
const fallback = { done: [], checks: {}, open: [], sound: false };

let state = load();

function load() {
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...fallback };
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* приватный режим — работаем в памяти */
  }
}

export const getState = () => state;
export const isDone = (id) => state.done.includes(id);
export const progress = (total) => (total ? state.done.length / total : 0);

export const toggleDone = (id) => {
  state.done = isDone(id) ? state.done.filter((x) => x !== id) : [...state.done, id];
  save();
  emit('progress', state.done.length);
  return isDone(id);
};

export const toggleOpen = (moduleId) => {
  state.open = state.open.includes(moduleId)
    ? state.open.filter((x) => x !== moduleId)
    : [...state.open, moduleId];
  save();
};

export const isOpen = (moduleId) => state.open.includes(moduleId);

export const toggleCheck = (key) => {
  state.checks[key] = !state.checks[key];
  save();
  return state.checks[key];
};

export const isChecked = (key) => Boolean(state.checks[key]);

export const reset = () => {
  state = { ...fallback };
  save();
  emit('progress', 0);
};

export const subscribe = (fn) => on('progress', fn);
