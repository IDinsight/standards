import { ArchiveError, ArchiveTimeoutError, type ArchiveClient } from '../archive.ts';
import { requireAdmin } from '../auth/authorize.ts';
import { exportFileName, toCsv } from '../export.ts';
import { HttpError } from '../http/errors.ts';
import { json, type AppResponse } from '../http/messages.ts';
import type { Router } from '../http/router.ts';
import { parseFilter } from '../records/filter.ts';
import type { RecordStore } from '../records/store.ts';

export type ExportOptions = {
  archive: ArchiveClient;
  exportTimeoutMs: number;
  retryDelayMs: number;
  now: () => Date;
};

function wait(ms: number): Promise<unknown> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Network failures and 5xx responses are worth sending again.
function isTransient(error: unknown): boolean {
  return error instanceof ArchiveError && (error.status === null || error.status >= 500);
}

async function upload(options: ExportOptions, name: string, csv: string): Promise<{ location: string }> {
  for (;;) {
    try {
      return await options.archive.put(name, csv, options.exportTimeoutMs);
    } catch (error) {
      if (!isTransient(error)) throw error;
      await wait(options.retryDelayMs);
    }
  }
}

// Sends the records matching the listing filters to the document archive as a
// CSV file. Administrators only.
export function registerExportRoutes(router: Router, store: RecordStore, options: ExportOptions): void {
  router.post('/records/export', async (request): Promise<AppResponse> => {
    requireAdmin(request.user);
    const records = store.list(parseFilter(request.query));
    const fileName = exportFileName(options.now());
    try {
      const { location } = await upload(options, fileName, toCsv(records));
      return json(201, { fileName, location, count: records.length });
    } catch (error) {
      if (error instanceof ArchiveTimeoutError) throw new HttpError(504, 'export did not complete');
      if (error instanceof ArchiveError) throw new HttpError(502, `archive rejected the export: ${error.message}`);
      throw error;
    }
  });
}
