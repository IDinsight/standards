import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';

import { MemoryBus } from '../src/bus/memoryBus.js';
import { createNotifier } from '../src/callbacks/notifier.js';
import { createLogger } from '../src/log/logger.js';
import { createReportCatalog } from '../src/reports/catalog.js';
import { ExportStore } from '../src/store/exportStore.js';
import { startExportWorker } from '../src/worker/exportWorker.js';

const quiet = createLogger({ service: 'test', sink: () => {} });

test('an unknown report fails the export and the callback reports it', async () => {
  const bus = new MemoryBus({ logger: quiet });
  const store = new ExportStore();
  const calls = [];
  const notifier = {
    notify: async (url, body) => {
      calls.push({ url, body });
      return 204;
    },
  };
  startExportWorker({ bus, store, reports: createReportCatalog(), notifier, logger: quiet });
  const record = store.create({ report: 'quarterly-churn', callbackUrl: 'https://client.example/hooks/exports' });
  bus.publish('export.requested', { exportId: record.id, report: record.report, callbackUrl: record.callbackUrl });
  await bus.idle();
  assert.equal(store.get(record.id).status, 'failed');
  assert.deepEqual(calls, [{
    url: 'https://client.example/hooks/exports',
    body: { exportId: record.id, status: 'failed', error: 'unknown report: quarterly-churn' },
  }]);
});

test('callbacks are signed with the shared secret', async () => {
  const sent = [];
  const notifier = createNotifier({
    logger: quiet,
    secret: 'shared-secret',
    fetchImpl: async (url, init) => {
      sent.push({ url, init });
      return { status: 200 };
    },
  });
  const status = await notifier.notify('https://client.example/hooks/exports', { exportId: 'e1', status: 'done', rowCount: 3 });
  assert.equal(status, 200);
  const expected = createHmac('sha256', 'shared-secret').update(sent[0].init.body).digest('hex');
  assert.equal(sent[0].init.headers['x-exports-signature'], `sha256=${expected}`);
  assert.equal(sent[0].init.body, JSON.stringify({ exportId: 'e1', status: 'done', rowCount: 3 }));
});
