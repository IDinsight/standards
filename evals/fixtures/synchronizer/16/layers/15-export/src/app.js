import { Router } from './http/router.js';
import { RecordStore } from './records/store.js';
import { seedRecords } from './records/seed.js';
import { registerExportRoutes } from './routes/export.js';
import { registerRecordRoutes } from './routes/records.js';

// options.records: records to load instead of the seed.
// options.exportDir: folder that receives export files; a relative path
// resolves against the working directory. Defaults to `exports`.
// options.now: clock used to name export files.
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
