import { isAdmin } from './auth.js';
import { toCsv } from './csv.js';

export const EXPORT_COLUMNS = ['id', 'title', 'owner', 'updatedAt'];

const FORBIDDEN = {
  status: 403,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ error: 'forbidden' }),
};

export function exportHandler(store) {
  return (req) => {
    if (!isAdmin(req.user)) return { ...FORBIDDEN, headers: { ...FORBIDDEN.headers } };
    return {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="records.csv"',
      },
      body: toCsv(store.list(), EXPORT_COLUMNS),
    };
  };
}
