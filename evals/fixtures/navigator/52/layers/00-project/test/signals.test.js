import assert from 'node:assert/strict';
import test from 'node:test';

import { TimeoutError, linkedController, raceAbort } from '../src/signals.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('child aborts with the parent reason', () => {
  const parent = new AbortController();
  const link = linkedController(parent.signal);
  parent.abort('stop');
  assert.equal(link.signal.aborted, true);
  assert.equal(link.signal.reason, 'stop');
  link.dispose();
});

test('dispose detaches from the parent', () => {
  const parent = new AbortController();
  const link = linkedController(parent.signal);
  link.dispose();
  parent.abort('stop');
  assert.equal(link.signal.aborted, false);
});

test('timeout aborts with a TimeoutError', async () => {
  const link = linkedController(undefined, 10);
  await delay(30);
  assert.ok(link.signal.reason instanceof TimeoutError);
  assert.equal(link.signal.reason.timeoutMs, 10);
  link.dispose();
});

test('raceAbort rejects as soon as the signal aborts', async () => {
  const controller = new AbortController();
  const pending = raceAbort(new Promise(() => {}), controller.signal);
  controller.abort('stop');
  await assert.rejects(pending, (reason) => reason === 'stop');
});
