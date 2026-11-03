import { formatCsv } from './csv.js';

export const COLUMNS = ['sku', 'name', 'quantity', 'updatedAt'];

// Epoch milliseconds of 00:00:00Z on a YYYY-MM-DD date, or null.
export function parseSince(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isNaN(time) ? null : time;
}

export function exportItems(items, { since = null } = {}) {
  const rows = since === null ? items : items.filter((item) => Date.parse(item.updatedAt) >= since);
  return formatCsv(COLUMNS, rows);
}
