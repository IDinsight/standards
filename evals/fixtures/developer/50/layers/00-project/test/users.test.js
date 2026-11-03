import assert from 'node:assert/strict';
import test from 'node:test';

import { createUserStore } from '../src/users.js';

test('add normalizes the username and returns only public fields', () => {
  const users = createUserStore();
  assert.deepEqual(users.add('  Ada ', 'correct horse'), { id: 1, username: 'ada' });
});

test('stored users keep a salted scrypt hash, not the password', () => {
  const users = createUserStore();
  users.add('ada', 'correct horse');
  const stored = users.findByUsername('ADA');
  assert.match(stored.passwordHash, /^[0-9a-f]{32}:[0-9a-f]{64}$/);
  assert.equal(users.findById(stored.id), stored);
});

test('add rejects a taken username regardless of case', () => {
  const users = createUserStore();
  users.add('ada', 'correct horse');
  assert.throws(() => users.add('ADA', 'another secret'), /taken/);
});

test('add rejects short passwords', () => {
  assert.throws(() => createUserStore().add('bob', 'short'), /at least 8/);
});
