import assert from 'node:assert/strict';
import test from 'node:test';

import { createApiClient } from '../web/apiClient.js';

test('login and me send credentials with the request', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/login')) return { status: 204 };
    return { status: 200, json: async () => ({ userId: 1 }) };
  };
  const client = createApiClient({ baseUrl: 'https://api.example.test', fetchImpl });
  await client.login('ada@example.org', 'correct horse');
  assert.deepEqual(await client.me(), { userId: 1 });
  assert.deepEqual(calls.map((call) => call.options.credentials), ['include', 'include']);
});

test('me returns null when the session is missing', async () => {
  const client = createApiClient({ baseUrl: 'https://api.example.test', fetchImpl: async () => ({ status: 401 }) });
  assert.equal(await client.me(), null);
});

test('a failed login throws', async () => {
  const client = createApiClient({ baseUrl: 'https://api.example.test', fetchImpl: async () => ({ status: 401 }) });
  await assert.rejects(client.login('ada@example.org', 'nope'), /login failed: 401/);
});
