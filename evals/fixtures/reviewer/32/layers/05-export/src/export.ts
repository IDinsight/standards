import { CSV_HEADER, csvRow } from './csv.ts';
import type { RecordSource } from './records.ts';

// Whole export as one string: header row, then one row per record in id order.
export function buildCsv(source: RecordSource): string {
  return CSV_HEADER + source.page(0, source.count()).map(csvRow).join('');
}
