import assert from 'node:assert/strict';
import test from 'node:test';

import { attachmentName, contentDisposition } from '../src/http/attachment.js';

test('attachment names use the title slug and report date', () => {
  const name = attachmentName({ title: 'Q3 Revenue: EMEA', date: '2026-09-30' }, 'csv');
  assert.equal(name, 'q3-revenue-emea-2026-09-30.csv');
  assert.equal(contentDisposition(name), 'attachment; filename="q3-revenue-emea-2026-09-30.csv"');
});
