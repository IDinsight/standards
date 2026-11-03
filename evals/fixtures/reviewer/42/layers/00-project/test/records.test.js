import assert from 'node:assert/strict';
import test from 'node:test';

import { handle } from '../src/handlers.js';
import { createStore } from '../src/store.js';

function sampleStore(count) {
  return createStore(Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: 'Person ' + (i + 1),
    email: 'person' + (i + 1) + '@example.org',
  })));
}

test('lists records with the default page size', () => {
  const { status, body } = handle('GET', '/records', sampleStore(30));
  assert.equal(status, 200);
  assert.equal(body.items.length, 20);
  assert.equal(body.pageSize, 20);
  assert.equal(body.total, 30);
});

test('caps the page size at 50', () => {
  const { body } = handle('GET', '/records?pageSize=500', sampleStore(80));
  assert.equal(body.pageSize, 50);
  assert.equal(body.items.length, 50);
});

test('returns later pages', () => {
  const { body } = handle('GET', '/records?page=2&pageSize=20', sampleStore(30));
  assert.equal(body.page, 2);
  assert.equal(body.items.length, 10);
  assert.equal(body.items[0].id, 21);
});

test('rejects other methods', () => {
  assert.equal(handle('POST', '/records', sampleStore(1)).status, 405);
});

test('returns 404 for unknown paths', () => {
  assert.equal(handle('GET', '/people', sampleStore(1)).status, 404);
});
