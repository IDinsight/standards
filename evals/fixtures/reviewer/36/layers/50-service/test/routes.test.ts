import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createApp } from '../src/app.ts';
import type { User } from '../src/auth/users.ts';
import type { AppRequest } from '../src/http/messages.ts';

const northwindViewer: User = { id: 3, name: 'Vik', role: 'viewer', tenantId: 'northwind' };
const harborViewer: User = { id: 7, name: 'Hana', role: 'viewer', tenantId: 'harbor' };

function get(path: string, query: Record<string, string> = {}, user: User | null = northwindViewer): AppRequest {
  return { method: 'GET', path, query, user };
}

function ids(body: string): number[] {
  return JSON.parse(body).records.map((record: { id: number }) => record.id);
}

test('GET /records lists the records of the signed-in tenant', () => {
  const response = createApp().handle(get('/records'));
  assert.equal(response.status, 200);
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  assert.equal(JSON.parse(response.body).count, 3);
  assert.deepEqual(ids(response.body), [1, 2, 3]);
});

test('GET /records shows another tenant only its own records', () => {
  const response = createApp().handle(get('/records', {}, harborViewer));
  assert.deepEqual(ids(response.body), [4, 5, 6]);
});

test('GET /records applies status and owner filters', () => {
  const response = createApp().handle(get('/records', { status: 'active', owner: 'dana' }));
  assert.deepEqual(ids(response.body), [1]);
});

test('GET /records searches titles', () => {
  const response = createApp().handle(get('/records', { q: 'REVIEW' }));
  assert.deepEqual(ids(response.body), [3]);
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
