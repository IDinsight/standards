import { Router } from './http/router.js';
import { RecordStore } from './records/store.js';
import { registerExportRoutes } from './routes/export.js';
import { registerRecordRoutes } from './routes/records.js';
import { seedRecords } from './seed.js';

// Builds the store and routes. The admin tool mounts handle() behind its HTTP
// server; tests call it directly.
//
// Options: records (defaults to the seed records), exportDir (folder that
// receives export files, default 'exports', relative to the working
// directory), and now (clock used to name export files).
export function createApp(options = {}) {
  const store = new RecordStore(options.records ?? seedRecords);
  const router = new Router();
  registerRecordRoutes(router, store);
  registerExportRoutes(router, store, {
    exportDir: options.exportDir ?? 'exports',
    now: options.now ?? (() => new Date()),
  });
  return { store, handle: (request) => router.handle(request) };
}
