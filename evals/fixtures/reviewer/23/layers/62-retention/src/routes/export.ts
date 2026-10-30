import { requireAdmin } from '../auth/authorize.ts';
import { exportStamp, writeExport, type ExportFile } from '../export.ts';
import type { AppResponse } from '../http/messages.ts';
import type { Router } from '../http/router.ts';
import { parseFilter } from '../records/filter.ts';
import type { RecordStore } from '../records/store.ts';

export type ExportOptions = {
  exportDir: string;
  now: () => Date;
};

function csvResponse(file: ExportFile): AppResponse {
  return {
    status: 201,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${file.fileName}"`,
    },
    body: file.csv,
  };
}

// Writes the records matching the listing filters to a CSV file in the export
// folder and returns the same CSV. Administrators only. Repeating an export
// within the same second returns the file already written for it.
export function registerExportRoutes(router: Router, store: RecordStore, options: ExportOptions): void {
  // Exports written during the current second, keyed by stamp and filter.
  const recent = new Map<string, ExportFile>();

  router.post('/records/export', (request): AppResponse => {
    const now = options.now();
    const stamp = exportStamp(now);
    const filter = parseFilter(request.query);
    const key = `${stamp} ${JSON.stringify(filter)}`;
    const earlier = recent.get(key);
    if (earlier) return csvResponse(earlier);

    requireAdmin(request.user);
    const file = writeExport(options.exportDir, store.list(filter), now);
    for (const entry of recent.keys()) {
      if (!entry.startsWith(`${stamp} `)) recent.delete(entry);
    }
    recent.set(key, file);
    return csvResponse(file);
  });
}
