import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createApp } from '../src/app.ts';
import type { User } from '../src/auth/users.ts';

const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };
const ids = (body: string) => JSON.parse(body).records.map((r: { id: number }) => r.id);

test('GET /records lists every record for a signed-in user', () => {
  const response = createApp().handle({ method: 'GET', path: '/records', query: {}, user: viewer });
  assert.equal(response.status, 200);
  assert.deepEqual(ids(response.body), [1, 2, 3, 4, 5, 6]);
});

test('GET /records applies filters', () => {
  const response = createApp().handle({ method: 'GET', path: '/records', query: { status: 'active', owner: 'marco' }, user: viewer });
  assert.deepEqual(ids(response.body), [4, 6]);
});

test('GET /records requires a signed-in user', () => {
  assert.equal(createApp().handle({ method: 'GET', path: '/records', query: {}, user: null }).status, 401);
});
