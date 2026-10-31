import assert from 'node:assert/strict';
import test from 'node:test';

import { renderAdminPage } from '../src/admin.js';

const survey = {
  title: 'Team <survey>',
  questions: [{ id: 'q1', text: 'How clear was setup?', options: ['Clear', 'Unclear'] }],
};

test('renders escaped title and per-option counts', () => {
  const html = renderAdminPage(survey, [{ answers: { q1: 'Clear' } }]);
  assert.match(html, /Team &lt;survey&gt;/);
  assert.match(html, /<td>Clear<\/td><td>1<\/td>/);
  assert.match(html, /<td>Unclear<\/td><td>0<\/td>/);
  assert.match(html, /1 responses/);
});
