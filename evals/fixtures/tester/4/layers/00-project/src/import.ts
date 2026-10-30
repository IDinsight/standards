import { formatRow } from './csv.ts';
import { HttpError } from './http.ts';
import { parseCsv } from './parse-csv.ts';
import { STATUSES, type RecordItem, type RecordStatus, type RecordStore } from './store.ts';

const COLUMNS = ['title', 'owner', 'status', 'createdAt'];

export type Rejection = { row: number; reason: string; cells: string[] };

// Imports CSV text with the header title,owner,status,createdAt. Valid rows
// are added; invalid rows are skipped and listed in the rejection report
// (row number with the header as row 1, reason, and the original cells).
export function importRecords(store: RecordStore, text: string) {
  const [header, ...rows] = parseCsv(text);
  if (header?.join(',') !== COLUMNS.join(',')) throw new HttpError(400, `header must be ${COLUMNS.join(',')}`);
  const created: RecordItem[] = [];
  const rejected: Rejection[] = [];
  rows.forEach((cells, index) => {
    const reason = problem(cells);
    if (reason) rejected.push({ row: index + 2, reason, cells });
    else created.push(store.add({ title: cells[0].trim(), owner: cells[1].trim(), status: cells[2] as RecordStatus, createdAt: cells[3] }));
  });
  return { created, rejected, report: rejectionReport(rejected) };
}

function problem(cells: string[]): string | null {
  if (cells.length !== COLUMNS.length) return `expected ${COLUMNS.length} fields, found ${cells.length}`;
  if (!cells[0].trim()) return 'title is required';
  if (!cells[1].trim()) return 'owner is required';
  if (!STATUSES.includes(cells[2])) return `unknown status: ${cells[2]}`;
  if (Number.isNaN(Date.parse(cells[3]))) return `invalid createdAt: ${cells[3]}`;
  return null;
}

// Header row, then one LF-terminated line per rejected row.
export function rejectionReport(rejected: readonly Rejection[]): string {
  return [formatRow(['row', 'reason', ...COLUMNS]), ...rejected.map((r) => formatRow([r.row, r.reason, ...r.cells]))]
    .map((line) => `${line}\n`).join('');
}
