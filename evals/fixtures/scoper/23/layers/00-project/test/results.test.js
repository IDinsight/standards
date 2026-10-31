import assert from 'node:assert/strict';
import test from 'node:test';

import { summarize } from '../src/results.js';

const survey = {
  title: 'Onboarding',
  questions: [{ id: 'q1', text: 'How clear was setup?', options: ['Clear', 'Unclear'] }],
};

test('counts answers per option', () => {
  const result = summarize(survey, [
    { answers: { q1: 'Clear' } },
    { answers: { q1: 'Clear' } },
    { answers: { q1: 'Unclear' } },
  ]);
  assert.deepEqual(result[0].counts, { Clear: 2, Unclear: 1 });
  assert.equal(result[0].total, 3);
});

test('ignores answers outside the options', () => {
  const result = summarize(survey, [{ answers: { q1: 'Maybe' } }, { answers: {} }]);
  assert.deepEqual(result[0].counts, { Clear: 0, Unclear: 0 });
});
