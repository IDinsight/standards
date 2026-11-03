import { requireAdmin } from '../auth/authorize.ts';
import { readExport, writeExport } from '../export.ts';
import { json, type AppResponse } from '../http/messages.ts';
import type { Router } from '../http/router.ts';
import { parseFilter } from '../records/filter.ts';
import type { RecordStore } from '../records/store.ts';

export type ExportOptions = {
  exportDir: string;
  newToken: () => string;
};

export function downloadPath(token: string): string {
  return `/exports/download?token=${token}`;
}

export function registerExportRoutes(router: Router, store: RecordStore, options: ExportOptions): void {
  // Administrators create an export of the records matching the listing filters.
  router.post('/records/export', (request) => {
    requireAdmin(request.user);
    const records = store.list(parseFilter(request.query));
    const token = options.newToken();
    writeExport(options.exportDir, records, token);
    return json(201, { count: records.length, url: downloadPath(token) });
  });

  // Download link returned when the export was created.
  router.get('/exports/download', (request): AppResponse => {
    const csv = readExport(options.exportDir, request.query.token?.trim() ?? '');
    if (csv === null) return json(404, { error: 'export not found' });
    return {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="records.csv"',
      },
      body: csv,
    };
  });
}
