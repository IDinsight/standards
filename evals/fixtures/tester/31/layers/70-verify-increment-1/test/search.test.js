import assert from 'node:assert/strict';
import test from 'node:test';

import { searchUsers } from '../src/search.js';

const people = [
  { id: 1, name: 'Grace Hopper', email: 'grace.hopper@example.org' },
  { id: 4, name: 'Adele Goldberg', email: 'adele@example.org' },
  { id: 3, name: 'Alan Turing', email: 'alan.turing@example.org' },
  { id: 2, name: 'Ada Lovelace', email: 'ada@example.org' },
];

test('finds people by any part of their name, ignoring case', () => {
  assert.deepEqual(searchUsers(people, 'AD'), [
    { id: 2, name: 'Ada Lovelace', email: 'ada@example.org' },
    { id: 4, name: 'Adele Goldberg', email: 'adele@example.org' },
  ]);
});

test('returns an empty list when nothing matches', () => {
  assert.deepEqual(searchUsers(people, 'zz'), []);
});
