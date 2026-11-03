import assert from 'node:assert/strict';
import test from 'node:test';

import { handleSearch } from '../src/server.js';

const users = [
  { id: 1, name: 'Ada Lovelace', email: 'ada.lovelace@example.org' },
  { id: 3, name: 'Grace Hopper', email: 'grace.hopper@example.org' },
];

test('search handler responds with the matching users', () => {
  const { status, body } = handleSearch(users, new URL('http://localhost/users/search?q=Gr'));
  assert.equal(status, 200);
  assert.deepEqual(body, { results: [users[1]] });
});
