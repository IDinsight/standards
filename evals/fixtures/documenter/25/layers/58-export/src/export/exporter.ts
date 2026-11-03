import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { requireAdmin } from '../auth/authorize.ts';
import type { User } from '../auth/users.ts';
import { parseFilter } from '../records/filter.ts';
import type { RecordStore } from '../records/store.ts';
import { toCsv } from './csv.ts';

export type ExporterOptions = {
  exportDir: string;
  now: () => Date;
};

export type ExportResult = {
  fileName: string;
  path: string;
  count: number;
  csv: string;
};

// records-20260924T090000Z.csv for an export at 2026-09-24 09:00:00 UTC.
export function exportFileName(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `records-${stamp}.csv`;
}

export class RecordExporter {
  #store: RecordStore;
  #options: ExporterOptions;

  constructor(store: RecordStore, options: ExporterOptions) {
    this.#store = store;
    this.#options = options;
  }

  // Writes the records matching the listing filters to a CSV file in the
  // export folder. Administrators only.
  async exportRecords(user: User | null, query: Record<string, string> = {}): Promise<ExportResult> {
    requireAdmin(user);
    const records = this.#store.list(parseFilter(query));
    const csv = toCsv(records);
    const fileName = exportFileName(this.#options.now());
    const target = path.join(this.#options.exportDir, fileName);
    await mkdir(this.#options.exportDir, { recursive: true });
    await writeFile(target, csv, 'utf8');
    return { fileName, path: target, count: records.length, csv };
  }
}
