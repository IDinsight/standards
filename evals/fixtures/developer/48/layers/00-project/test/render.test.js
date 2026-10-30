import assert from 'node:assert/strict';
import test from 'node:test';

import { createAdminRecord } from '../src/adminRecords.js';
import { renderAdminRecord } from '../src/render.js';

test('renders each field as a labelled row', () => {
  const html = renderAdminRecord(createAdminRecord({ id: 4, displayName: 'Noor', email: 'noor@example.org', role: 'admin' }));
  assert.match(html, /<tr><th>Name<\/th><td>Noor<\/td><\/tr>/);
  assert.match(html, /<tr><th>Role<\/th><td>admin<\/td><\/tr>/);
});

test('empty optional fields show a placeholder', () => {
  const html = renderAdminRecord(createAdminRecord({ id: 5, displayName: 'Eli', email: 'eli@example.org' }));
  assert.match(html, /<tr><th>Suspended reason<\/th><td><span class="empty">—<\/span><\/td><\/tr>/);
});

test('values are escaped', () => {
  const record = {
    ...createAdminRecord({ id: 6, displayName: 'Ana', email: 'ana@example.org' }),
    suspendedReason: '<b>fraud</b> & abuse',
  };
  assert.match(renderAdminRecord(record), /&lt;b&gt;fraud&lt;\/b&gt; &amp; abuse/);
});
