import { Router } from './http/router.js';
import { seedRecords } from './records/seed.js';
import { RecordStore } from './records/store.js';
import { registerExportRoutes } from './routes/export.js';
import { registerRecordRoutes } from './routes/records.js';

// Options: records (seed data), exportDir (folder for export files, relative
// to the working directory unless absolute; default `exports`), and now
// (clock used for export file names).
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
