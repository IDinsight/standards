import type { RecordItem } from '../../src/records.ts';

// Records with a comma, embedded double quotes, and a line break in their titles.
export const semicolonRecords: RecordItem[] = [
  { id: 1, title: 'Lease agreement, Building B', owner: 'dana', status: 'active', createdAt: '2026-03-02T10:15:00Z' },
  { id: 3, title: 'Q2 "priority" accounts review', owner: 'dana', status: 'archived', createdAt: '2026-04-01T08:05:00Z' },
  { id: 8, title: 'Move plan\r\nphase 2', owner: 'marco', status: 'active', createdAt: '2026-07-01T12:00:00Z' },
];

// Expected toCsv output for semicolonRecords with the semicolon delimiter.
export const semicolonCsv =
  'id,title,owner,status,createdAt\r\n'
  + '1;Lease agreement, Building B;dana;active;2026-03-02T10:15:00Z\r\n'
  + '3;"Q2 ""priority"" accounts review";dana;archived;2026-04-01T08:05:00Z\r\n'
  + '8;"Move plan\r\nphase 2";marco;active;2026-07-01T12:00:00Z\r\n';
