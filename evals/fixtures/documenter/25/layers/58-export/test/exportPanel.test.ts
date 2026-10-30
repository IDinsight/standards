import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { renderExportPanel } from '../src/views/exportPanel.ts';

test('the panel is a labelled section with a submit button', () => {
  const html = renderExportPanel({ action: '/admin/export', filter: {}, count: 6 });
  assert.match(html, /<section class="export-panel" aria-labelledby="export-panel-title">/);
  assert.match(html, /<h2 id="export-panel-title" class="export-panel__title">Export records<\/h2>/);
  assert.match(html, /<form class="export-panel__form" method="post" action="\/admin\/export">/);
  assert.match(html, /<button type="submit" class="export-panel__button" aria-describedby="export-panel-summary">Download CSV<\/button>/);
});

test('the summary counts the matching records', () => {
  assert.match(renderExportPanel({ action: '/x', filter: {}, count: 6 }), /6 records match the current filters\./);
  assert.match(renderExportPanel({ action: '/x', filter: {}, count: 1 }), /1 record matches the current filters\./);
});

test('the button is disabled when no records match', () => {
  const html = renderExportPanel({ action: '/x', filter: { status: 'archived', owner: 'nobody' }, count: 0 });
  assert.match(html, /No records match the current filters\./);
  assert.match(html, /aria-describedby="export-panel-summary" disabled>Download CSV/);
});

test('current filters are carried as escaped hidden fields', () => {
  const html = renderExportPanel({ action: '/x', filter: { status: 'active', q: 'Q2 "priority" <b>' }, count: 1 });
  assert.match(html, /<input type="hidden" name="status" value="active">/);
  assert.match(html, /<input type="hidden" name="q" value="Q2 &quot;priority&quot; &lt;b&gt;">/);
  assert.doesNotMatch(html, /name="owner"/);
});

test('the stylesheet declares every custom property it uses', () => {
  const css = readFileSync(new URL('../src/views/export-panel.css', import.meta.url), 'utf8');
  const declared = new Set([...css.matchAll(/(--export-panel-[a-z-]+)\s*:/g)].map((match) => match[1]));
  const used = new Set([...css.matchAll(/var\((--export-panel-[a-z-]+)\)/g)].map((match) => match[1]));
  assert.ok(used.size > 0);
  for (const name of used) assert.ok(declared.has(name), `${name} is not declared`);
});
