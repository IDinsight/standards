import assert from 'node:assert/strict';
import test from 'node:test';

import { InvalidMessageError, sendMessage } from '../src/send.js';
import { MAX_SUBJECT_LENGTH, validateMessage } from '../src/validate.js';

const valid = { to: 'ada@example.org', subject: 'Weekly report', body: 'Attached.' };

test('accepts a well-formed message', () => {
  assert.deepEqual(validateMessage(valid), []);
});

test('reports every problem in one result', () => {
  const errors = validateMessage({ to: 'ada', subject: '  ', body: 42 });
  assert.deepEqual(errors, ['to must be an email address', 'subject is required', 'body must be a string']);
});

test('rejects a subject longer than the limit', () => {
  const errors = validateMessage({ ...valid, subject: 'x'.repeat(MAX_SUBJECT_LENGTH + 1) });
  assert.deepEqual(errors, ['subject must be at most ' + MAX_SUBJECT_LENGTH + ' characters']);
});

test('does not contact the transport for an invalid message', async () => {
  let calls = 0;
  const transport = {
    async send() {
      calls += 1;
      return { status: 200 };
    },
  };
  await assert.rejects(sendMessage(transport, { ...valid, to: '' }), InvalidMessageError);
  assert.equal(calls, 0);
});
