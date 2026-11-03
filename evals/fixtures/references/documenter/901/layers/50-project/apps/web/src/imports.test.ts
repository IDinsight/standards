import { expect, it } from 'vitest';

import { importRows } from './imports.ts';

it('lists only finished imports', () => {
  const rows = importRows([
    { id: 'a', status: 'running', created_at: '2026-09-01T10:00:00Z' },
    { id: 'b', status: 'done', created_at: '2026-09-01T11:00:00Z' },
  ]);
  expect(rows.map((row) => row.id)).toEqual(['b']);
});
