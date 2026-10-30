import assert from 'node:assert/strict';
import test from 'node:test';

import { renderListPage } from '../src/ui/listPage.js';

test('renders names and prices', () => {
  const html = renderListPage([{ id: 1, name: 'Mug', priceCents: 850, stock: 4 }]);
  assert.match(html, /<span class="name">Mug<\/span>/);
  assert.match(html, /<span class="price">\$8\.50<\/span>/);
});

test('escapes item names', () => {
  const html = renderListPage([{ id: 2, name: 'Salt & <Pepper>', priceCents: 300, stock: 0 }]);
  assert.match(html, /Salt &amp; &lt;Pepper&gt;/);
});

test('shows an empty message without items', () => {
  assert.match(renderListPage([]), /No items\./);
});
