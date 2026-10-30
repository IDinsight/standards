import { seedRecords } from '@records/seed';

import type { RecordItem } from '../../src/records/store.ts';

export type CaseQuery = { status?: string; owner?: string; q?: string };

const HEADER = 'id,title,owner,status,createdAt';
const seed: readonly RecordItem[] = seedRecords;

// RFC 4180 field: quote when the value holds a comma, double quote, CR, or LF.
function field(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Seed records an export with this query should contain.
export function matchingSeed(query: CaseQuery): RecordItem[] {
  const q = query.q?.toLowerCase();
  return seed
    .filter((record) => !query.status || record.status === query.status)
    .filter((record) => !query.owner || record.owner === query.owner)
    .filter((record) => !q || record.title.toLowerCase().includes(q))
    .map((record) => ({ ...record }));
}

// CSV text an export of these records should produce: header, then one
// CRLF-terminated row per record.
export function expectedCsv(records: readonly RecordItem[]): string {
  const rows = [...records]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((record) => [record.id, record.title, record.owner, record.status, record.createdAt].map(field).join(','));
  return [HEADER, ...rows].map((row) => `${row}\r\n`).join('');
}
