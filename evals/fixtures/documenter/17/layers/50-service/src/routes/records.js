import { ROLES, authorize } from '../auth.js';
import { parseFilter } from '../filter.js';
import { json } from '../http.js';

export function registerRecordRoutes(router, store) {
  router.get('/records', (request) => {
    authorize(request.user, ROLES);
    const records = store.list(parseFilter(request.query));
    return json(200, { count: records.length, records });
  });
}
