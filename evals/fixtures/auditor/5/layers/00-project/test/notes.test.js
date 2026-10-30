import assert from 'node:assert/strict';
import test from 'node:test';

import { createNote, notesWithAnyTag } from '../src/index.js';

const notes = [
  createNote(1, 'Plan the offsite', ['Work', 'travel']),
  createNote(2, 'Book flights', ['travel']),
  createNote(3, 'Water the plants', ['home']),
];

test('createNote normalizes tags', () => {
  assert.deepEqual([...notes[0].tags], ['work', 'travel']);
});

test('notesWithAnyTag matches any requested tag', () => {
  assert.deepEqual(notesWithAnyTag(notes, ['HOME', 'work']).map((note) => note.id), [1, 3]);
});

test('notesWithAnyTag with no tags returns nothing', () => {
  assert.deepEqual(notesWithAnyTag(notes, []), []);
});
