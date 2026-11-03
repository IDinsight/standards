import { Router } from './http/router.js';
import { RecordStore } from './records/store.js';
import { registerRecordRoutes } from './routes/records.js';
import { seedRecords } from './seed.js';

// Builds the store and routes. The admin tool mounts handle() behind its HTTP
// server; tests call it directly.
export function createApp(options = {}) {
  const store = new RecordStore(options.records ?? seedRecords);
  const router = new Router();
  registerRecordRoutes(router, store);
  return { store, handle: (request) => router.handle(request) };
}
