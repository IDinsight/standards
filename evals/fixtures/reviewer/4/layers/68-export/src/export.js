import { formatCsv } from './csv.js';

export const EXPORT_COLUMNS = ['id', 'title', 'owner', 'status'];

// CSV text for the records matching the filter ({ status, owner }), ordered by
// id, under a header row. The columns match the import header, so an exported
// file can be imported again.
export function exportRecords(store, filter = {}) {
  const rows = store.list(filter).map((record) => EXPORT_COLUMNS.map((column) => record[column]));
  return formatCsv([EXPORT_COLUMNS, ...rows]);
}
