import assert from 'node:assert/strict';
import test from 'node:test';

import { MemoryBus } from '../src/bus/memoryBus.js';
import { startScheduler } from '../src/jobs/scheduler.js';
import { createLogger } from '../src/log/logger.js';
import { ExportStore } from '../src/store/exportStore.js';
import { startPurgeWorker } from '../src/worker/purgeWorker.js';

const quiet = createLogger({ service: 'test', sink: () => {} });

test('tick publishes a purge for exports older than the retention window', async () => {
  const bus = new MemoryBus({ logger: quiet });
  const published = [];
  bus.subscribe('exports.purge', (message) => {
    published.push(message.payload);
  });
  const scheduler = startScheduler({ bus, logger: quiet, now: () => new Date('2026-09-20T00:00:00.000Z') });
  scheduler.tick();
  scheduler.stop();
  await bus.idle();
  assert.deepEqual(published, [{ olderThan: '2026-09-13T00:00:00.000Z' }]);
});

test('purge removes finished exports created before the cutoff', async () => {
  const bus = new MemoryBus({ logger: quiet });
  const store = new ExportStore();
  startPurgeWorker({ bus, store, logger: quiet });
  const finished = store.create({ report: 'monthly-usage', callbackUrl: 'https://client.example/hooks/exports' });
  store.update(finished.id, { status: 'done', rowCount: 2 });
  const queued = store.create({ report: 'monthly-usage', callbackUrl: 'https://client.example/hooks/exports' });
  bus.publish('exports.purge', { olderThan: '9999-12-31T00:00:00.000Z' });
  await bus.idle();
  assert.equal(store.get(finished.id), null);
  assert.equal(store.get(queued.id).status, 'queued');
});
