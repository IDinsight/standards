import { difference, intersection, normalizeTag } from './tags.js';

export function createNote(id, text, tags = []) {
  return { id, text, tags: new Set(tags.map(normalizeTag)) };
}

export function notesWithAnyTag(notes, tags) {
  const wanted = new Set(tags.map(normalizeTag));
  return notes.filter((note) => intersection(note.tags, wanted).size > 0);
}

export function notesWithAllTags(notes, tags) {
  const wanted = new Set(tags.map(normalizeTag));
  return notes.filter((note) => difference(wanted, note.tags).size === 0);
}
