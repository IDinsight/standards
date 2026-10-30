import { isAdmin } from './auth.js';
import { toCsv } from './export.js';

const PAGE_SIZE = 50;
const EXPORT_COLUMNS = ['id', 'name', 'email', 'status', 'createdAt'];

function json(status, body) {
  return { status, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export function handle(store, user, request) {
  const { method, path, query = {} } = request;
  if (!user) return json(401, { error: 'unauthenticated' });

  if (method === 'GET' && path === '/records') {
    const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
    const matching = store.list({ status: query.status });
    const items = matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return json(200, { page, total: matching.length, items });
  }

  if (method === 'POST' && path === '/records') {
    if (!isAdmin(user)) return json(403, { error: 'forbidden' });
    return json(201, store.add(request.body));
  }

  if (method === 'GET' && path === '/records/export') {
    if (!isAdmin(user)) return json(403, { error: 'forbidden' });
    return {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="records.csv"',
      },
      body: toCsv(store.list({ status: query.status }), EXPORT_COLUMNS),
    };
  }

  if (method === 'GET' && path.startsWith('/records/')) {
    const record = store.get(Number(path.slice('/records/'.length)));
    return record ? json(200, record) : json(404, { error: 'not found' });
  }

  return json(404, { error: 'not found' });
}
