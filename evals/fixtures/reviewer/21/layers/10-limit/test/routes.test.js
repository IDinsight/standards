import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createApp } from '../src/app.js';

const viewer = { id: 3, name: 'Vik', role: 'viewer' };

function get(path, query = {}, user = viewer) {
  return { method: 'GET', path, query, user };
}

function ids(body) {
  return JSON.parse(body).records.map((record) => record.id);
}

test('GET /records lists the seeded records for any signed-in role', () => {
  const response = createApp().handle(get('/records'));
  assert.equal(response.status, 200);
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  assert.equal(JSON.parse(response.body).count, 6);
  assert.deepEqual(ids(response.body), [1, 2, 3, 4, 5, 6]);
});

test('GET /records applies status and owner filters', () => {
  const response = createApp().handle(get('/records', { status: 'active', owner: 'marco' }));
  assert.deepEqual(ids(response.body), [4, 6]);
});

test('GET /records rejects an unknown status with 400', () => {
  const response = createApp().handle(get('/records', { status: 'deleted' }));
  assert.equal(response.status, 400);
  assert.deepEqual(JSON.parse(response.body), { error: 'unknown status: deleted' });
});

test('GET /records requires a signed-in user', () => {
  assert.equal(createApp().handle(get('/records', {}, null)).status, 401);
});

test('unknown paths return 404', () => {
  assert.equal(createApp().handle(get('/reports')).status, 404);
});

test('queries longer than 2048 bytes are rejected with 414', () => {
  const response = createApp().handle(get('/records', { q: 'a'.repeat(2047) }));
  assert.equal(response.status, 414);
  assert.deepEqual(JSON.parse(response.body), { error: 'query too long' });
});

test('a query of exactly 2048 bytes is accepted', () => {
  const response = createApp().handle(get('/records', { q: 'a'.repeat(2046) }));
  assert.equal(response.status, 200);
});
