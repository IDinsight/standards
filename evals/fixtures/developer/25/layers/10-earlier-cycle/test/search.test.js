import assert from 'node:assert/strict';
import test from 'node:test';

import { searchUsers } from '../src/search.js';

const users = [
  { id: 1, name: 'Ada Lovelace', email: 'ada.lovelace@example.org' },
  { id: 2, name: 'Grace Hopper', email: 'ghopper@example.org' },
  { id: 3, name: 'Alan Turing', email: 'alan.turing@example.org' },
];

test('matches part of a name', () => {
  assert.deepEqual(searchUsers(users, 'Hopper').map((user) => user.id), [2]);
});

test('blank query returns nothing', () => {
  assert.deepEqual(searchUsers(users, '   '), []);
});
