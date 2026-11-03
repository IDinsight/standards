import { authorize } from './auth.ts';
import { HttpError, json, Router, type AppRequest, type AppResponse } from './http.ts';
import { importRecords } from './import.ts';
import { seedRecords } from './seed.ts';
import { parseFilter, RecordStore } from './store.ts';

export function createApp() {
  const store = new RecordStore(seedRecords);
  const router = new Router();
  router.add('GET', '/records', (request) => {
    authorize(request.user, ['admin', 'editor', 'viewer']);
    const records = store.list(parseFilter(request.query));
    return json(200, { count: records.length, records });
  });
  // Bulk import for admins and editors; the body is CSV text.
  router.add('POST', '/records/import', (request) => {
    authorize(request.user, ['admin', 'editor']);
    if (!request.body?.trim()) throw new HttpError(400, 'CSV body required');
    const result = importRecords(store, request.body);
    return json(200, { created: result.created.length, rejected: result.rejected.length, report: result.report });
  });
  return { store, handle: (request: AppRequest): AppResponse => router.handle(request) };
}
