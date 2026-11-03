import assert from 'node:assert/strict';
import test from 'node:test';

import { daysOverdue, isOverdue } from '../src/loans.js';

const loan = (fields) => ({
  id: 'L1',
  borrower: { name: 'Ada', email: 'ada@example.org' },
  title: 'Dune',
  due: '2026-09-10',
  returned: null,
  ...fields,
});

test('counts whole days past the due date', () => {
  assert.equal(daysOverdue(loan({}), '2026-09-13'), 3);
});

test('a loan due today is not overdue', () => {
  assert.equal(isOverdue(loan({ due: '2026-09-13' }), '2026-09-13'), false);
});

test('returned loans are never overdue', () => {
  assert.equal(daysOverdue(loan({ returned: '2026-09-12' }), '2026-09-20'), 0);
});
