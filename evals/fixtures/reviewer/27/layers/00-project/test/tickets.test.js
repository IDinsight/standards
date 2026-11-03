import assert from 'node:assert/strict';
import test from 'node:test';

import { ValidationError } from '../src/fields.js';
import { internalView, newTicket, publicView, updateTicket } from '../src/tickets.js';

test('newTicket trims text and applies defaults', () => {
  const ticket = newTicket(7, { title: '  VPN drops  ', assignee: ' sam ' });
  assert.equal(ticket.id, 7);
  assert.equal(ticket.title, 'VPN drops');
  assert.equal(ticket.priority, 'normal');
  assert.equal(ticket.status, 'open');
  assert.equal(ticket.assignee, 'sam');
});

test('blank assignee is stored as null', () => {
  assert.equal(newTicket(1, { title: 'A', assignee: '   ' }).assignee, null);
  assert.equal(newTicket(2, { title: 'B' }).assignee, null);
});

test('title is required and limited to 120 characters', () => {
  assert.throws(() => newTicket(1, {}), ValidationError);
  assert.throws(() => newTicket(1, { title: '   ' }), /title: is required/);
  assert.throws(() => newTicket(1, { title: 'x'.repeat(121) }), /title: must be at most 120 characters/);
  assert.equal(newTicket(1, { title: 'x'.repeat(120) }).title.length, 120);
});

test('priority must be a known value', () => {
  assert.equal(newTicket(1, { title: 'A', priority: 'high' }).priority, 'high');
  assert.throws(() => newTicket(1, { title: 'A', priority: 'urgent' }), /priority: must be one of low, normal, high/);
});

test('updateTicket changes only the given fields', () => {
  const ticket = newTicket(3, { title: 'Disk full', assignee: 'kim' });
  const next = updateTicket(ticket, { status: 'pending', assignee: null });
  assert.equal(next.status, 'pending');
  assert.equal(next.assignee, null);
  assert.equal(next.title, 'Disk full');
  assert.equal(ticket.status, 'open');
  assert.throws(() => updateTicket(ticket, { status: 'done' }), ValidationError);
});

test('public view hides the assignee', () => {
  const ticket = newTicket(4, { title: 'Reset password', assignee: 'lee' });
  assert.deepEqual(publicView(ticket), { id: 4, title: 'Reset password', priority: 'normal', status: 'open' });
  assert.equal(internalView(ticket).assignee, 'lee');
});
