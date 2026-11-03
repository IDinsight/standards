import assert from 'node:assert/strict';
import test from 'node:test';

import { MemoryBus } from '../src/bus/memoryBus.js';
import { createLogger } from '../src/log/logger.js';

function newBus(lines = []) {
  return new MemoryBus({ logger: createLogger({ service: 'test', sink: (line) => lines.push(JSON.parse(line)) }) });
}

test('delivers messages to subscribers in publish order', async () => {
  const bus = newBus();
  const seen = [];
  bus.subscribe('numbers', async (message) => {
    seen.push(message.payload.n);
  });
  bus.publish('numbers', { n: 1 });
  bus.publish('numbers', { n: 2 });
  bus.publish('numbers', { n: 3 });
  await bus.idle();
  assert.deepEqual(seen, [1, 2, 3]);
});

test('copies publisher headers onto the message', async () => {
  const bus = newBus();
  const headers = { source: 'test' };
  let received;
  bus.subscribe('t', (message) => {
    received = message;
  });
  bus.publish('t', { ok: true }, headers);
  headers.source = 'changed';
  await bus.idle();
  assert.deepEqual(received.headers, { source: 'test' });
  assert.equal(received.topic, 't');
  assert.ok(received.id);
});

test('a failing handler is logged and later messages are still delivered', async () => {
  const lines = [];
  const bus = newBus(lines);
  const seen = [];
  bus.subscribe('t', (message) => {
    if (message.payload.n === 1) throw new Error('report store unavailable');
    seen.push(message.payload.n);
  });
  bus.publish('t', { n: 1 });
  bus.publish('t', { n: 2 });
  await bus.idle();
  assert.deepEqual(seen, [2]);
  assert.ok(lines.some((line) => line.level === 'error' && line.error === 'report store unavailable'));
});
