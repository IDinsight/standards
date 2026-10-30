import assert from 'node:assert/strict';
import test from 'node:test';

import { createAuditLog } from '../src/auditLog.js';
import { handleAuditView } from '../src/routes/auditView.js';

const log = createAuditLog([
  { timestamp: '2026-09-01T10:00:00Z', actor: 'ana', action: 'login', target: 'console' },
  { timestamp: '2026-09-02T11:30:00Z', actor: 'ben', action: 'role.change', target: 'user:42' },
]);

test('members cannot view the audit log', () => {
  const response = handleAuditView({ id: 3, role: 'member' }, {}, log);
  assert.equal(response.status, 403);
  assert.deepEqual(response.body, { error: 'forbidden' });
});

test('anonymous requests cannot view the audit log', () => {
  assert.equal(handleAuditView(null, {}, log).status, 403);
});

test('administrators see entries matching the filters', () => {
  const response = handleAuditView({ id: 1, role: 'admin' }, { actor: 'ben' }, log);
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.entries.map((entry) => entry.target), ['user:42']);
});
