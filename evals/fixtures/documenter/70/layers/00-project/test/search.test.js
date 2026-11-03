import assert from 'node:assert/strict';
import test from 'node:test';

import { search } from '../src/search.js';

const notes = [
  { id: 1, title: 'Weekly sync', body: 'Budget review and hiring plan', tags: ['work'] },
  { id: 2, title: 'Groceries', body: 'Milk, eggs, weekly market', tags: ['home'] },
  { id: 3, title: 'Sync notes', body: 'Budget: weekly numbers', tags: ['Work', 'finance'] },
];
const ids = (results) => results.map((note) => note.id);

test('every word must appear in the title or body', () => {
  assert.deepEqual(ids(search(notes, 'weekly budget')), [1, 3]);
});

test('tag= limits results to tagged notes', () => {
  assert.deepEqual(ids(search(notes, 'tag=finance')), [3]);
  assert.deepEqual(ids(search(notes, 'tag=WORK weekly')), [1, 3]);
});
