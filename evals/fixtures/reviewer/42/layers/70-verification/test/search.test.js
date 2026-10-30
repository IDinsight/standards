import assert from 'node:assert/strict';
import test from 'node:test';

import { handle } from '../src/handlers.js';
import { createStore } from '../src/store.js';

const people = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@analytical.example' },
  { id: 2, name: 'Grace Hopper', email: 'grace@navy.example' },
  { id: 3, name: 'Alan Turing', email: 'alan@bletchley.example' },
];

function members(count) {
  return createStore(Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: 'Member ' + (i + 1),
    email: 'm' + (i + 1) + '@example.org',
  })));
}

test('matches names case-insensitively', () => {
  const { status, body } = handle('GET', '/records/search?q=LOVE', createStore(people));
  assert.equal(status, 200);
  assert.deepEqual(body.items.map((item) => item.id), [1]);
});

test('matches emails case-insensitively', () => {
  const { body } = handle('GET', '/records/search?q=NAVY', createStore(people));
  assert.deepEqual(body.items.map((item) => item.id), [2]);
});

test('rejects a missing or blank q', () => {
  const missing = handle('GET', '/records/search', createStore(people));
  const blank = handle('GET', '/records/search?q=%20%20', createStore(people));
  assert.equal(missing.status, 400);
  assert.equal(blank.status, 400);
  assert.ok(missing.body.error);
});

test('returns 20 results per page by default', () => {
  const { body } = handle('GET', '/records/search?q=member', members(30));
  assert.equal(body.items.length, 20);
  assert.equal(body.page, 1);
  assert.equal(body.pageSize, 20);
  assert.equal(body.total, 30);
});

test('returns the remaining matches on page 2', () => {
  const { body } = handle('GET', '/records/search?q=member&page=2', members(30));
  assert.equal(body.page, 2);
  assert.equal(body.items.length, 10);
  assert.equal(body.items[0].id, 21);
});
