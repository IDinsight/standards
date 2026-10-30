import { requireAdmin } from '../auth/authorize.ts';
import { writeExport } from '../export.ts';
import type { AppResponse } from '../http/messages.ts';
import type { Router } from '../http/router.ts';
import { exportKey, type RecentExports } from '../recentExports.ts';
import { parseFilter } from '../records/filter.ts';
import type { RecordStore } from '../records/store.ts';

export type ExportOptions = { exportDir: string; now: () => Date; recent: RecentExports };

function csvResponse(status: number, fileName: string, csv: string): AppResponse {
  return {
    status,
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${fileName}"` },
    body: csv,
  };
}

// Administrators only. Repeating the same export within the window returns the
// earlier file instead of writing a new one.
export function registerExportRoutes(router: Router, store: RecordStore, options: ExportOptions): void {
  router.post('/records/export', (request): AppResponse => {
    const user = requireAdmin(request.user);
    const filter = parseFilter(request.query);
    const now = options.now();
    const key = exportKey(user.id, filter);
    const earlier = options.recent.find(key, now);
    if (earlier) return csvResponse(200, earlier.fileName, earlier.csv);
    const { fileName, csv } = writeExport(options.exportDir, store.list(filter), now);
    options.recent.remember(key, { fileName, csv, createdAt: now });
    return csvResponse(201, fileName, csv);
  });
}
