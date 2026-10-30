import assert from 'node:assert/strict';
import test from 'node:test';

import { renderNotes } from '../src/render.js';

test('groups entries by type in a fixed order', () => {
  const out = renderNotes('1.2.0', [
    { type: 'fixed', text: 'Handle empty input ' },
    { type: 'added', text: 'JSON output' },
  ]);
  assert.equal(out, '## 1.2.0\n\n### Added\n\n- JSON output\n\n### Fixed\n\n- Handle empty input\n');
});

test('rejects unknown entry types', () => {
  assert.throws(() => renderNotes('1.0.0', [{ type: 'misc', text: 'x' }]), /unknown entry type/);
});
