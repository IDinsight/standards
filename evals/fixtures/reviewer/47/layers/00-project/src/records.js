const RECORDS = [
  { id: 1, title: 'Quarterly budget', owner: 'Ada Lovelace', notes: 'Approved', updatedAt: '2026-08-02' },
  { id: 2, title: 'Vendor review, Q3', owner: 'Grace Hopper', notes: 'Marked "urgent" by finance', updatedAt: '2026-08-19' },
  { id: 3, title: 'Office move', owner: 'Alan Turing', notes: 'Floor plan attached\nKeys returned', updatedAt: '2026-09-01' },
];

export function listRecords() {
  return RECORDS.map((record) => ({ ...record }));
}
