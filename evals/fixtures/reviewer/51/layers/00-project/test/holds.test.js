import assert from 'node:assert/strict';
import test from 'node:test';

import { queueHoldReadyNotices } from '../src/holds.js';
import { createOutbox } from '../src/mailer.js';

test('queues one notice per ready hold', () => {
  const outbox = createOutbox();
  const holds = [
    { id: 'H1', patron: { name: 'Ada', email: 'ada@example.org' }, title: 'Dune', status: 'ready' },
    { id: 'H2', patron: { name: 'Lin', email: 'lin@example.org' }, title: 'Emma', status: 'waiting' },
  ];
  assert.equal(queueHoldReadyNotices(holds, outbox), 1);
  assert.deepEqual(outbox.map((message) => message.to), ['ada@example.org']);
  assert.equal(outbox[0].subject, 'Ready for pickup: Dune');
});
