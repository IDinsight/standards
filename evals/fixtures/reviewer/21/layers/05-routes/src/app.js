import { Router } from './http/router.js';
import { seedRecords } from './records/seed.js';
import { RecordStore } from './records/store.js';
import { registerRecordRoutes } from './routes/records.js';

export function createApp(options = {}) {
  const store = new RecordStore(options.records ?? seedRecords);
  const router = new Router();
  registerRecordRoutes(router, store);
  return { store, handle: (request) => router.handle(request) };
}
