import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../src/app.ts';
import type { User } from '../src/auth/users.ts';
import type { AppRequest } from '../src/http/messages.ts';

// Export requests the service must refuse before it writes anything. Each
// test gives the app its own export folder under a temporary root.
const root = mkdtempSync(path.join(tmpdir(), 'records-export-access-'));
after(() => rmSync(root, { recursive: true, force: true }));

const admin: User = { id: 1, name: 'Ada', role: 'admin' };
const editor: User = { id: 2, name: 'Eli', role: 'editor' };
const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };
const fixedNow = () => new Date('2026-09-24T09:00:00Z');

function exportRequest(user: User | null, query: Record<string, string> = {}): AppRequest {
  return { method: 'POST', path: '/records/export', query, user };
}

test('an export request without a signed-in user gets 401 and writes nothing', () => {
  const exportDir = path.join(root, 'anonymous');
  const response = createApp({ exportDir, now: fixedNow }).handle(exportRequest(null));

  assert.equal(response.status, 401);
  assert.deepEqual(JSON.parse(response.body), { error: 'authentication required' });
  assert.equal(existsSync(path.join(root, 'exports')), false);
});

test('a viewer gets 403 and no export folder is created', () => {
  const exportDir = path.join(root, 'viewer');
  const response = createApp({ exportDir, now: fixedNow }).handle(exportRequest(viewer));

  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
  assert.equal(existsSync(exportDir), false);
});

test('an editor gets 403 and no export folder is created', () => {
  const exportDir = path.join(root, 'editor');
  const response = createApp({ exportDir, now: fixedNow }).handle(exportRequest(editor));

  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
  assert.equal(existsSync(exportDir), false);
});

test('an invalid status is rejected with 400 before anything is written', () => {
  const exportDir = path.join(root, 'invalid-status');
  const response = createApp({ exportDir, now: fixedNow }).handle(exportRequest(admin, { status: 'deleted' }));

  assert.equal(response.status, 400);
  assert.deepEqual(JSON.parse(response.body), { error: 'unknown status: deleted' });
  assert.equal(existsSync(exportDir), false);
});
