import { ROLES, authorize } from '../auth/authorize.js';
import { json } from '../http/messages.js';
import { parseFilter } from '../records/filter.js';

export function registerRecordRoutes(router, store) {
  router.get('/records', (request) => {
    authorize(request.user, ROLES);
    const records = store.list(parseFilter(request.query));
    return json(200, { count: records.length, records });
  });
}
