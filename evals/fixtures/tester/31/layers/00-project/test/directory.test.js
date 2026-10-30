import assert from 'node:assert/strict';
import test from 'node:test';

import { findUserById, loadUsers } from '../src/directory.js';

const users = loadUsers(new URL('../data/users.json', import.meta.url));

test('loads every staff record with id, name, and email', () => {
  assert.equal(users.length, 6);
  for (const user of users) assert.deepEqual(Object.keys(user), ['id', 'name', 'email']);
});

test('finds a person by id', () => {
  assert.equal(findUserById(users, 2).name, 'Ada Lovelace');
});

test('returns null for an unknown id', () => {
  assert.equal(findUserById(users, 99), null);
});
