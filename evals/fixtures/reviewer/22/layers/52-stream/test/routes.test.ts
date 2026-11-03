import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createApp } from '../src/app.ts';
import type { User } from '../src/auth/users.ts';
import type { AppRequest } from '../src/http/messages.ts';

const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };

function get(path: string, query: Record<string, string> = {}, user: User | null = viewer): AppRequest {
  return { method: 'GET', path, query, user };
}

function ids(body: string): number[] {
  return JSON.parse(body).records.map((record: { id: number }) => record.id);
}

test('GET /records lists the seeded records for any signed-in role', async () => {
  const response = await createApp().handle(get('/records'));
  assert.equal(response.status, 200);
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  assert.equal(JSON.parse(response.body).count, 6);
  assert.deepEqual(ids(response.body), [1, 2, 3, 4, 5, 6]);
});

test('GET /records applies status and owner filters', async () => {
  const response = await createApp().handle(get('/records', { status: 'active', owner: 'marco' }));
  assert.deepEqual(ids(response.body), [4, 6]);
});

test('GET /records searches titles', async () => {
  const response = await createApp().handle(get('/records', { q: 'REVIEW' }));
  assert.deepEqual(ids(response.body), [3]);
});

test('GET /records rejects an unknown status with 400', async () => {
  const response = await createApp().handle(get('/records', { status: 'deleted' }));
  assert.equal(response.status, 400);
  assert.deepEqual(JSON.parse(response.body), { error: 'unknown status: deleted' });
});

test('GET /records requires a signed-in user', async () => {
  const response = await createApp().handle(get('/records', {}, null));
  assert.equal(response.status, 401);
});

test('unknown paths return 404', async () => {
  const response = await createApp().handle(get('/reports'));
  assert.equal(response.status, 404);
});
