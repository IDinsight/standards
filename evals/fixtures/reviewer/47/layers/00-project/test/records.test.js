import assert from 'node:assert/strict';
import test from 'node:test';

import { dispatch } from '../src/routes.js';

const member = { id: 7, role: 'member' };

test('GET /records returns every record to a member', () => {
  const response = dispatch('GET', '/records', member);
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(response.body).length, 3);
});

test('unknown routes return 404', () => {
  const response = dispatch('GET', '/nowhere', member);
  assert.equal(response.status, 404);
  assert.deepEqual(JSON.parse(response.body), { error: 'not found' });
});
