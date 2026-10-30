import { Router } from './http.js';
import { registerExportRoutes } from './routes/export.js';
import { registerRecordRoutes } from './routes/records.js';
import { seedRecords } from './seed.js';
import { RecordStore } from './store.js';

// Options: records (seed data), exportDir (folder for export files; a relative
// path resolves against the working directory), and now (clock for file names).
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
