import assert from 'node:assert/strict';
import test from 'node:test';

import { COMPLETION_POLICIES, STATES } from '../runtime/lib/core.mjs';
import { completionChangeRoute, requiredCompletionPhases } from '../runtime/lib/completion.mjs';
import { fixedRecords, requiredCompletionRecords } from '../runtime/lib/records.mjs';

test('shorter standard completion retains all upstream gates and omits only the final three phases', () => {
  const full = requiredCompletionPhases('STANDARD', 'FULL_DELIVERABLE');
  const short = requiredCompletionPhases('STANDARD', 'IMPLEMENTATION_REVIEWED');
  assert.deepEqual(short, ['SCOPING', 'ARCHITECTING', 'AUDITING', 'DEVELOPING', 'TESTING', 'REVIEWING_IMPLEMENTATION']);
  assert.deepEqual(full, [...short, 'DOCUMENTING', 'REVIEWING_FINAL', 'SYNCHRONIZING']);
  assert.deepEqual(requiredCompletionPhases('EXPEDITED', 'NONE'), ['DEVELOPING', 'REVIEWING_IMPLEMENTATION']);
  short.pop();
  assert.equal(requiredCompletionPhases('STANDARD', 'IMPLEMENTATION_REVIEWED').at(-1), 'REVIEWING_IMPLEMENTATION');
});

test('completion requirements never infer a policy for invalid combinations', () => {
  for (const [mode, policy] of [
    ['STANDARD', 'NONE'], ['STANDARD', undefined], ['STANDARD', 'UNKNOWN'],
    ['EXPEDITED', 'FULL_DELIVERABLE'], ['EXPEDITED', 'IMPLEMENTATION_REVIEWED'],
    ['DOCUMENTATION', 'FULL_DELIVERABLE'], ['DOCUMENTATION', 'IMPLEMENTATION_REVIEWED'],
    ['UNKNOWN', 'FULL_DELIVERABLE'],
  ]) {
    assert.equal(requiredCompletionPhases(mode, policy), null, `${mode}/${policy}`);
  }
  for (const policy of COMPLETION_POLICIES) assert.deepEqual(requiredCompletionPhases('UNSET', policy), []);
});

test('documentation completion requires its six gates without implementation phases', () => {
  const phases = requiredCompletionPhases('DOCUMENTATION', 'NONE');
  assert.deepEqual(phases, ['AUDITING', 'SCOPING', 'ARCHITECTING', 'DOCUMENTING', 'REVIEWING_FINAL', 'SYNCHRONIZING']);
  phases.pop();
  assert.equal(requiredCompletionPhases('DOCUMENTATION', 'NONE').at(-1), 'SYNCHRONIZING');
});

test('policy-dependent required records do not change the inventory used to discover existing records', () => {
  const id = 'add-search-20261003T120000Z-1234abcd';
  const all = fixedRecords(id);
  const full = requiredCompletionRecords(id, 'STANDARD', 'FULL_DELIVERABLE');
  const short = requiredCompletionRecords(id, 'STANDARD', 'IMPLEMENTATION_REVIEWED');
  const expedited = requiredCompletionRecords(id, 'EXPEDITED', 'NONE');
  assert.deepEqual(full, all);
  assert.deepEqual(short.map(({ artifact, reviewKind }) => [artifact, reviewKind]),
    [['VERIFICATION', null], ['REVIEW', 'IMPLEMENTATION']]);
  assert.deepEqual(expedited, short.filter(({ artifact }) => artifact === 'REVIEW'));
  assert.deepEqual(requiredCompletionRecords(id, 'DOCUMENTATION', 'NONE'),
    all.filter(({ artifact, reviewKind }) => artifact === 'DOCUMENTATION'
      || artifact === 'SYNCHRONIZATION' || reviewKind === 'FINAL_DELIVERABLE'));
  assert.deepEqual(fixedRecords(id), all);
  assert.equal(all.length, 5);
});

test('COMPLETION_CHANGE recognizes exactly the two authorized state-changing routes', () => {
  const routes = [];
  for (const from of STATES) for (const to of STATES) {
    const route = completionChangeRoute(from, to);
    if (route) routes.push({ from, to, ...route });
  }
  assert.deepEqual(routes, [
    { from: 'DOCUMENTING', to: 'REVIEWING_IMPLEMENTATION', fromPolicy: 'FULL_DELIVERABLE', toPolicy: 'IMPLEMENTATION_REVIEWED' },
    { from: 'AWAITING_USER_SIGNOFF', to: 'DOCUMENTING', fromPolicy: 'IMPLEMENTATION_REVIEWED', toPolicy: 'FULL_DELIVERABLE' },
  ]);
});
