import { exportFileName, toCsv } from '../export/csv.ts';
import type { RecordStore } from '../records/store.ts';
import type { ArchiveClient } from './client.ts';
import { uploadWithRetry, type RetryOptions } from './retry.ts';

export type ArchiveExportOptions = {
  store: RecordStore;
  archive: ArchiveClient;
  now?: () => Date;
  retry?: RetryOptions;
};

export type ArchiveExportResult = {
  fileName: string;
  records: number;
  attempts: number;
};

// Uploads every record as one CSV file named for the run's start time.
export async function runArchiveExport(options: ArchiveExportOptions): Promise<ArchiveExportResult> {
  const records = options.store.list();
  const fileName = exportFileName((options.now ?? (() => new Date()))());
  const { attempts } = await uploadWithRetry(options.archive, fileName, toCsv(records), options.retry);
  return { fileName, records: records.length, attempts };
}
