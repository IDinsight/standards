import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../src/app.ts';
import type { User } from '../src/auth/users.ts';
import type { AppRequest } from '../src/http/messages.ts';

// Each scenario writes into its own folder under a temporary root that is
// removed after the run.
const root = mkdtempSync(path.join(tmpdir(), 'records-export-'));
after(() => rmSync(root, { recursive: true, force: true }));

const fixedNow = () => new Date('2026-09-24T09:00:00Z');

function exportRequest(user: User | null, query: Record<string, string> = {}): AppRequest {
  return { method: 'POST', path: '/records/export', query, user };
}

test('an administrator exports the filtered records to a CSV file', () => {
  const exportDir = path.join(root, 'admin');
  const admin: User = { id: 1, name: 'Ada', role: 'admin' };
  const response = createApp({ exportDir, now: fixedNow }).handle(exportRequest(admin, { owner: 'dana' }));

  assert.equal(response.status, 201);
  assert.equal(response.headers['content-type'], 'text/csv; charset=utf-8');
  assert.equal(response.headers['content-disposition'], 'attachment; filename="records-20260924T090000Z.csv"');
  assert.deepEqual(readdirSync(exportDir), ['records-20260924T090000Z.csv']);
  const written = readFileSync(path.join(exportDir, 'records-20260924T090000Z.csv'), 'utf8');
  assert.equal(
    written,
    'id,title,owner,status,createdAt\r\n'
      + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
      + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n',
  );
  assert.equal(response.body, written);
});

test('an export without a signed-in user is refused before anything is written', () => {
  const exportDir = path.join(root, 'anonymous');
  const response = createApp({ exportDir, now: fixedNow }).handle(exportRequest(null));
  assert.equal(response.status, 401);
  assert.deepEqual(JSON.parse(response.body), { error: 'authentication required' });
  assert.equal(existsSync(exportDir), false);
});

test('a viewer cannot export', () => {
  const exportDir = path.join(root, 'viewer');
  const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };
  const response = createApp({ exportDir, now: fixedNow }).handle(exportRequest(viewer));
  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
  assert.equal(existsSync(exportDir), false);
});

test('an editor cannot export', () => {
  const exportDir = path.join(root, 'editor');
  const editor: User = { id: 2, name: 'Eli', role: 'editor' };
  const response = createApp({ exportDir, now: fixedNow }).handle(exportRequest(editor));
  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
  assert.equal(existsSync(exportDir), false);
});
