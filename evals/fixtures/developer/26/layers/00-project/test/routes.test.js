import assert from 'node:assert/strict';
import test from 'node:test';

import { createRecord } from '../src/record.js';
import { handleUpdate } from '../src/routes.js';

test('handleUpdate applies changes and maps errors', () => {
  const store = new Map([[1, createRecord({ id: 1, title: 'A', owner: 'b' })]]);
  assert.equal(handleUpdate(store, 1, { status: 'closed' })[0], 200);
  assert.equal(store.get(1).status, 'closed');
  assert.equal(handleUpdate(store, 1, { status: 'gone' })[0], 400);
  assert.equal(handleUpdate(store, 2, {})[0], 404);
});
