import assert from 'node:assert/strict';
import test from 'node:test';

import { createStore, notesWithTag, saveNote } from '../src/notes.js';

test('saveNote stores a copy of the note', () => {
  const store = createStore();
  const saved = saveNote(store, { id: 'n1', title: 'Groceries', body: 'milk', tags: ['home'] });
  assert.deepEqual(store.get('n1'), saved);
});

test('notesWithTag finds notes regardless of tag case or spacing', () => {
  const store = createStore();
  saveNote(store, { id: 'n1', title: 'A', body: '', tags: [' Work '] });
  saveNote(store, { id: 'n2', title: 'B', body: '', tags: ['home'] });
  assert.deepEqual(notesWithTag(store, 'WORK').map((note) => note.id), ['n1']);
});
