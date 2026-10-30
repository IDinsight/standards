import assert from 'node:assert/strict';
import test from 'node:test';

import { MemoryStore } from '../src/store.js';
import { RESET_TOKEN_TTL_MS, consumeResetToken, createResetToken } from '../src/tokens.js';

test('a fresh token can be consumed once', () => {
  const store = new MemoryStore();
  const token = createResetToken(store, 7, 1000);
  assert.equal(consumeResetToken(store, token.value, 2000), 7);
  assert.equal(consumeResetToken(store, token.value, 2000), null);
});

test('an expired token is refused', () => {
  const store = new MemoryStore();
  const token = createResetToken(store, 7, 1000);
  assert.equal(consumeResetToken(store, token.value, 1000 + RESET_TOKEN_TTL_MS), null);
});
