import assert from 'node:assert/strict';
import test from 'node:test';

import { exportHandler } from '../src/export.js';
import { createStore } from '../src/records.js';

const store = createStore([
  { id: 1, title: 'Water point survey', owner: 'field-ops', updatedAt: '2026-08-02' },
  { id: 2, title: 'Clinic visits, Q3', owner: 'health', updatedAt: '2026-09-11' },
]);

test('admin receives CSV with a header and every record', () => {
  const response = exportHandler(store)({ user: { id: 1, roles: ['admin'] } });
  assert.equal(response.status, 200);
  assert.equal(response.headers['content-type'], 'text/csv; charset=utf-8');
  assert.equal(
    response.body,
    'id,title,owner,updatedAt\r\n1,Water point survey,field-ops,2026-08-02\r\n2,"Clinic visits, Q3",health,2026-09-11\r\n',
  );
});
