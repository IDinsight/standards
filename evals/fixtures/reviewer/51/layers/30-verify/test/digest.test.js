import assert from 'node:assert/strict';
import test from 'node:test';

import { buildDigests, queueOverdueDigests } from '../src/digest.js';
import { createOutbox } from '../src/mailer.js';

const TODAY = '2026-09-20';
const loan = (id, email, name, title, due, returned = null) => ({ id, borrower: { name, email }, title, due, returned });

const loans = [
  loan('L1', 'ada@example.org', 'Ada', 'Dune', '2026-09-18'),
  loan('L2', 'Ada@Example.org', 'Ada', 'Emma', '2026-09-05'),
  loan('L3', 'lin@example.org', 'Lin', 'Kindred', '2026-09-19'),
  loan('L4', 'lin@example.org', 'Lin', 'Beloved', '2026-09-01', '2026-09-15'),
  loan('L5', 'sam@example.org', 'Sam', 'Ulysses', '2026-09-20'),
  loan('L6', 'sam@example.org', 'Sam', 'Middlemarch', '2026-09-30'),
];

test('one digest per borrower with overdue loans, none for others', () => {
  const digests = buildDigests(loans, TODAY);
  assert.deepEqual(digests.map((digest) => digest.email.toLowerCase()), ['ada@example.org', 'lin@example.org']);
});

test('items are listed most overdue first with days overdue', () => {
  const [ada] = buildDigests(loans, TODAY);
  assert.deepEqual(ada.items, [{ title: 'Emma', days: 15 }, { title: 'Dune', days: 2 }]);
});

test('ties in days overdue are ordered by title', () => {
  const tied = [
    loan('T1', 'kim@example.org', 'Kim', 'Persuasion', '2026-09-17'),
    loan('T2', 'kim@example.org', 'Kim', 'Emma', '2026-09-17'),
  ];
  assert.deepEqual(buildDigests(tied, TODAY)[0].items.map((item) => item.title), ['Emma', 'Persuasion']);
});

test('returned loans and loans due today or later are excluded', () => {
  const titles = buildDigests(loans, TODAY).flatMap((digest) => digest.items.map((item) => item.title));
  assert.equal(titles.includes('Beloved'), false);
  assert.equal(titles.includes('Ulysses'), false);
  assert.equal(titles.includes('Middlemarch'), false);
});

test('queues one message per digest through the outbox', () => {
  const outbox = createOutbox();
  assert.equal(queueOverdueDigests(loans, TODAY, outbox), 2);
  assert.deepEqual(outbox.map((message) => [message.to, message.subject]), [
    ['ada@example.org', 'Overdue items: 2'],
    ['lin@example.org', 'Overdue items: 1'],
  ]);
  assert.match(outbox[0].body, /^Hello Ada,\n\n- Emma \(15 days overdue\)\n- Dune \(2 days overdue\)\n/);
  assert.match(outbox[1].body, /- Kindred \(1 day overdue\)/);
});
