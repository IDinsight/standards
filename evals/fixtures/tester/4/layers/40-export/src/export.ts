import { formatRow } from './csv.ts';
import type { RecordItem } from './store.ts';

const COLUMNS: readonly (keyof RecordItem)[] = ['id', 'title', 'owner', 'status', 'createdAt'];

// Header row, then one row per record in the given order; every row ends with
// CRLF (RFC 4180).
export function toCsv(records: readonly RecordItem[]): string {
  return [COLUMNS, ...records.map((r) => COLUMNS.map((c) => r[c]))]
    .map((cells) => `${formatRow(cells)}\r\n`).join('');
}
