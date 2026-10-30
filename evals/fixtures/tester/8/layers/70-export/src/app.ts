import { seedRecords } from '@records/seed';

import { createArchiveClient, type ArchiveClient } from './archive.ts';
import type { AppRequest, AppResponse } from './http/messages.ts';
import { Router } from './http/router.ts';
import { RecordStore, type RecordItem } from './records/store.ts';
import { registerExportRoutes } from './routes/export.ts';
import { registerRecordRoutes } from './routes/records.ts';

export type AppOptions = {
  records?: readonly RecordItem[];
  // Client for the document archive; defaults to one for ARCHIVE_URL.
  archive?: ArchiveClient;
  // Export time limit in milliseconds.
  exportTimeoutMs?: number;
  // Pause before an archive upload is sent again, in milliseconds.
  retryDelayMs?: number;
  now?: () => Date;
};

export type App = {
  store: RecordStore;
  handle: (request: AppRequest) => AppResponse | Promise<AppResponse>;
};

export function createApp(options: AppOptions = {}): App {
  const store = new RecordStore(options.records ?? seedRecords);
  const router = new Router();
  registerRecordRoutes(router, store);
  registerExportRoutes(router, store, {
    archive: options.archive ?? createArchiveClient(process.env.ARCHIVE_URL ?? 'http://archive.internal'),
    exportTimeoutMs: options.exportTimeoutMs ?? 30_000,
    retryDelayMs: options.retryDelayMs ?? 1_000,
    now: options.now ?? (() => new Date()),
  });
  return { store, handle: (request) => router.handle(request) };
}
