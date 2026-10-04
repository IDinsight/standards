import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { checkClosureAssessment } from '../runtime/lib/review.mjs';
import { recordSection, recordSections } from '../runtime/lib/records.mjs';

const fields = {
  Policy: 'IMPLEMENTATION_REVIEWED', Eligibility: 'ELIGIBLE',
  'User Choice': 'User requested finishing after implementation review.', 'User Reason': 'NONE',
  'Assessed Inputs': 'Scope, design, implementation, full verification, configuration, and dependency content identities.',
  Evidence: 'Current acceptance assessment and owner evidence references.',
  'Unmet Requirements': 'NONE', 'Omitted Phases': 'DOCUMENTING, REVIEWING_FINAL, SYNCHRONIZING',
  'Omitted Guarantees': 'Normal documentation completion, final review, and independent synchronization omitted.',
};
const fieldText = (name, value) => `\`${name}\`: \`${value}\``;
const assessment = (values = fields) => '## Implementation-Reviewed Closure\n\n'
  + Object.entries(values).map(([name, value]) => fieldText(name, value)).join('\n') + '\n';
function check(text, options = {}) {
  const problems = [];
  checkClosureAssessment(text, { required: true, reviewKind: 'IMPLEMENTATION',
    ...options, problem: (message) => problems.push(message) });
  return problems;
}

test('eligible closure requires a separate assessment, while ordinary review does not', () => {
  assert.deepEqual(check(assessment()), []);
  assert.match(check('# Review Report\n`Status`: `COMPLETE`')[0], /requires an Implementation-Reviewed Closure assessment/);
  for (const reviewKind of ['IMPLEMENTATION', 'FINAL_DELIVERABLE']) {
    assert.deepEqual(check('# Review Report\n`Status`: `COMPLETE`', { required: false, reviewKind }), []);
  }
  assert.match(check(assessment(), { required: false, reviewKind: 'FINAL_DELIVERABLE' })[0], /belongs only in the implementation/);
});

test('unassessed and ineligible closure can accompany a passing ordinary review, but cannot establish readiness', () => {
  for (const Eligibility of ['NOT_ASSESSED', 'INELIGIBLE']) {
    const text = assessment({ ...fields, Eligibility,
      'Unmet Requirements': Eligibility === 'INELIGIBLE' ? 'Documenter: required guide evidence.' : 'NONE' });
    assert.deepEqual(check(text, { required: false }), []);
    assert.ok(check(text).some((message) => /requires Closure Eligibility ELIGIBLE/.test(message)));
  }
  assert.match(check(assessment({ ...fields, Eligibility: 'INELIGIBLE' }), { required: false })[0], /must identify the unmet requirements/);
});

test('closure fields are required, unique, concrete, and scoped to the current section', () => {
  for (const [name, value] of Object.entries(fields)) {
    for (const replacement of ['', fieldText(name, ''), fieldText(name, '   '), fieldText(name, '<fill in>'),
      fieldText(name, 'A | B'), `${fieldText(name, value)}\n${fieldText(name, value)}`]) {
      const text = assessment().replace(fieldText(name, value), replacement);
      assert.ok(check(text).some((message) => message.includes(`one concrete ${name} field`)), `${name}: ${replacement}`);
    }
    const missing = assessment().replace(fieldText(name, value), '');
    assert.ok(check(`${fieldText(name, value)}\n${missing}`).some((message) => message.includes(`one concrete ${name} field`)));
  }
});

test('eligibility cannot claim another policy, invent an outcome, omit guarantees, or leave owner work', () => {
  for (const Policy of ['NONE', 'FULL_DELIVERABLE', 'UNKNOWN']) {
    assert.match(check(assessment({ ...fields, Policy }))[0], /Policy must be IMPLEMENTATION_REVIEWED/);
  }
  assert.ok(check(assessment({ ...fields, Eligibility: 'PASSED' })).some((message) => /Closure Eligibility must be/.test(message)));
  for (const name of ['User Choice', 'Assessed Inputs', 'Evidence', 'Omitted Guarantees']) {
    assert.match(check(assessment({ ...fields, [name]: 'NONE' }))[0], new RegExp(`requires ${name}, not NONE`));
  }
  for (const value of ['NONE', 'DOCUMENTING', 'DOCUMENTING, REVIEWING_FINAL, REVIEWING_FINAL', `${fields['Omitted Phases']}, TESTING`]) {
    assert.match(check(assessment({ ...fields, 'Omitted Phases': value }))[0], /Omitted Phases must list/);
  }
  assert.match(check(assessment({ ...fields, 'Unmet Requirements': 'Tester must reverify current content.' }))[0], /Unmet Requirements NONE/);
});

test('commented and fenced examples cannot supply closure evidence; contradictory sections are rejected', () => {
  assert.match(check(`<!--\n${assessment()}-->`)[0], /requires an Implementation-Reviewed Closure assessment/);
  assert.match(check(`~~~markdown\n${assessment()}~~~`)[0], /requires an Implementation-Reviewed Closure assessment/);
  const example = assessment().replace(fieldText('Evidence', fields.Evidence),
    `<!-- ${fieldText('Evidence', fields.Evidence)} -->`);
  assert.ok(check(example).some((message) => /one concrete Evidence/.test(message)));
  assert.match(check(assessment() + assessment({ ...fields, Eligibility: 'INELIGIBLE' }))[0], /exactly one current/);
});

test('superseded conclusions stay outside the current section, including with CRLF and formatted headings', () => {
  const current = assessment().replace('## Implementation-Reviewed Closure', '## Implementation-Reviewed Closure: ##');
  const history = '\n## Closure Assessment History\n' + assessment({ ...fields, Eligibility: 'INELIGIBLE' })
    .replace('## Implementation-Reviewed Closure', '### Earlier assessment');
  const text = `\uFEFF# Review Report\n\n${current}${history}`.replaceAll('\n', '\r\n');
  assert.deepEqual(check(text), []);
  assert.equal(recordSections(text, 'Implementation-Reviewed Closure').length, 1);
  assert.equal(recordSection(text, 'Implementation-Reviewed Closure'), recordSections(text, 'Implementation-Reviewed Closure')[0]);
});

test('Reviewer template initializes an unassessed closure with the supported fields', () => {
  const template = readFileSync(new URL('../skills/reviewer/template.md', import.meta.url), 'utf8');
  const section = recordSection(template, 'Implementation-Reviewed Closure');
  // The template includes authoring prose with field examples; exercise its
  // initial field block as the role would copy it into a current report.
  const block = section.slice(section.indexOf('`Policy`:'), section.indexOf('Keep each field'));
  const text = `## Implementation-Reviewed Closure\n${block}`;
  assert.deepEqual(check(text, { required: false }), []);
  assert.ok(check(text).some((message) => /requires Closure Eligibility ELIGIBLE/.test(message)));
});
