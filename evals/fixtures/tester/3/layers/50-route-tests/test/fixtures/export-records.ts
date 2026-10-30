import type { RecordItem } from '../../src/records/store.ts';

// Records for export route tests: titles with commas and double quotes, and
// both statuses for several owners.
export const exportRecords: RecordItem[] = [
  { id: 11, title: 'Supplier contract, renewal draft', owner: 'dana', status: 'archived', createdAt: '2026-02-03T08:00:00Z' },
  { id: 12, title: 'Board "offsite" notes', owner: 'li', status: 'archived', createdAt: '2026-02-17T13:45:00Z' },
  { id: 13, title: 'Parking permits', owner: 'marco', status: 'active', createdAt: '2026-03-01T07:30:00Z' },
  { id: 14, title: 'Audit follow-up', owner: 'li', status: 'active', createdAt: '2026-03-12T10:10:00Z' },
];
