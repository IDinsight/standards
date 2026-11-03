// Records bundled with the tool for local exports and tests.
export const records = [
  { id: 1, title: 'Lease agreement, Building B', owner: 'dana', status: 'active', createdAt: '2026-03-02T10:15:00Z' },
  { id: 2, title: 'Vendor onboarding checklist', owner: 'li', status: 'active', createdAt: '2026-03-09T14:40:00Z' },
  { id: 3, title: 'Q2 "priority" accounts review', owner: 'dana', status: 'archived', createdAt: '2026-04-01T08:05:00Z' },
  { id: 4, title: 'Insurance renewal 2026', owner: 'marco', status: 'active', createdAt: '2026-04-18T16:20:00Z' },
];

export const STATUSES = ['active', 'archived'];

// Records matching every given filter, ordered by id.
export function filterRecords(list, { status, owner } = {}) {
  return list
    .filter((record) => !status || record.status === status)
    .filter((record) => !owner || record.owner === owner)
    .sort((a, b) => a.id - b.id);
}
