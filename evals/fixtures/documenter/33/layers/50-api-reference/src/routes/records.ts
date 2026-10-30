import { authorize } from '../auth/authorize.ts';
import { ROLES } from '../auth/users.ts';
import { json } from '../http/messages.ts';
import type { Router } from '../http/router.ts';
import { parseFilter } from '../records/filter.ts';
import type { RecordStore } from '../records/store.ts';

export function registerRecordRoutes(router: Router, store: RecordStore): void {
  /**
   * Lists the records that match the query filters, ordered by id.
   * @access admin, editor, viewer
   * @query status `active` or `archived`
   * @query owner exact owner username
   * @query q case-insensitive text that must appear in the title
   * @returns 200 JSON `{ "count": n, "records": [...] }`
   * @error 400 unknown status value
   * @error 401 no signed-in user
   */
  router.get('/records', (request) => {
    authorize(request.user, ROLES);
    const records = store.list(parseFilter(request.query));
    return json(200, { count: records.length, records });
  });
}
