import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../../src/app.ts';
import type { User } from '../../src/auth/users.ts';
import type { AppResponse } from '../../src/http/messages.ts';

// Export requests from users who may not export, each with its own export
// folder so a stray write would be visible.
const root = mkdtempSync(path.join(tmpdir(), 'records-export-access-'));
after(() => rmSync(root, { recursive: true, force: true }));

function exportAs(user: User | null, exportDir: string): AppResponse {
  return createApp({ exportDir }).handle({ method: 'POST', path: '/records/export', query: {}, user });
}

test('an export without a signed-in user is rejected and writes nothing', () => {
  const exportDir = path.join(root, 'anonymous');
  const response = exportAs(null, exportDir);
  assert.equal(response.status, 401);
  assert.deepEqual(JSON.parse(response.body), { error: 'authentication required' });
  assert.equal(existsSync(exportDir), false);
});

test('a viewer cannot export and nothing is written', () => {
  const exportDir = path.join(root, 'viewer');
  const response = exportAs({ id: 3, name: 'Vik', role: 'viewer' }, exportDir);
  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
  assert.equal(existsSync(exportDir), false);
});

test('an editor cannot export and nothing is written', () => {
  const exportDir = path.join(root, 'editor');
  const response = exportAs({ id: 2, name: 'Eli', role: 'editor' }, exportDir);
  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
  assert.equal(existsSync(exportDir), false);
});
