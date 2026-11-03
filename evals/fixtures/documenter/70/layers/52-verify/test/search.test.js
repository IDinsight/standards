import assert from 'node:assert/strict';
import test from 'node:test';

import { QuerySyntaxError } from '../src/query.js';
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

test('tag filter matches tags ignoring case', () => {
  assert.deepEqual(ids(search(notes, 'tag:WORK')), [1, 3]);
  assert.deepEqual(ids(search(notes, 'tag:finance budget')), [3]);
});

test('title filter only looks at the title', () => {
  assert.deepEqual(ids(search(notes, 'title:weekly')), [1]);
});

test('quoted phrase must appear as written', () => {
  assert.deepEqual(ids(search(notes, '"budget review"')), [1]);
  assert.deepEqual(ids(search(notes, '"weekly budget"')), []);
});

test('old filter form throws', () => {
  assert.throws(() => search(notes, 'tag=work'), QuerySyntaxError);
});
