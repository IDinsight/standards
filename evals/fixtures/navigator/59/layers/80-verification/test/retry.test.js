import assert from 'node:assert/strict';
import test from 'node:test';

import { SendError, sendMessage } from '../src/send.js';

const message = { to: 'ada@example.org', subject: 'Weekly report', body: 'Attached.' };

function scriptedTransport(statuses) {
  const transport = {
    calls: 0,
    async send() {
      transport.calls += 1;
      return { status: statuses[transport.calls - 1] ?? statuses.at(-1) };
    },
  };
  return transport;
}

function recordSleep() {
  const delays = [];
  return {
    delays,
    sleep: async (ms) => {
      delays.push(ms);
    },
  };
}

test('retries a transient failure and returns the later success', async () => {
  const transport = scriptedTransport([503, 202]);
  const { delays, sleep } = recordSleep();
  const response = await sendMessage(transport, message, { sleep });
  assert.equal(response.status, 202);
  assert.equal(transport.calls, 2);
  assert.deepEqual(delays, [200]);
});

test('stops after maxAttempts transient failures', async () => {
  const transport = scriptedTransport([503]);
  const { delays, sleep } = recordSleep();
  await assert.rejects(sendMessage(transport, message, { sleep }), (error) => {
    assert.ok(error instanceof SendError);
    assert.equal(error.status, 503);
    assert.equal(error.attempts, 3);
    return true;
  });
  assert.equal(transport.calls, 3);
  assert.deepEqual(delays, [200, 400]);
});

test('does not retry a non-transient failure', async () => {
  const transport = scriptedTransport([400]);
  const { sleep } = recordSleep();
  await assert.rejects(sendMessage(transport, message, { sleep }), (error) => {
    assert.equal(error.status, 400);
    assert.equal(error.attempts, 1);
    return true;
  });
  assert.equal(transport.calls, 1);
});
