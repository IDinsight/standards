import assert from 'node:assert/strict';
import test from 'node:test';

import { exportSurveyCsv } from '../src/export.js';
import { createResponseStore } from '../src/responses.js';

test('exports one row per response with a header', () => {
  const store = createResponseStore();
  store.add({ surveyId: 's1', submittedAt: '2026-09-01T10:00:00Z', answers: { q1: 'Yes', q2: '4' } });
  store.add({ surveyId: 's2', submittedAt: '2026-09-01T11:00:00Z', answers: { q1: 'No' } });
  assert.equal(
    exportSurveyCsv(store, 's1', ['q1', 'q2']),
    'response_id,submitted_at,q1,q2\r\n1,2026-09-01T10:00:00Z,Yes,4\r\n',
  );
});

test('quotes fields with commas, quotes, and newlines', () => {
  const store = createResponseStore();
  store.add({ surveyId: 's1', submittedAt: '2026-09-02T09:00:00Z', answers: { comment: 'Good, "fast"\nservice' } });
  assert.equal(
    exportSurveyCsv(store, 's1', ['comment']),
    'response_id,submitted_at,comment\r\n1,2026-09-02T09:00:00Z,"Good, ""fast""\nservice"\r\n',
  );
});

test('leaves unanswered questions empty', () => {
  const store = createResponseStore();
  store.add({ surveyId: 's1', submittedAt: '2026-09-03T08:30:00Z', answers: { q1: 'Yes' } });
  assert.equal(
    exportSurveyCsv(store, 's1', ['q1', 'q2']),
    'response_id,submitted_at,q1,q2\r\n1,2026-09-03T08:30:00Z,Yes,\r\n',
  );
});
