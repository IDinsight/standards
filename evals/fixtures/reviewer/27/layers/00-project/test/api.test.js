import assert from 'node:assert/strict';
import test from 'node:test';

import { createTicketRoute, getTicketRoute, updateTicketRoute } from '../src/api.js';
import { TicketService } from '../src/service.js';

const staff = { staff: true };
const customer = { staff: false };

test('staff can create and read a ticket', () => {
  const service = new TicketService();
  const created = createTicketRoute(service, staff, { title: 'Printer offline', priority: 'high' });
  assert.equal(created.status, 201);
  assert.equal(created.body.id, 1);
  const read = getTicketRoute(service, staff, 1);
  assert.equal(read.status, 200);
  assert.equal(read.body.title, 'Printer offline');
  assert.equal(read.body.assignee, null);
});

test('customers get the public view', () => {
  const service = new TicketService();
  createTicketRoute(service, staff, { title: 'Printer offline', assignee: 'sam' });
  assert.deepEqual(getTicketRoute(service, customer, 1), {
    status: 200,
    body: { id: 1, title: 'Printer offline', priority: 'normal', status: 'open' },
  });
});

test('customers cannot create or update tickets', () => {
  const service = new TicketService();
  createTicketRoute(service, staff, { title: 'Printer offline' });
  assert.equal(createTicketRoute(service, customer, { title: 'Other' }).status, 403);
  assert.equal(updateTicketRoute(service, customer, 1, { status: 'closed' }).status, 403);
  assert.equal(service.get(1).status, 'open');
});

test('invalid input returns 400 and stores nothing', () => {
  const service = new TicketService();
  assert.deepEqual(createTicketRoute(service, staff, { title: '' }), { status: 400, body: { error: 'title: is required' } });
  assert.equal(service.get(1), null);
  createTicketRoute(service, staff, { title: 'Printer offline' });
  assert.equal(updateTicketRoute(service, staff, 1, { priority: 'urgent' }).status, 400);
  assert.equal(service.get(1).priority, 'normal');
});

test('unknown ticket returns 404', () => {
  const service = new TicketService();
  assert.equal(getTicketRoute(service, staff, 9).status, 404);
  assert.equal(updateTicketRoute(service, staff, 9, { status: 'closed' }).status, 404);
});
