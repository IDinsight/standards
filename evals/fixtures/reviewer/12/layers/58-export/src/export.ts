import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { requireAdmin } from './auth/authorize.ts';
import type { AppResponse } from './http/messages.ts';
import type { Router } from './http/router.ts';
import { parseFilter } from './records/filter.ts';
import type { RecordItem, RecordStore } from './records/store.ts';

const COLUMNS: readonly (keyof RecordItem)[] = ['id', 'title', 'owner', 'status', 'createdAt'];

// RFC 4180: a field containing a comma, double quote, CR, or LF is enclosed in
// double quotes, and every double quote inside it is doubled.
export function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// Header row, then one row per record in the given order. Every row ends with CRLF.
export function toCsv(records: readonly RecordItem[]): string {
  const rows = records.map((record) => COLUMNS.map((column) => csvCell(record[column])).join(','));
  return [COLUMNS.join(','), ...rows].map((row) => `${row}\r\n`).join('');
}

// records-20260924T090000Z.csv for an export at 2026-09-24 09:00:00 UTC.
export function exportFileName(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `records-${stamp}.csv`;
}

export type ExportFile = {
  fileName: string;
  path: string;
  csv: string;
};

export function writeExport(dir: string, records: readonly RecordItem[], now: Date): ExportFile {
  const csv = toCsv(records);
  const fileName = exportFileName(now);
  const target = path.join(dir, fileName);
  mkdirSync(dir, { recursive: true });
  writeFileSync(target, csv, 'utf8');
  return { fileName, path: target, csv };
}

export type ExportOptions = {
  exportDir: string;
  now: () => Date;
};

function csvResponse(file: ExportFile, count: number): AppResponse {
  return {
    status: 201,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${file.fileName}"`,
      'x-record-count': String(count),
    },
    body: file.csv,
  };
}

// POST /records/export: writes the records matching the listing filters to a
// CSV file in the export folder and returns the same CSV. Administrators only.
export function registerExportRoutes(router: Router, store: RecordStore, options: ExportOptions): void {
  router.post('/records/export', (request): AppResponse => {
    const filter = parseFilter(request.query);
    const records = store.list(filter);

    // Write the file in full before building the response, so the body is
    // always exactly what was saved.
    const file = writeExport(options.exportDir, records, options.now());
    const response = csvResponse(file, records.length);

    // GET /records allows every signed-in role, but exports are for
    // administrators only. requireAdmin throws HttpError(401) without a user
    // and HttpError(403) for any other role; the router turns either into the
    // same JSON error body the other routes return, so callers see one error
    // format.
    requireAdmin(request.user);
    return response;
  });
}
