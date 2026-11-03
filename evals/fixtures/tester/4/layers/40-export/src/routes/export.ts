import { requireAdmin } from '../auth.ts';
import { toCsv } from '../export.ts';
import type { Router } from '../http.ts';
import { parseFilter, type RecordStore } from '../store.ts';

// Returns the records matching the listing filters as a CSV attachment.
// Administrators only.
export function registerExportRoutes(router: Router, store: RecordStore): void {
  router.add('POST', '/records/export', (request) => {
    requireAdmin(request.user);
    const records = store.list(parseFilter(request.query));
    return {
      status: 200,
      headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="records.csv"' },
      body: toCsv(records),
    };
  });
}
