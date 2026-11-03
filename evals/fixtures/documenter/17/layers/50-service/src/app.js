import { Router } from './http.js';
import { registerRecordRoutes } from './routes/records.js';
import { seedRecords } from './seed.js';
import { RecordStore } from './store.js';

export function createApp(options = {}) {
  const store = new RecordStore(options.records ?? seedRecords);
  const router = new Router();
  registerRecordRoutes(router, store);
  return { store, handle: (request) => router.handle(request) };
}
