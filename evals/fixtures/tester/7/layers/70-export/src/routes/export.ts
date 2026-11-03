import { requireAdmin } from '../auth/authorize.ts';
import { isExportFileName, readExport, writeExport } from '../export.ts';
import { HttpError } from '../http/errors.ts';
import { json, type AppResponse } from '../http/messages.ts';
import type { Router } from '../http/router.ts';
import { parseFilter } from '../records/filter.ts';
import type { RecordStore } from '../records/store.ts';

export type ExportOptions = {
  exportDir: string;
  now: () => Date;
};

export function downloadUrl(fileName: string): string {
  return `/exports/download?file=${encodeURIComponent(fileName)}`;
}

export function registerExportRoutes(router: Router, store: RecordStore, options: ExportOptions): void {
  // Writes the records matching the listing filters to a CSV file in the
  // export folder and returns where to download it.
  router.post('/records/export', (request): AppResponse => {
    requireAdmin(request.user);
    const records = store.list(parseFilter(request.query));
    const { fileName } = writeExport(options.exportDir, records, options.now());
    return json(201, { file: fileName, count: records.length, url: downloadUrl(fileName) });
  });

  // Serves a previously written export by the file name in its download URL.
  router.get('/exports/download', (request): AppResponse => {
    const fileName = request.query.file?.trim() ?? '';
    if (!isExportFileName(fileName)) throw new HttpError(400, 'invalid export file name');
    const csv = readExport(options.exportDir, fileName);
    if (csv === null) throw new HttpError(404, 'export not found');
    return {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${fileName}"`,
      },
      body: csv,
    };
  });
}
