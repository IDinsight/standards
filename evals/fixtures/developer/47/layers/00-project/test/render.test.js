import assert from 'node:assert/strict';
import test from 'node:test';

import { escapeHtml, renderTable, renderToolbar } from '../src/render.js';

test('escapeHtml escapes markup characters', () => {
  assert.equal(escapeHtml('<b>"x" & y</b>'), '&lt;b&gt;&quot;x&quot; &amp; y&lt;/b&gt;');
});

test('renderTable renders one row per item', () => {
  const html = renderTable([
    { sku: 'A-1', name: 'Bolt', qty: 3 },
    { sku: 'A-2', name: 'Nut', qty: 5 },
  ]);
  assert.equal((html.match(/<tr>/g) ?? []).length, 3);
  assert.match(html, /<td>Bolt<\/td>/);
});

test('renderToolbar includes the add button', () => {
  assert.match(renderToolbar(), /id="add-item"/);
});
