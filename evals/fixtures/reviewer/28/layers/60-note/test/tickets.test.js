import assert from 'node:assert/strict';
import test from 'node:test';

import { serializeTicket } from '../src/serialize.js';
import { TicketStore } from '../src/tickets.js';

const now = new Date('2026-09-01T10:00:00Z');

function openTicket() {
  const store = new TicketStore();
  const ticket = store.create({ subject: 'Printer offline' }, now);
  return { store, ticket };
}

test('new tickets start open with normal priority', () => {
  const store = new TicketStore();
  const ticket = store.create({ subject: '  Printer offline ' }, now);
  assert.equal(ticket.subject, 'Printer offline');
  assert.equal(ticket.status, 'open');
  assert.equal(ticket.priority, 'normal');
  assert.equal(ticket.createdAt, '2026-09-01T10:00:00.000Z');
});

test('customers cannot change staff fields', () => {
  const { store, ticket } = openTicket();
  assert.throws(() => store.update(ticket.id, { assignee: 'sam' }, 'customer'), /may not change assignee/);
});

test('agents can assign and reprioritize', () => {
  const { store, ticket } = openTicket();
  const updated = store.update(ticket.id, { assignee: 'sam', priority: 'high' }, 'agent');
  assert.equal(updated.assignee, 'sam');
  assert.equal(updated.priority, 'high');
});

test('unknown priorities are rejected', () => {
  const { store, ticket } = openTicket();
  assert.throws(() => store.update(ticket.id, { priority: 'urgent' }, 'agent'), /unknown priority/);
});

test('new tickets have no internal note', () => {
  const { ticket } = openTicket();
  assert.equal(serializeTicket(ticket, 'agent').internalNote, null);
  assert.equal('internalNote' in serializeTicket(ticket, 'customer'), false);
});

test('staff can set an internal note that customers cannot see', () => {
  const { store, ticket } = openTicket();
  const updated = store.update(ticket.id, { internalNote: '  Waiting on the vendor. ' }, 'agent');
  assert.equal(updated.internalNote, 'Waiting on the vendor.');
  assert.equal(serializeTicket(updated, 'admin').internalNote, 'Waiting on the vendor.');
  assert.equal('internalNote' in serializeTicket(updated, 'customer'), false);
});

test('customers cannot set an internal note', () => {
  const { store, ticket } = openTicket();
  assert.throws(() => store.update(ticket.id, { internalNote: 'hello' }, 'customer'), /may not change internalNote/);
});

test('a blank internal note clears it', () => {
  const { store, ticket } = openTicket();
  store.update(ticket.id, { internalNote: 'Call back Monday' }, 'agent');
  assert.equal(store.update(ticket.id, { internalNote: '   ' }, 'agent').internalNote, null);
});
