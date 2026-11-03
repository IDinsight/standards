import { authorize } from '../auth/authorize.ts';
import { ROLES } from '../auth/users.ts';
import { json } from '../http/messages.ts';
import type { Router } from '../http/router.ts';
import { parseFilter } from '../records/filter.ts';
import type { RecordStore } from '../records/store.ts';

export function registerRecordRoutes(router: Router, store: RecordStore): void {
  router.get('/records', (request) => {
    const user = authorize(request.user, ROLES);
    const records = store.list({ ...parseFilter(request.query), tenantId: user.tenantId });
    return json(200, { count: records.length, records });
  });
}
