import { seedRecords } from '@records/seed';

import type { AppRequest, AppResponse } from './http/messages.ts';
import { Router } from './http/router.ts';
import { RecordStore, type RecordItem } from './records/store.ts';
import { registerExportRoutes } from './routes/export.ts';
import { registerRecordRoutes } from './routes/records.ts';

export type AppOptions = {
  records?: readonly RecordItem[];
  // Folder that holds export files. A relative path resolves against the
  // working directory.
  exportDir?: string;
  now?: () => Date;
};

export type App = {
  store: RecordStore;
  handle: (request: AppRequest) => AppResponse;
};

export function createApp(options: AppOptions = {}): App {
  const store = new RecordStore(options.records ?? seedRecords);
  const router = new Router();
  registerRecordRoutes(router, store);
  registerExportRoutes(router, store, {
    exportDir: options.exportDir ?? 'exports',
    now: options.now ?? (() => new Date()),
  });
  return { store, handle: (request) => router.handle(request) };
}
