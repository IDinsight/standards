import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

import { CYCLE_MODES } from '../runtime/lib/core.mjs';
import { parseState, validateState } from '../runtime/lib/state.mjs';

const source = (relative) => readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8');
const template = (mode) => source(`templates/${mode}/.standards/STATE.md`);
const policyField = /`CompletionPolicy`:\s*`[^`]*`/;
const policyError = /(?:Invalid or missing|Invalid) CompletionPolicy in \.standards\/STATE\.md/;
const setFields = (text, fields) => Object.entries(fields).reduce((current, [name, value]) =>
  current.replace(new RegExp('`' + name + '`:\\s*`[^`]*`'), `\`${name}\`: \`${value}\``), text);

function activeState(policy, { mode = 'STANDARD', state = 'SCOPING' } = {}) {
  return setFields(template('brownfield'), {
    Id: 'add-search-20261003T120000Z-1234abcd', Request: 'Add search.',
    CycleMode: mode, WorkflowState: state, CompletionPolicy: policy,
  });
}

test('both fresh-state templates explicitly initialize completion policy to NONE', () => {
  for (const mode of ['greenfield', 'brownfield']) {
    const text = template(mode);
    const validated = validateState(text);
    const parsed = parseState(text);
    assert.equal(validated.completionPolicy, 'NONE', mode);
    assert.equal(parsed.active.completionPolicy, 'NONE', mode);
    assert.equal(validated.id, 'UNSET', mode);
    assert.equal(validated.cycleMode, 'UNSET', mode);
    assert.equal(validated.workflowState, mode === 'greenfield' ? 'SCOPING' : 'AUDITING', mode);
  }
});

test('validation and full parsing expose the explicitly selected active-cycle policy', () => {
  for (const [mode, policy] of [
    ['STANDARD', 'FULL_DELIVERABLE'], ['STANDARD', 'IMPLEMENTATION_REVIEWED'], ['EXPEDITED', 'NONE'],
  ]) {
    const text = activeState(policy, { mode, state: 'DEVELOPING' });
    assert.equal(validateState(text).completionPolicy, policy);
    const parsed = parseState(text);
    assert.equal(parsed.active.completionPolicy, policy);
    assert.equal(parsed.CycleMode, mode);
    assert.equal(parsed.active.request, 'Add search.');
    assert.deepEqual(parsed.active.baseline, { entries: [] });
  }
});

test('terminal state parsing retains the last policy even when cycle mode is UNSET', () => {
  for (const state of ['SIGNED_OFF', 'CANCELLED']) {
    for (const policy of ['NONE', 'FULL_DELIVERABLE', 'IMPLEMENTATION_REVIEWED']) {
      const text = activeState(policy, { mode: 'UNSET', state });
      assert.equal(validateState(text).completionPolicy, policy);
      assert.equal(parseState(text).active.completionPolicy, policy);
    }
  }
});

test('documentation cycle state preserves its request, mode, and fixed policy', () => {
  const text = setFields(activeState('NONE', { mode: 'DOCUMENTATION', state: 'AUDITING' }), {
    Request: 'Update docs/auth.md in GUIDED mode; preserve the public API.',
  });
  const validated = validateState(text);
  const parsed = parseState(text);
  assert.equal(validated.cycleMode, 'DOCUMENTATION');
  assert.equal(validated.completionPolicy, 'NONE');
  assert.equal(parsed.CycleMode, 'DOCUMENTATION');
  assert.equal(parsed.WorkflowState, 'AUDITING');
  assert.equal(parsed.active.request, 'Update docs/auth.md in GUIDED mode; preserve the public API.');
  assert.equal(parsed.active.development, 'NONE');
  assert.equal(parsed.active.pendingVerificationCadence, 'NONE');
});

test('all supported pending modes round-trip without activating a cycle', () => {
  for (const mode of CYCLE_MODES) {
    const text = setFields(template('brownfield'), { PendingCycleMode: mode });
    const validated = validateState(text);
    const parsed = parseState(text);
    assert.equal(validated.pendingMode, mode);
    assert.equal(parsed.PendingCycleMode, mode);
    assert.equal(validated.cycleMode, 'UNSET');
    assert.equal(parsed.active.id, 'UNSET');
    assert.equal(parsed.active.request, 'UNSET');
  }
});

test('a blocked documentation request preserves pending intent without starting work', () => {
  const text = setFields(template('brownfield'), {
    PendingCycleMode: 'DOCUMENTATION', PendingCycleRequest: 'Update the API guide.',
    PendingCycleBlockedOn: 'Choose documentation mode or the requested standard completion policy.',
  });
  assert.equal(validateState(text).pendingMode, 'DOCUMENTATION');
  const parsed = parseState(text);
  assert.equal(parsed.PendingCycleRequest, 'Update the API guide.');
  assert.equal(parsed.PendingCycleBlockedOn,
    'Choose documentation mode or the requested standard completion policy.');
  assert.equal(parsed.active.id, 'UNSET');
  assert.equal(parsed.CycleMode, 'UNSET');
});

test('active and pending cycle modes must be concrete, present, and unique', () => {
  for (const name of ['CycleMode', 'PendingCycleMode']) {
    const field = new RegExp('`' + name + '`:\\s*`[^`]*`');
    const text = activeState('NONE', { mode: 'DOCUMENTATION', state: 'AUDITING' });
    const invalid = [
      '', `\`${name}\`: \`\``, `\`${name}\`: \` \``,
      `\`${name}\`: \`UNKNOWN\``, `\`${name}\`: \`documentation\``,
      `\`${name}\`: \`STANDARD | DOCUMENTATION\``,
      `\`${name}\`: \`DOCUMENTATION\`\n\`${name}\`: \`DOCUMENTATION\``,
      `\`${name}\`: \`STANDARD\`\n\`${name}\`: \`DOCUMENTATION\``,
    ];
    for (const replacement of invalid) {
      assert.throws(() => validateState(text.replace(field, replacement)),
        /Invalid|Inconsistent/, `${name}: ${replacement || 'missing'}`);
    }
  }
});

test('documentation mode cannot remain active in a terminal state', () => {
  for (const state of ['SIGNED_OFF', 'CANCELLED']) {
    const text = activeState('NONE', { mode: 'DOCUMENTATION', state });
    assert.throws(() => validateState(text), /Inconsistent cycle or pending fields/);
    const terminal = setFields(text, { CycleMode: 'UNSET' });
    assert.equal(validateState(terminal).completionPolicy, 'NONE');
    assert.equal(parseState(terminal).CycleMode, 'UNSET');
  }
});

test('documentation mode and pending requests support BOM and CRLF state files', () => {
  const text = '\uFEFF' + setFields(template('brownfield'), {
    PendingCycleMode: 'DOCUMENTATION', PendingCycleRequest: 'Document exports.',
    PendingCycleBlockedOn: 'Resolve the requested editing boundary.',
  }).replaceAll('\n', '\r\n');
  assert.equal(validateState(text).pendingMode, 'DOCUMENTATION');
  const parsed = parseState(text);
  assert.equal(parsed.PendingCycleMode, 'DOCUMENTATION');
  assert.equal(parsed.PendingCycleRequest, 'Document exports.');
  assert.equal(parsed.CycleMode, 'UNSET');
});

test('completion policy is required, concrete, and unique', () => {
  const text = activeState('FULL_DELIVERABLE');
  const invalid = [
    ['missing', ''],
    ['empty', '`CompletionPolicy`: ``'],
    ['blank', '`CompletionPolicy`: ` `'],
    ['unknown', '`CompletionPolicy`: `UNKNOWN`'],
    ['wrong case', '`CompletionPolicy`: `full_deliverable`'],
    ['unselected choices', '`CompletionPolicy`: `FULL_DELIVERABLE | IMPLEMENTATION_REVIEWED`'],
    ['duplicate', '`CompletionPolicy`: `FULL_DELIVERABLE`\n`CompletionPolicy`: `FULL_DELIVERABLE`'],
    ['conflicting duplicate', '`CompletionPolicy`: `FULL_DELIVERABLE`\n`CompletionPolicy`: `IMPLEMENTATION_REVIEWED`'],
  ];
  for (const [name, replacement] of invalid) {
    assert.throws(() => validateState(text.replace(policyField, replacement)), policyError, name);
  }
});

test('completion policy must be in Active Work, not a comment or another section', () => {
  const missing = activeState('FULL_DELIVERABLE').replace(policyField, '');
  const field = '`CompletionPolicy`: `FULL_DELIVERABLE`';
  for (const text of [
    missing.replace('## Active Work', `${field}\n\n## Active Work`),
    missing.replace('## Handoff', `## Handoff\n\n${field}`),
    missing.replace('## Active Work', `## Active Work\n\n<!-- ${field} -->`),
  ]) {
    assert.throws(() => validateState(text), policyError);
  }
});

test('commented examples do not override or duplicate the effective policy', () => {
  const text = activeState('IMPLEMENTATION_REVIEWED').replace('## Active Work',
    '## Active Work\n\n<!-- `CompletionPolicy`: `FULL_DELIVERABLE` -->');
  assert.equal(validateState(text).completionPolicy, 'IMPLEMENTATION_REVIEWED');
  assert.equal(parseState(text).active.completionPolicy, 'IMPLEMENTATION_REVIEWED');
});

test('completion policy parsing supports BOM and CRLF state files', () => {
  const text = '\uFEFF' + activeState('IMPLEMENTATION_REVIEWED').replaceAll('\n', '\r\n');
  assert.equal(validateState(text).completionPolicy, 'IMPLEMENTATION_REVIEWED');
  assert.equal(parseState(text).active.completionPolicy, 'IMPLEMENTATION_REVIEWED');
});

test('saved workflow fixtures explicitly declare the policy for their scenario', () => {
  const expected = {
    'cancelled-pending': 'NONE', // The retained plan uses EXPEDITED_REQUEST.
    'expedited-signoff': 'NONE',
    'greenfield-scoping': 'FULL_DELIVERABLE',
    'incremental-checkpoint': 'FULL_DELIVERABLE',
    'standard-documenting': 'FULL_DELIVERABLE',
    'standard-recovery': 'FULL_DELIVERABLE',
  };
  const fixtures = readdirSync(new URL('./fixtures/upgrade/', import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  assert.deepEqual(fixtures, Object.keys(expected).sort());
  for (const name of fixtures) {
    const text = source(`test/fixtures/upgrade/${name}/.standards/STATE.md`);
    assert.equal(validateState(text).completionPolicy, expected[name], name);
    assert.equal(parseState(text).active.completionPolicy, expected[name], name);
  }
});
