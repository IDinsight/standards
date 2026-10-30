import assert from 'node:assert/strict';
import test from 'node:test';

import { searchUsers } from '../src/search.js';

const users = [
  { id: 1, name: 'Ada Lovelace', email: 'ada.lovelace@example.org' },
  { id: 2, name: 'Alan Turing', email: 'alan.turing@example.org' },
  { id: 3, name: 'Grace Hopper', email: 'grace.hopper@example.org' },
];

test('returns users whose name starts with the query', () => {
  assert.deepEqual(searchUsers(users, 'A').map((user) => user.id), [1, 2]);
});

test('returns nothing when no name matches', () => {
  assert.deepEqual(searchUsers(users, 'Z'), []);
});
