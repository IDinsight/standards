import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../../src/app.js';

// Export requests that must be refused. Each case gets its own export folder,
// which must still be absent after the request.
const root = mkdtempSync(path.join(tmpdir(), 'records-access-'));
after(() => rmSync(root, { recursive: true, force: true }));

const fixedNow = () => new Date('2026-09-24T09:00:00Z');
const editor = { id: 2, name: 'Eli', role: 'editor' };
const viewer = { id: 3, name: 'Vik', role: 'viewer' };

const refused = [
  ['no signed-in user', null, 401, 'authentication required'],
  ['viewer', viewer, 403, 'forbidden'],
  ['editor', editor, 403, 'forbidden'],
];

for (const [label, user, status, error] of refused) {
  test(`export by ${label} is refused and writes no file`, () => {
    const exportDir = path.join(root, label.replaceAll(' ', '-'));
    const app = createApp({ exportDir, now: fixedNow });
    const response = app.handle({ method: 'POST', path: '/records/export', query: { owner: 'dana' }, user });

    assert.equal(response.status, status);
    assert.deepEqual(JSON.parse(response.body), { error });
    assert.equal(existsSync(exportDir), false);
  });
}

test('the role check runs before filter validation', () => {
  const exportDir = path.join(root, 'invalid-status');
  const app = createApp({ exportDir, now: fixedNow });
  const response = app.handle({ method: 'POST', path: '/records/export', query: { status: 'deleted' }, user: viewer });

  assert.equal(response.status, 403);
  assert.equal(existsSync(exportDir), false);
});
