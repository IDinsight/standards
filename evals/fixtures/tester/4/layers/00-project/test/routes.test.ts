import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createApp } from '../src/app.ts';

test('GET /records lists the filtered records for a viewer', () => {
  const response = createApp().handle({ method: 'GET', path: '/records', query: { owner: 'dana' }, user: { id: 3, name: 'Vik', role: 'viewer' } });
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(response.body).records.map((r: { id: number }) => r.id), [1, 3]);
});

test('GET /records requires a signed-in user', () => {
  assert.equal(createApp().handle({ method: 'GET', path: '/records', query: {}, user: null }).status, 401);
});
