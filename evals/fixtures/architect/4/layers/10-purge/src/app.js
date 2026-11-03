import { createExportServer } from './api/server.js';
import { MemoryBus } from './bus/memoryBus.js';
import { createNotifier } from './callbacks/notifier.js';
import { startScheduler } from './jobs/scheduler.js';
import { createLogger } from './log/logger.js';
import { createReportCatalog } from './reports/catalog.js';
import { ExportStore } from './store/exportStore.js';
import { startExportWorker } from './worker/exportWorker.js';
import { startPurgeWorker } from './worker/purgeWorker.js';

export function createApp({ logSink, fetchImpl, callbackSecret = 'dev-secret', schedule = true } = {}) {
  const logger = createLogger({ service: 'exports', sink: logSink });
  const bus = new MemoryBus({ logger: logger.child({ component: 'bus' }) });
  const store = new ExportStore();
  const notifier = createNotifier({ logger: logger.child({ component: 'callbacks' }), secret: callbackSecret, fetchImpl });
  const workerLogger = logger.child({ component: 'worker' });
  startExportWorker({ bus, store, reports: createReportCatalog(), notifier, logger: workerLogger });
  startPurgeWorker({ bus, store, logger: workerLogger });
  const scheduler = schedule ? startScheduler({ bus, logger: logger.child({ component: 'scheduler' }) }) : null;
  const server = createExportServer({ bus, store, logger: logger.child({ component: 'api' }) });
  return {
    logger,
    server,
    bus,
    store,
    close() {
      scheduler?.stop();
      server.closeAllConnections();
      server.close();
    },
  };
}
