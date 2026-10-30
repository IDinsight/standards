import type { AppRequest, AppResponse } from './http/messages.ts';
import { Router } from './http/router.ts';
import { RecentExports } from './recentExports.ts';
import { seedRecords } from './records/seed.ts';
import { RecordStore, type RecordItem } from './records/store.ts';
import { registerExportRoutes } from './routes/export.ts';
import { registerRecordRoutes } from './routes/records.ts';

export type AppOptions = {
  records?: readonly RecordItem[];
  exportDir?: string;
  now?: () => Date;
  // How long a repeated export returns the earlier file instead of a new one.
  repeatWindowMs?: number;
};

export type App = { store: RecordStore; handle: (request: AppRequest) => AppResponse };

export function createApp(options: AppOptions = {}): App {
  const store = new RecordStore(options.records ?? seedRecords);
  const router = new Router();
  registerRecordRoutes(router, store);
  registerExportRoutes(router, store, {
    exportDir: options.exportDir ?? 'exports',
    now: options.now ?? (() => new Date()),
    recent: new RecentExports(options.repeatWindowMs ?? 60_000),
  });
  return { store, handle: (request) => router.handle(request) };
}
