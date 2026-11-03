import { normalizeTags } from './tags.js';

export function createStore() {
  return new Map();
}

export function saveNote(store, note) {
  if (!note.id) throw new Error('note id is required');
  const saved = {
    id: note.id,
    title: note.title ?? '',
    body: note.body ?? '',
    tags: normalizeTags(note.tags ?? []),
  };
  store.set(saved.id, saved);
  return saved;
}

export function notesWithTag(store, tag) {
  const wanted = String(tag).trim().toLowerCase();
  return [...store.values()].filter((note) => note.tags.includes(wanted));
}
