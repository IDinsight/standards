import assert from 'node:assert/strict';
import test from 'node:test';

import { sendMessage } from '../src/send.js';

function recordingTransport(statuses) {
  const sent = [];
  return {
    sent,
    async send(message) {
      sent.push(message);
      return { status: statuses.shift() ?? 200 };
    },
  };
}

test('delivers a message through the transport', async () => {
  const transport = recordingTransport([202]);
  const message = { to: 'ada@example.org', subject: 'Hello', body: 'Hi Ada' };
  const response = await sendMessage(transport, message);
  assert.equal(response.status, 202);
  assert.deepEqual(transport.sent, [message]);
});
