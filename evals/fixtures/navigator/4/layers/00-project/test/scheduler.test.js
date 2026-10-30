import assert from 'node:assert/strict';
import test from 'node:test';

import { createMailer } from '../src/mailer.js';
import { createScheduler, parseDueAt } from '../src/scheduler.js';
import { createStore } from '../src/store.js';

test('parseDueAt accepts ISO strings and epoch milliseconds', () => {
  assert.equal(parseDueAt('2026-01-01T00:00:00Z'), Date.UTC(2026, 0, 1));
  assert.equal(parseDueAt(5), 5);
  assert.throws(() => parseDueAt('soon'), /invalid dueAt/);
});

test('tick sends due reminders once, oldest first, up to maxBatch', async () => {
  const sent = [];
  const store = createStore();
  const mailer = createMailer({ transport: (message) => { sent.push(message); } });
  const scheduler = createScheduler({ store, mailer, maxBatch: 2, now: () => 100 });
  store.add({ to: 'a@x.org', text: 'later', dueAt: 200 });
  store.add({ to: 'b@x.org', text: 'second', dueAt: 50 });
  store.add({ to: 'c@x.org', text: 'first', dueAt: 10 });
  store.add({ to: 'd@x.org', text: 'third', dueAt: 90 });

  assert.equal(await scheduler.tick(), 2);
  assert.deepEqual(sent.map((message) => message.text), ['first', 'second']);
  assert.equal(await scheduler.tick(), 1);
  assert.equal(await scheduler.tick(), 0);
  assert.equal(sent[0].from, 'reminders@example.org');
});
