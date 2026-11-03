import assert from 'node:assert/strict';
import test from 'node:test';

import { createRecord } from '../src/record.js';
import { renderRecord } from '../src/render.js';

test('renderRecord shows labels and escapes values', () => {
  const html = renderRecord(createRecord({ id: 7, title: 'R&D <draft>', owner: 'kim' }));
  assert.match(html, /<th>Title<\/th><td>R&amp;D &lt;draft&gt;<\/td>/);
  assert.match(html, /data-id="7"/);
});

test('renderRecord shows a dash for empty nullable fields', () => {
  const html = renderRecord(createRecord({ id: 7, title: 'A', owner: 'kim' }));
  assert.match(html, /<th>Reviewed<\/th><td>\u2014<\/td>/);
});
