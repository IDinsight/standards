import assert from 'node:assert/strict';
import test from 'node:test';

import { loadUsers } from '../src/users.js';

test('loads the sample directory', () => {
  const users = loadUsers(new URL('../data/users.json', import.meta.url));
  assert.ok(users.length > 0);
  for (const user of users) assert.deepEqual(Object.keys(user).sort(), ['email', 'id', 'name']);
});
