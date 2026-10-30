import { authorize } from '../auth/authorize.ts';
import { ROLES } from '../auth/users.ts';
import { json } from '../http/messages.ts';
import type { Router } from '../http/router.ts';
import { parseFilter } from '../records/filter.ts';
import type { RecordStore } from '../records/store.ts';

export function registerRecordRoutes(router: Router, store: RecordStore): void {
  router.get('/records', (request) => {
    authorize(request.user, ROLES);
    const records = store.list(parseFilter(request.query));
    return json(200, { count: records.length, records });
  });
}
