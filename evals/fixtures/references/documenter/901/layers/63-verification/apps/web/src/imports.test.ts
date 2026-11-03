import { expect, it } from 'vitest';

import { importRows } from './imports.ts';

it('shows pending and failed imports', () => {
  const rows = importRows([
    { id: 'a', status: 'pending', created_at: '2026-09-20T10:00:00Z', error: null },
    { id: 'b', status: 'failed', created_at: '2026-09-20T10:00:00Z', error: 'file has no rows' },
  ]);
  expect(rows[0].text).toMatch(/^Waiting: /);
  expect(rows[1].text).toBe('Failed: file has no rows');
});
