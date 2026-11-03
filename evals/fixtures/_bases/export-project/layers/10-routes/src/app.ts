import { seedRecords } from '@records/seed';

import type { AppRequest, AppResponse } from './http/messages.ts';
import { Router } from './http/router.ts';
import { RecordStore, type RecordItem } from './records/store.ts';
import { registerRecordRoutes } from './routes/records.ts';

export type AppOptions = { records?: readonly RecordItem[] };

export type App = {
  store: RecordStore;
  handle: (request: AppRequest) => AppResponse;
};

export function createApp(options: AppOptions = {}): App {
  const store = new RecordStore(options.records ?? seedRecords);
  const router = new Router();
  registerRecordRoutes(router, store);
  return { store, handle: (request) => router.handle(request) };
}
