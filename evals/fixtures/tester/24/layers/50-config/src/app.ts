import { seedRecords } from '@records/seed';

import type { AppRequest, AppResponse } from './http/messages.ts';
import { Router } from './http/router.ts';
import { RecordStore, type RecordItem } from './records/store.ts';
import { registerExportRoutes } from './routes/export.ts';
import { registerRecordRoutes } from './routes/records.ts';

export type RouteName = 'records' | 'export';

export const ALL_ROUTES: readonly RouteName[] = ['records', 'export'];

export type AppOptions = {
  records?: readonly RecordItem[];
  // Route modules to register; all of them when omitted.
  routes?: readonly RouteName[];
  // Folder that receives export files. A relative path resolves against the
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
  const routes = options.routes ?? ALL_ROUTES;
  if (routes.includes('records')) registerRecordRoutes(router, store);
  if (routes.includes('export')) {
    registerExportRoutes(router, store, {
      exportDir: options.exportDir ?? 'exports',
      now: options.now ?? (() => new Date()),
    });
  }
  return { store, handle: (request) => router.handle(request) };
}
