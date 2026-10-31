import { can } from './auth.js';
import { toCsv } from './csv.js';
import { listRecords } from './records.js';

const EXPORT_COLUMNS = ['id', 'title', 'owner', 'notes', 'updated_at'];

function json(status, body) {
  return { status, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export function listRecordsHandler(user) {
  if (!can(user, 'records:read')) return json(403, { error: 'forbidden' });
  return json(200, listRecords());
}

export function exportRecordsHandler(user) {
  if (!can(user, 'records:export')) return json(403, { error: 'forbidden' });
  const rows = listRecords().map((record) => ({
    id: record.id,
    title: record.title,
    owner: record.owner,
    notes: record.notes,
    updated_at: record.updatedAt,
  }));
  return {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="records.csv"',
    },
    body: toCsv(EXPORT_COLUMNS, rows),
  };
}

export const routes = {
  'GET /records': listRecordsHandler,
  'GET /admin/records/export.csv': exportRecordsHandler,
};

export function dispatch(method, path, user) {
  const handler = routes[method + ' ' + path];
  return handler ? handler(user) : json(404, { error: 'not found' });
}
