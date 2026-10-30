import { authorize } from '../auth/authorize.ts';
import { ROLES } from '../auth/users.ts';
import { writeExport } from '../export.ts';
import type { AppResponse } from '../http/messages.ts';
import type { Router } from '../http/router.ts';
import { parseFilter } from '../records/filter.ts';
import type { RecordStore } from '../records/store.ts';

export type ExportOptions = {
  exportDir: string;
  now: () => Date;
};

// Writes the records matching the listing filters to a CSV file in the export
// folder and returns the same CSV, naming the user who asked for it.
// Administrators only.
export function registerExportRoutes(router: Router, store: RecordStore, options: ExportOptions): void {
  router.post('/records/export', (request): AppResponse => {
    const user = authorize(request.user, ROLES);
    const records = store.list(parseFilter(request.query));
    const { fileName, csv } = writeExport(options.exportDir, records, options.now());
    return {
      status: 201,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${fileName}"`,
        'x-exported-by': user.name,
      },
      body: csv,
    };
  });
}
