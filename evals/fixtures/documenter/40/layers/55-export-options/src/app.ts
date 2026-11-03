import { seedRecords } from '@records/seed';

import type { AppRequest, AppResponse } from './http/messages.ts';
import { Router } from './http/router.ts';
import { RecordStore, type RecordItem } from './records/store.ts';
import { registerExportRoutes } from './routes/export.ts';
import { registerRecordRoutes } from './routes/records.ts';

export type ExportSettings = {
  // Folder that receives export files, `exports` by default. A relative path
  // resolves against the working directory.
  dir?: string;
  // Clock used for export file names.
  now?: () => Date;
};

export type AppOptions = {
  records?: readonly RecordItem[];
  exports?: ExportSettings;
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
    dir: options.exports?.dir ?? 'exports',
    now: options.exports?.now ?? (() => new Date()),
  });
  return { store, handle: (request) => router.handle(request) };
}
