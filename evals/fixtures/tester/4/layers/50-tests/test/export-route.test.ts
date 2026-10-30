import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createApp } from '../src/app.ts';
import type { User } from '../src/auth.ts';
import type { AppRequest } from '../src/http.ts';
import { parseCsv } from '../src/parse-csv.ts';
import type { RecordItem } from '../src/store.ts';

const admin: User = { id: 1, name: 'Ada', role: 'admin' };

function exportRequest(user: User | null, query: Record<string, string> = {}): AppRequest {
  return { method: 'POST', path: '/records/export', query, user };
}

test("an administrator's export holds the records the listing shows", () => {
  const app = createApp();
  const listed: RecordItem[] = JSON.parse(app.handle({ method: 'GET', path: '/records', query: { owner: 'dana' }, user: admin }).body).records;
  const response = app.handle(exportRequest(admin, { owner: 'dana' }));
  assert.equal(response.status, 200);
  assert.equal(response.headers['content-type'], 'text/csv; charset=utf-8');
  const [header, ...rows] = parseCsv(response.body);
  assert.deepEqual(header, ['id', 'title', 'owner', 'status', 'createdAt']);
  assert.deepEqual(rows, listed.map((r) => [String(r.id), r.title, r.owner, r.status, r.createdAt]));
  assert.equal(rows.length, 2);
});

test('editors and viewers are refused with 403', () => {
  for (const role of ['editor', 'viewer']) {
    const response = createApp().handle(exportRequest({ id: 2, name: 'Eli', role: role as User['role'] }));
    assert.equal(response.status, 403, role);
    assert.deepEqual(JSON.parse(response.body), { error: 'forbidden' });
  }
});

test('an export without a signed-in user gets 401', () => {
  const response = createApp().handle(exportRequest(null));
  assert.equal(response.status, 401);
  assert.deepEqual(JSON.parse(response.body), { error: 'authentication required' });
});
