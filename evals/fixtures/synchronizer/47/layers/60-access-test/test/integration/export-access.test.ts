import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../../src/app.ts';
import type { User } from '../../src/auth/users.ts';
import type { AppRequest } from '../../src/http/messages.ts';

// Export requests from users who may not export, against the seeded app. The
// export folder lives in a temporary directory removed afterwards.
const root = mkdtempSync(path.join(tmpdir(), 'records-export-access-'));
after(() => rmSync(root, { recursive: true, force: true }));

const editor: User = { id: 2, name: 'Eli', role: 'editor' };
const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };
const fixedNow = () => new Date('2026-09-24T09:00:00Z');

function exportRequest(user: User | null): AppRequest {
  return { method: 'POST', path: '/records/export', query: { owner: 'dana' }, user };
}

test('export requests without an administrator are denied and write no file', () => {
  const exportDir = path.join(root, 'denied');
  const app = createApp({ exportDir, now: fixedNow });
  const denied: [User | null, number, string][] = [
    [null, 401, 'authentication required'],
    [viewer, 403, 'forbidden'],
    [editor, 403, 'forbidden'],
  ];

  for (const [user, status, error] of denied) {
    const response = app.handle(exportRequest(user));
    assert.equal(response.status, status);
    assert.deepEqual(JSON.parse(response.body), { error });
    assert.equal(existsSync(exportDir), false);
  }
});
