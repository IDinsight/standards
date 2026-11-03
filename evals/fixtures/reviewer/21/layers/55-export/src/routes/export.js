import { requireAdmin } from '../auth/authorize.js';
import { writeExport } from '../export.js';
import { parseFilter } from '../records/filter.js';

// Writes the records matching the listing filters to a CSV file in the export
// folder and returns the same CSV. Administrators only.
export function registerExportRoutes(router, store, { exportDir, now }) {
  router.post('/records/export', (request) => {
    requireAdmin(request.user);
    const records = store.list(parseFilter(request.query));
    const { fileName, csv } = writeExport(exportDir, records, now());
    return {
      status: 201,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${fileName}"`,
      },
      body: csv,
    };
  });
}
