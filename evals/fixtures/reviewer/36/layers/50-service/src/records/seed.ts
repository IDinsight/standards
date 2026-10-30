import type { RecordItem } from './store.ts';

// Records loaded into the in-memory store when the service starts.
export const seedRecords: readonly RecordItem[] = [
  { id: 1, tenantId: 'northwind', title: 'Lease agreement, Building B', owner: 'dana', status: 'active', createdAt: '2026-03-02T10:15:00Z' },
  { id: 2, tenantId: 'northwind', title: 'Vendor onboarding checklist', owner: 'li', status: 'active', createdAt: '2026-03-09T14:40:00Z' },
  { id: 3, tenantId: 'northwind', title: 'Q2 "priority" accounts review', owner: 'dana', status: 'archived', createdAt: '2026-04-01T08:05:00Z' },
  { id: 4, tenantId: 'harbor', title: 'Insurance renewal 2026', owner: 'marco', status: 'active', createdAt: '2026-04-18T16:20:00Z' },
  { id: 5, tenantId: 'harbor', title: 'Data retention policy', owner: 'priya', status: 'archived', createdAt: '2026-05-06T11:00:00Z' },
  { id: 6, tenantId: 'harbor', title: 'Office move inventory', owner: 'marco', status: 'active', createdAt: '2026-06-12T09:30:00Z' },
];
