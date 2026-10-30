import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../src/app.ts';
import type { User } from '../src/auth/users.ts';
import type { AppResponse } from '../src/http/messages.ts';

// Export requests from callers who may not export. Each request gets its own
// export folder so the test can check that nothing was created.
const root = mkdtempSync(path.join(tmpdir(), 'records-export-access-'));
after(() => rmSync(root, { recursive: true, force: true }));

function exportAs(user: User | null, folder: string): { response: AppResponse; exportDir: string } {
  const exportDir = path.join(root, folder);
  const response = createApp({ exportDir }).handle({ method: 'POST', path: '/records/export', query: {}, user });
  return { response, exportDir };
}

test('an export without a signed-in user is rejected and writes nothing', () => {
  const { response, exportDir } = exportAs(null, 'anonymous');
  assert.equal(response.status, 401);
  assert.deepEqual(JSON.parse(response.body), { error: 'authentication required' });
  assert.equal(existsSync(exportDir), false);
});

test('a viewer cannot export and nothing is written', () => {
  const { response, exportDir } = exportAs({ id: 3, name: 'Vik', role: 'viewer' }, 'viewer');
  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
  assert.equal(existsSync(exportDir), false);
});

test('an editor cannot export and nothing is written', () => {
  const { response, exportDir } = exportAs({ id: 2, name: 'Eli', role: 'editor' }, 'editor');
  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
  assert.equal(existsSync(exportDir), false);
});
