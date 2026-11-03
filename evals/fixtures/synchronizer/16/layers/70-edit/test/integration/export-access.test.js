import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../../src/app.js';

// Export requests that must be refused.
const root = mkdtempSync(path.join(tmpdir(), 'records-access-'));
after(() => rmSync(root, { recursive: true, force: true }));

const fixedNow = () => new Date('2026-09-24T09:00:00Z');
const editor = { id: 2, name: 'Eli', role: 'editor' };
const viewer = { id: 3, name: 'Vik', role: 'viewer' };

function exportAs(user, query) {
  const app = createApp({ exportDir: path.join(root, 'out'), now: fixedNow });
  return app.handle({ method: 'POST', path: '/records/export', query, user });
}

const refused = [
  ['no signed-in user', null, 401, 'authentication required'],
  ['viewer', viewer, 403, 'forbidden'],
  ['editor', editor, 403, 'forbidden'],
];

for (const [label, user, status, error] of refused) {
  test(`export by ${label} is refused`, () => {
    const response = exportAs(user, { owner: 'dana' });
    assert.equal(response.status, status);
    assert.deepEqual(JSON.parse(response.body), { error });
  });
}

test('the role check runs before filter validation', () => {
  assert.equal(exportAs(viewer, { status: 'deleted' }).status, 403);
});
