import { authorize } from '../auth/authorize.ts';
import { ROLES } from '../auth/users.ts';
import { toCsv } from '../export.ts';
import { json } from '../http/messages.ts';
import type { Router } from '../http/router.ts';
import { parseFilter } from '../records/filter.ts';
import type { RecordStore } from '../records/store.ts';

export function registerRecordRoutes(router: Router, store: RecordStore): void {
  router.get('/records', (request) => {
    authorize(request.user, ROLES);
    const records = store.list(parseFilter(request.query));
    if (request.query.format === 'csv') {
      return {
        status: 200,
        headers: { 'content-type': 'text/csv; charset=utf-8' },
        body: toCsv(records),
      };
    }
    return json(200, { count: records.length, records });
  });
}
