import assert from 'node:assert/strict';
import test from 'node:test';

import { createWorkerClient } from '../worker/apiClient.js';

test('completeJob sends the service session as the sid cookie', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return { status: 204 };
  };
  const client = createWorkerClient({ baseUrl: 'https://api.example.test', sessionId: 'svc-123', fetchImpl });
  await client.completeJob('job-7');
  assert.equal(calls[0].url, 'https://api.example.test/jobs/complete');
  assert.equal(calls[0].options.headers.cookie, 'sid=svc-123');
  assert.equal(calls[0].options.body, JSON.stringify({ jobId: 'job-7' }));
});

test('a rejected completion throws', async () => {
  const client = createWorkerClient({
    baseUrl: 'https://api.example.test',
    sessionId: 'svc-123',
    fetchImpl: async () => ({ status: 401 }),
  });
  await assert.rejects(client.completeJob('job-9'), /rejected: 401/);
});

test('the worker refuses to start without a service session', () => {
  delete process.env.WORKER_SESSION_ID;
  assert.throws(() => createWorkerClient({ baseUrl: 'https://api.example.test' }), /WORKER_SESSION_ID/);
});
