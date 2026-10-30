import type { RecordItem } from '../src/records/store.ts';

// Stores createdAt in the full ISO 8601 form the admin tool sends
// (2026-03-02T10:15:00.000Z), so seeded and newly created records compare and
// sort the same way. Run once over the records before the store loads them.
export const name = '0001-created-at-millis';

export function up(records: readonly RecordItem[]): RecordItem[] {
  return records.map((record) => ({ ...record, createdAt: new Date(record.createdAt).toISOString() }));
}

export function down(records: readonly RecordItem[]): RecordItem[] {
  return records.map((record) => ({ ...record, createdAt: record.createdAt.replace(/\.\d{3}Z$/, 'Z') }));
}
