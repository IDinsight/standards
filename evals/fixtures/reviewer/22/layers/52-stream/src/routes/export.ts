import { rmSync } from 'node:fs';
import type { Writable } from 'node:stream';

import { requireAdmin } from '../auth/authorize.ts';
import { writeExport } from '../export.ts';
import { HttpError } from '../http/errors.ts';
import type { AppResponse } from '../http/messages.ts';
import type { Router } from '../http/router.ts';
import { parseFilter } from '../records/filter.ts';
import type { RecordStore } from '../records/store.ts';

export type ExportOptions = {
  exportDir: string;
  now: () => Date;
  timeoutMs: number;
  openStream?: (file: string) => Writable;
};

// Writes the records matching the listing filters to a CSV file in the export
// folder and returns the same CSV. Administrators only.
export function registerExportRoutes(router: Router, store: RecordStore, options: ExportOptions): void {
  router.post('/records/export', async (request): Promise<AppResponse> => {
    requireAdmin(request.user);
    const records = store.list(parseFilter(request.query));
    const result = await writeExport(options.exportDir, records, options.now(), {
      timeoutMs: options.timeoutMs,
      open: options.openStream,
    });
    if (result.timedOut) {
      rmSync(result.path, { force: true });
      throw new HttpError(503, 'export timed out');
    }
    return {
      status: 201,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${result.fileName}"`,
      },
      body: result.csv,
    };
  });
}
