import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { createApp } from '../../src/app.ts';
import type { User } from '../../src/auth/users.ts';
import type { AppRequest } from '../../src/http/messages.ts';

const root = mkdtempSync(path.join(tmpdir(), 'records-export-'));
after(() => rmSync(root, { recursive: true, force: true }));

const admin: User = { id: 1, name: 'Ada', role: 'admin' };
const viewer: User = { id: 3, name: 'Vik', role: 'viewer' };

function exportRequest(query: Record<string, string>, user: User | null = admin): AppRequest {
  return { method: 'POST', path: '/records/export', query, user };
}

function clock(start: string) {
  let current = new Date(start);
  return { now: () => current, set: (iso: string) => { current = new Date(iso); } };
}

test('an administrator exports the filtered records to a CSV file', () => {
  const exportDir = path.join(root, 'by-owner');
  const response = createApp({ exportDir, now: clock('2026-09-24T09:00:00Z').now }).handle(exportRequest({ owner: 'dana' }));
  assert.equal(response.status, 201);
  const written = readFileSync(path.join(exportDir, 'records-20260924T090000Z.csv'), 'utf8');
  assert.equal(written, 'id,title,owner,status,createdAt\r\n'
    + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
    + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n');
  assert.equal(response.body, written);
});

test('export requests without an administrator are denied and write no file', () => {
  const exportDir = path.join(root, 'denied');
  const app = createApp({ exportDir });
  assert.equal(app.handle(exportRequest({}, null)).status, 401);
  assert.equal(app.handle(exportRequest({}, viewer)).status, 403);
  assert.equal(existsSync(exportDir), false);
});

test('repeating an export within a minute returns the first file', () => {
  const exportDir = path.join(root, 'repeat');
  const time = clock('2026-09-24T09:00:00Z');
  const app = createApp({ exportDir, now: time.now });
  const first = app.handle(exportRequest({ owner: 'li' }));
  time.set('2026-09-24T09:00:45Z');
  const second = app.handle(exportRequest({ owner: 'li' }));
  assert.equal(first.status, 201);
  assert.equal(second.status, 200);
  assert.equal(second.body, first.body);
  assert.deepEqual(readdirSync(exportDir), ['records-20260924T090000Z.csv']);
});

test('an export after the window or with other filters writes a new file', () => {
  const exportDir = path.join(root, 'later');
  const time = clock('2026-09-24T09:00:00Z');
  const app = createApp({ exportDir, now: time.now });
  app.handle(exportRequest({ owner: 'li' }));
  time.set('2026-09-24T09:00:30Z');
  assert.equal(app.handle(exportRequest({ owner: 'marco' })).status, 201);
  time.set('2026-09-24T09:01:00Z');
  assert.equal(app.handle(exportRequest({ owner: 'li' })).status, 201);
  assert.equal(readdirSync(exportDir).length, 3);
});
