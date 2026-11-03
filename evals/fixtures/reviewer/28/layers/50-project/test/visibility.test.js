import assert from 'node:assert/strict';
import test from 'node:test';

import { serializeTicket } from '../src/serialize.js';

const ticket = {
  id: 7,
  subject: 'Printer offline',
  status: 'open',
  createdAt: '2026-09-01T10:00:00.000Z',
  assignee: 'sam',
  priority: 'high',
};

test('customers see only public fields', () => {
  assert.deepEqual(serializeTicket(ticket, 'customer'), {
    id: 7,
    subject: 'Printer offline',
    status: 'open',
    createdAt: '2026-09-01T10:00:00.000Z',
  });
});

test('agents see assignee and priority', () => {
  const body = serializeTicket(ticket, 'agent');
  assert.equal(body.assignee, 'sam');
  assert.equal(body.priority, 'high');
});

test('unknown roles see nothing', () => {
  assert.deepEqual(serializeTicket(ticket, 'guest'), {});
});
