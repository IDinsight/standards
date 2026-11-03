import assert from 'node:assert/strict';
import test from 'node:test';

import { renderReportsPage } from '../src/pages/reports.js';
import { summarize } from '../src/reports.js';

test('summarize totals amounts by region', () => {
  assert.deepEqual(
    summarize([
      { region: 'south', amount: '5' },
      { region: 'north', amount: '10' },
      { region: 'north', amount: '2' },
    ]),
    [{ region: 'north', total: 12 }, { region: 'south', total: 5 }],
  );
});

test('reports page lists each region', () => {
  const html = renderReportsPage([{ region: 'north', amount: '3' }]);
  assert.match(html, /<td>north<\/td><td>3<\/td>/);
});
