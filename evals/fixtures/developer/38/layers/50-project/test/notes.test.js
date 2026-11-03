import assert from 'node:assert/strict';
import test from 'node:test';

import { createNote, createStore, deleteNote, listNotes } from '../src/notes.js';

test('createNote trims the title and assigns increasing ids', () => {
  const store = createStore();
  const first = createNote(store, { title: '  Groceries ' });
  const second = createNote(store, { title: 'Reading', body: 'Finish chapter 4' });
  assert.equal(first.title, 'Groceries');
  assert.equal(first.id, 1);
  assert.equal(first.body, '');
  assert.equal(second.id, 2);
  assert.equal(second.body, 'Finish chapter 4');
});

test('createNote rejects a blank title', () => {
  assert.throws(() => createNote(createStore(), { title: '   ' }), /title is required/);
});

test('listNotes returns copies in creation order', () => {
  const store = createStore();
  createNote(store, { title: 'a' });
  createNote(store, { title: 'b' });
  const notes = listNotes(store);
  assert.deepEqual(notes.map((note) => note.title), ['a', 'b']);
  notes[0].title = 'changed';
  assert.equal(listNotes(store)[0].title, 'a');
});

test('deleteNote removes a note and reports whether it existed', () => {
  const store = createStore();
  const note = createNote(store, { title: 'Temporary' });
  assert.equal(deleteNote(store, note.id), true);
  assert.equal(deleteNote(store, note.id), false);
  assert.deepEqual(listNotes(store), []);
});
