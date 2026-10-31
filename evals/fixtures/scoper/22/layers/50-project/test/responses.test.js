import assert from 'node:assert/strict';
import test from 'node:test';

import { createResponseStore } from '../src/responses.js';
import { countAnswers } from '../src/summary.js';

test('stores responses per survey', () => {
  const store = createResponseStore();
  store.add({ surveyId: 's1', submittedAt: '2026-09-01T10:00:00Z', answers: { q1: 'Yes' } });
  store.add({ surveyId: 's2', submittedAt: '2026-09-01T11:00:00Z', answers: { q1: 'No' } });
  assert.deepEqual(store.forSurvey('s1').map((record) => record.id), [1]);
});

test('rejects a response without a survey', () => {
  assert.throws(() => createResponseStore().add({ answers: {} }), /surveyId is required/);
});

test('counts answers to one question', () => {
  const store = createResponseStore();
  for (const answer of ['Yes', 'No', 'Yes']) store.add({ surveyId: 's1', answers: { q1: answer } });
  store.add({ surveyId: 's1', answers: {} });
  assert.deepEqual(countAnswers(store.forSurvey('s1'), 'q1'), { Yes: 2, No: 1 });
});
