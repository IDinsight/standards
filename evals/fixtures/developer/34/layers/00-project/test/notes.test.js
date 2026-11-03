import assert from 'node:assert/strict';
import test from 'node:test';

import { addNote, listNotes } from '../src/notes.js';
import { createStore } from '../src/store.js';

test('listNotes hides archived notes and sorts newest first', () => {
  const store = createStore([
    { id: 1, title: 'Old', body: '', tags: [], archived: false, updatedAt: '2026-09-01T10:00:00.000Z' },
    { id: 2, title: 'Archived', body: '', tags: [], archived: true, updatedAt: '2026-09-03T10:00:00.000Z' },
    { id: 3, title: 'New', body: '', tags: [], archived: false, updatedAt: '2026-09-02T10:00:00.000Z' },
  ]);
  assert.deepEqual(listNotes(store).map((note) => note.id), [3, 1]);
  assert.deepEqual(listNotes(store, { includeArchived: true }).map((note) => note.id), [2, 3, 1]);
});

test('addNote trims the title and normalizes tags', () => {
  const store = createStore();
  const note = addNote(store, { title: '  Groceries ', tags: [' Home', 'ERRANDS', ' '] });
  assert.equal(note.title, 'Groceries');
  assert.deepEqual(note.tags, ['home', 'errands']);
  assert.equal(listNotes(store).length, 1);
});

test('addNote rejects an empty title', () => {
  assert.throws(() => addNote(createStore(), { title: '   ' }), /title is required/);
});
