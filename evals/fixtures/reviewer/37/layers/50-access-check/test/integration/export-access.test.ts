import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../../src/app.ts';
import type { User } from '../../src/auth/users.ts';

// Export requests that must be refused. Each case gets its own export folder
// and checks afterwards that the folder was never created.
const root = mkdtempSync(path.join(tmpdir(), 'records-access-'));
after(() => rmSync(root, { recursive: true, force: true }));

const editor: User = { id: 2, name: 'Eli', role: 'editor' };
const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };

type RefusedExport = {
  label: string;
  folder: string;
  user: User | null;
  status: number;
  error: string;
};

const refused: RefusedExport[] = [
  { label: 'without a signed-in user', folder: 'anonymous', user: null, status: 401, error: 'authentication required' },
  { label: 'from a viewer', folder: 'viewer', user: viewer, status: 403, error: 'forbidden' },
  { label: 'from an editor', folder: 'editor', user: editor, status: 403, error: 'forbidden' },
];

for (const { label, folder, user, status, error } of refused) {
  test(`an export request ${label} is refused and writes no file`, () => {
    const exportDir = path.join(root, folder);
    const app = createApp({ exportDir, now: () => new Date('2026-09-24T09:00:00Z') });
    const response = app.handle({ method: 'POST', path: '/records/export', query: { owner: 'dana' }, user });

    assert.equal(response.status, status);
    assert.deepEqual(JSON.parse(response.body), { error });
    assert.equal(existsSync(exportDir), false);
  });
}
