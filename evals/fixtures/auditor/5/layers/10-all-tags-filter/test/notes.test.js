import assert from 'node:assert/strict';
import test from 'node:test';

import { createNote, notesWithAllTags, notesWithAnyTag } from '../src/index.js';

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

test('notesWithAllTags keeps notes that carry every requested tag', () => {
  assert.deepEqual(notesWithAllTags(notes, [' Travel', 'WORK']).map((note) => note.id), [1]);
});

test('notesWithAllTags keeps input order', () => {
  assert.deepEqual(notesWithAllTags(notes, ['travel']).map((note) => note.id), [1, 2]);
});

test('notesWithAllTags with no tags returns every note', () => {
  assert.deepEqual(notesWithAllTags(notes, []).map((note) => note.id), [1, 2, 3]);
});
