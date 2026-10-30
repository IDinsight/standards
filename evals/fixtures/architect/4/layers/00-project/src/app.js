import { createExportServer } from './api/server.js';
import { MemoryBus } from './bus/memoryBus.js';
import { createNotifier } from './callbacks/notifier.js';
import { createLogger } from './log/logger.js';
import { createReportCatalog } from './reports/catalog.js';
import { ExportStore } from './store/exportStore.js';
import { startExportWorker } from './worker/exportWorker.js';

export function createApp({ logSink, fetchImpl, callbackSecret = 'dev-secret' } = {}) {
  const logger = createLogger({ service: 'exports', sink: logSink });
  const bus = new MemoryBus({ logger: logger.child({ component: 'bus' }) });
  const store = new ExportStore();
  const notifier = createNotifier({ logger: logger.child({ component: 'callbacks' }), secret: callbackSecret, fetchImpl });
  startExportWorker({ bus, store, reports: createReportCatalog(), notifier, logger: logger.child({ component: 'worker' }) });
  const server = createExportServer({ bus, store, logger: logger.child({ component: 'api' }) });
  return {
    logger,
    server,
    bus,
    store,
    close() {
      server.closeAllConnections();
      server.close();
    },
  };
}
