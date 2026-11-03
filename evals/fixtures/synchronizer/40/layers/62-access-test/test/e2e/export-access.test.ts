import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

// Export access checked end to end through the admin tool's dev stack, which
// serves this package behind its gateway: the gateway resolves the session,
// passes the signed-in user to createApp().handle, and forwards /api/* with the
// prefix removed. Start the stack from the admin-tool repository first.
//   RECORDS_E2E_URL         gateway address
//   RECORDS_E2E_EXPORT_DIR  the service's export folder as mounted by the stack
const baseUrl = process.env.RECORDS_E2E_URL ?? 'http://localhost:8080';
const exportDir = process.env.RECORDS_E2E_EXPORT_DIR ?? '../admin-tool/.data/records/exports';

type Role = 'admin' | 'editor' | 'viewer';

// The dev stack's sign-in endpoint issues a session cookie for a test user
// with the given role.
async function signIn(role: Role): Promise<string> {
  const response = await fetch(`${baseUrl}/dev/sign-in`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  assert.equal(response.status, 204);
  const cookie = response.headers.get('set-cookie');
  assert.ok(cookie, `no session cookie for ${role}`);
  return cookie.split(';')[0];
}

function exportFiles(): string[] {
  return existsSync(exportDir) ? readdirSync(exportDir).sort() : [];
}

function requestExport(cookie?: string): Promise<Response> {
  return fetch(`${baseUrl}/api/records/export?owner=dana`, {
    method: 'POST',
    headers: cookie ? { cookie } : {},
  });
}

test('a signed-out export request gets 401 and writes no file', async () => {
  const before = exportFiles();
  const response = await requestExport();
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'authentication required' });
  assert.deepEqual(exportFiles(), before);
});

for (const role of ['viewer', 'editor'] as const) {
  test(`a ${role} export request gets 403 and writes no file`, async () => {
    const cookie = await signIn(role);
    const before = exportFiles();
    const response = await requestExport(cookie);
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: 'forbidden' });
    assert.deepEqual(exportFiles(), before);
  });
}

test('an admin export request through the gateway writes the named file', async () => {
  const cookie = await signIn('admin');
  const response = await requestExport(cookie);
  assert.equal(response.status, 201);
  assert.equal(response.headers.get('content-type'), 'text/csv; charset=utf-8');
  const name = /filename="([^"]+)"/.exec(response.headers.get('content-disposition') ?? '')?.[1];
  assert.ok(name && exportFiles().includes(name), `export file ${name} not found in ${exportDir}`);
});
