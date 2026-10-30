import assert from 'node:assert/strict';
import test from 'node:test';

import { ValidationError, createAppointmentService } from '../src/appointments.js';

function fakeRecords() {
  const rows = new Map();
  let next = 1;
  return {
    rows,
    async listAppointments() { return [...rows.values()]; },
    async getAppointment(id) { return rows.get(id) ?? null; },
    async createAppointment(appointment) {
      const row = { id: `apt-${next++}`, ...appointment };
      rows.set(row.id, row);
      return row;
    },
    async updateAppointment(id, changes) {
      const row = { ...rows.get(id), ...changes };
      rows.set(id, row);
      return row;
    },
  };
}

function fakeMailer() {
  const sent = [];
  return { sent, async send(message) { sent.push(message); } };
}

const now = () => new Date('2026-09-20T10:00:00Z');

test('booking stores the appointment and sends a confirmation', async () => {
  const records = fakeRecords();
  const mailer = fakeMailer();
  const service = createAppointmentService({ records, mailer, now });
  const appointment = await service.book({
    patientName: ' Ada Lovelace ', patientEmail: 'Ada@Example.org', startsAt: '2026-09-22T14:30:00Z',
  });
  assert.equal(appointment.status, 'BOOKED');
  assert.equal(appointment.patientName, 'Ada Lovelace');
  assert.equal(appointment.patientEmail, 'ada@example.org');
  assert.equal(records.rows.size, 1);
  assert.deepEqual(mailer.sent.map((message) => message.to), ['ada@example.org']);
  assert.match(mailer.sent[0].text, /2026-09-22 14:30 UTC/);
});

test('booking rejects a start time in the past', async () => {
  const service = createAppointmentService({ records: fakeRecords(), mailer: fakeMailer(), now });
  await assert.rejects(
    service.book({ patientName: 'Ada', patientEmail: 'ada@example.org', startsAt: '2026-09-19T09:00:00Z' }),
    ValidationError,
  );
});

test('cancelling marks the appointment cancelled', async () => {
  const records = fakeRecords();
  const service = createAppointmentService({ records, mailer: fakeMailer(), now });
  const booked = await service.book({
    patientName: 'Grace', patientEmail: 'grace@example.org', startsAt: '2026-09-23T08:00:00Z',
  });
  const cancelled = await service.cancel(booked.id);
  assert.equal(cancelled.status, 'CANCELLED');
  assert.equal(records.rows.get(booked.id).status, 'CANCELLED');
  assert.equal(await service.cancel('apt-missing'), null);
});

test('upcoming lists booked future appointments in start order', async () => {
  const records = fakeRecords();
  const service = createAppointmentService({ records, mailer: fakeMailer(), now });
  const later = await service.book({ patientName: 'B', patientEmail: 'b@example.org', startsAt: '2026-09-25T09:00:00Z' });
  const sooner = await service.book({ patientName: 'A', patientEmail: 'a@example.org', startsAt: '2026-09-21T09:00:00Z' });
  const dropped = await service.book({ patientName: 'C', patientEmail: 'c@example.org', startsAt: '2026-09-22T09:00:00Z' });
  await service.cancel(dropped.id);
  records.rows.set('apt-old', { id: 'apt-old', status: 'BOOKED', startsAt: '2026-09-01T09:00:00.000Z' });
  assert.deepEqual((await service.upcoming()).map((appointment) => appointment.id), [sooner.id, later.id]);
});
