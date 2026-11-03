import assert from 'node:assert/strict';
import test from 'node:test';

import { handleSearch } from '../src/directory.js';
import { searchUsers } from '../src/search.js';
import { users } from '../src/users.js';

const ids = (list) => list.map((user) => user.id);

test('finds users by part of the name', () => {
  assert.deepEqual(ids(searchUsers(users, 'Hopper')), [2]);
});

test('finds users by email in any letter case', () => {
  assert.deepEqual(ids(searchUsers(users, 'GRACE@example.org')), [2]);
});

test('returns matches in directory order', () => {
  assert.deepEqual(ids(searchUsers(users, 'Ada')), [1, 3, 4]);
});

test('an empty query returns nothing', () => {
  assert.deepEqual(searchUsers(users, ''), []);
});

test('the handler rejects a request without q', () => {
  assert.equal(handleSearch(users, new URLSearchParams('')).status, 400);
});

test('the handler returns id, name, and email only', () => {
  const { status, body } = handleSearch(users, new URLSearchParams('q=Hopper'));
  assert.equal(status, 200);
  assert.deepEqual(body.results, [{ id: 2, name: 'Grace Hopper', email: 'grace@example.org' }]);
});
