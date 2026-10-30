import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../../src/app.ts';
import type { User } from '../../src/auth/users.ts';
import type { AppRequest } from '../../src/http/messages.ts';

// Export requests the service must refuse. Each request gets its own export
// folder path, which must still not exist after the request.
const root = mkdtempSync(path.join(tmpdir(), 'records-export-access-'));
after(() => rmSync(root, { recursive: true, force: true }));

const admin: User = { id: 1, name: 'Ada', role: 'admin' };
const editor: User = { id: 2, name: 'Eli', role: 'editor' };
const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };

function send(folder: string, user: User | null, query: Record<string, string> = {}) {
  const exportDir = path.join(root, folder);
  const request: AppRequest = { method: 'POST', path: '/records/export', query, user };
  const response = createApp({ exportDir, now: () => new Date('2026-09-24T09:00:00Z') }).handle(request);
  return { response, exportDir };
}

test('an export without a signed-in user is refused with 401 and writes nothing', () => {
  const { response, exportDir } = send('anonymous', null);
  assert.equal(response.status, 401);
  assert.deepEqual(JSON.parse(response.body), { error: 'authentication required' });
  assert.equal(existsSync(exportDir), false);
});

test('a viewer export is refused with 403 and writes nothing', () => {
  const { response, exportDir } = send('viewer', viewer, { owner: 'dana' });
  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
  assert.equal(existsSync(exportDir), false);
});

test('an editor export is refused with 403 and writes nothing', () => {
  const { response, exportDir } = send('editor', editor);
  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
  assert.equal(existsSync(exportDir), false);
});

test('an invalid status is rejected with 400 before any file is written', () => {
  const { response, exportDir } = send('bad-status', admin, { status: 'deleted' });
  assert.equal(response.status, 400);
  assert.deepEqual(JSON.parse(response.body), { error: 'unknown status: deleted' });
  assert.equal(existsSync(exportDir), false);
});
