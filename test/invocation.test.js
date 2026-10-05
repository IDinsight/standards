import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmod, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import { installProject } from '../lib/install.js';
import { discoverInvocation, evaluateInvocationCondition, parseInvocationBlock, readInvocationCatalog } from '../runtime/lib/invocation.mjs';
import { compileInvocationSchema } from '../runtime/lib/invocation-schema.mjs';
import { fixedPath, provenanceBlock } from '../runtime/lib/records.mjs';

const exec = promisify(execFile);
const tick = String.fromCharCode(96);
const fence = tick.repeat(3);
const marker = '<!-- standards:invocation -->';
const cycleId = 'sample-20261005T120000Z-1234abcd';
const read = (root, file) => readFile(path.join(root, file), 'utf8');
async function write(root, file, contents) {
  await mkdir(path.dirname(path.join(root, file)), { recursive: true });
  await writeFile(path.join(root, file), contents);
}
const sourceBlock = (data) => marker + '\n\n' + fence + 'json\n' + JSON.stringify(data, null, 2) + '\n' + fence + '\n';
const schema = JSON.parse(await readFile(new URL('../runtime/schemas/invocation-metadata.schema.json', import.meta.url), 'utf8'));
const validate = compileInvocationSchema(schema);
const mode = { schemaVersion: 1, kind: 'mode', group: 'collaboration', id: 'EXTRA',
  label: 'Extra', description: 'Another collaboration choice.', selection: 'user' };
const plan = { Mode: 'STEPWISE', Status: 'PROPOSED', 'User Style': 'NONE', 'User Style Locked': 'false' };

async function fixture(run, clients = ['codex']) {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'standards-invocation-test-')));
  try {
    await write(root, 'app.py', 'print("hello")\n');
    await installProject({ projectRoot: root, clients, hooks: false });
    await run(root);
  } finally { await rm(root, { recursive: true, force: true }); }
}
function setField(text, name, value) {
  return text.replace(new RegExp(tick + name + tick + ':(\\s*)' + tick + '[^' + tick + ']*' + tick),
    tick + name + tick + ':$1' + tick + value + tick);
}
async function state(root, values = {}) {
  let text = await read(root, '.standards/STATE.md');
  for (const [key, value] of Object.entries({ Id: cycleId, Request: 'Sample change', CycleMode: 'STANDARD',
    CompletionPolicy: 'FULL_DELIVERABLE', WorkflowState: 'DEVELOPING', Kind: 'FORWARD',
    From: 'ARCHITECTING', Reason: 'Architecture completed', ...values })) text = setField(text, key, value);
  await write(root, '.standards/STATE.md', text);
}
async function record(root, artifact, fields, kind = null, id = cycleId) {
  const file = fixedPath(artifact, cycleId, kind);
  const header = { Cycle: id, ...(kind ? { ReviewKind: kind } : {}), ...fields };
  await write(root, file, provenanceBlock(artifact, id, kind) + '\n\n# Record\n\n'
    + Object.entries(header).map(([key, value]) => tick + key + tick + ': ' + tick + value + tick).join('\n') + '\n\n## Body\n');
  return file;
}
async function editMetadata(root, file, edit) {
  const text = await read(root, file);
  const metadata = parseInvocationBlock(text, validate);
  edit(metadata);
  const start = text.indexOf(marker);
  const opening = text.indexOf(fence + 'json', start);
  const end = text.indexOf('\n' + fence, opening);
  await write(root, file, text.slice(0, start) + sourceBlock(metadata).trimEnd() + text.slice(end + 1 + fence.length));
}
const skill = (role, client = 'codex') => (client === 'codex' ? '.agents' : '.claude') + '/skills/' + role;
const group = (result, id) => result.groups.find((item) => item.id === id);
const diagnostic = (result, pattern) => assert.ok(result.diagnostics.some((item) => pattern.test(item.message)), JSON.stringify(result.diagnostics));
async function snapshot(root, relative = '') {
  const result = [];
  for (const name of (await readdir(path.join(root, relative))).sort()) {
    const file = relative ? relative + '/' + name : name;
    const info = await lstat(path.join(root, file));
    if (info.isDirectory()) result.push(...await snapshot(root, file));
    else if (info.isFile()) result.push([file, info.mtimeMs, createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')]);
  }
  return result;
}

test('all shipped source blocks and installed role catalogs validate', () => fixture(async (root) => {
  const roles = (await readdir(new URL('../skills/', import.meta.url), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  let modes = 0;
  for (const role of roles) {
    const catalog = await readInvocationCatalog(root, role);
    assert.equal(catalog.role, role);
    assert.equal(catalog.client, 'codex');
    for (const item of catalog.groups) if (item.source === 'modes') modes += item.options.length;
    for (const item of catalog.groups) if (item.defaultForNew) assert.equal(item.options.find((option) => option.id === item.defaultForNew).selection, 'user');
  }
  assert.equal(roles.length, 9);
  assert.equal(modes, 23);
}));

test('a new mode and alice.md are discovered on the next call without a registry update or writes', () => fixture(async (root) => {
  await state(root);
  await record(root, 'DEVELOPMENT', { ...plan, Mode: 'EXTRA', 'User Style': 'tony' });
  await write(root, '.standards/user-styles/developer/tony.md', 'PRIVATE STYLE CONTENT');
  assert.equal(group(await discoverInvocation(root, 'developer'), 'collaboration').selected.status, 'invalid');
  await write(root, skill('developer') + '/modes/new-name.md', '# Extra\n\n' + sourceBlock(mode) + '\nNew instructions.\n');
  await write(root, '.standards/user-styles/developer/alice.md', 'ANOTHER PRIVATE STYLE');
  const before = await snapshot(root);
  const next = await discoverInvocation(root, 'developer');
  assert.equal(next.complete, true, JSON.stringify(next.diagnostics));
  assert.equal(group(next, 'collaboration').selected.value, 'EXTRA');
  assert.deepEqual(next.userStyles.options.map((item) => item.id), ['alice', 'tony']);
  assert.equal(next.userStyles.selected.value, 'tony');
  assert.doesNotMatch(JSON.stringify(next), /PRIVATE STYLE|New instructions/);
  assert.deepEqual(await snapshot(root), before);
}));

test('two client copies require explicit selection and are never mixed', () => fixture(async (root) => {
  await write(root, skill('developer', 'claude') + '/modes/extra.md', sourceBlock(mode));
  const result = await discoverInvocation(root, 'developer');
  assert.equal(result.catalogStatus, 'unavailable');
  diagnostic(result, /specify --client/);
  assert.equal((await readInvocationCatalog(root, 'developer', { client: 'codex' })).groups[0].options.length, 3);
  assert.equal((await readInvocationCatalog(root, 'developer', { client: 'claude' })).groups[0].options.length, 4);
}, ['codex', 'claude']));

test('Navigator works without runtime state and keeps choices in conversation', () => fixture(async (root) => {
  await rm(path.join(root, '.standards'), { recursive: true });
  const result = await discoverInvocation(root, 'navigator');
  assert.equal(result.complete, true);
  assert.equal(result.groups[0].selected.status, 'conversation');
  assert.equal(result.groups[0].defaultForNew, 'EXPLAIN');
  assert.equal(result.userStyles.selected.status, 'conversation');
  assert.deepEqual(result.userStyles.options, []);
}));

test('missing records never apply defaults or unlock styles', () => fixture(async (root) => {
  for (const active of [false, true]) {
    if (active) await state(root);
    const result = await discoverInvocation(root, 'developer');
    assert.equal(group(result, 'collaboration').defaultForNew, 'AUTONOMOUS');
    assert.equal(group(result, 'collaboration').selected.status, 'unknown');
    assert.equal(result.userStyles.locked, 'unknown');
    assert.equal(result.complete, false);
  }
}));

test('style locks survive approval and plan revisions, including NONE', () => fixture(async (root) => {
  await state(root);
  for (const status of ['APPROVED', 'PROPOSED']) {
    await record(root, 'DEVELOPMENT', { ...plan, Status: status, 'User Style Locked': 'true' });
    const result = await discoverInvocation(root, 'developer');
    assert.equal(result.complete, true, JSON.stringify(result.diagnostics));
    assert.equal(result.userStyles.locked, 'true');
    assert.equal(result.userStyles.selected.value, 'NONE');
    assert.equal(group(result, 'collaboration').selected.value, 'STEPWISE');
  }
}));

test('invalid lock values and approval contradictions yield unknown', () => fixture(async (root) => {
  await state(root);
  for (const [lock, status] of [['maybe', 'PROPOSED'], ['false', 'APPROVED']]) {
    await record(root, 'DEVELOPMENT', { ...plan, Status: status, 'User Style Locked': lock });
    const result = await discoverInvocation(root, 'developer');
    assert.equal(result.userStyles.locked, 'unknown');
    assert.equal(result.complete, false);
  }
}));

test('stale provenance, duplicate fields, wrong paths, placeholders and terminal records remain unresolved', () => fixture(async (root) => {
  await state(root);
  await record(root, 'DEVELOPMENT', plan, null, 'another-20261005T120000Z-1234abcd');
  assert.equal((await discoverInvocation(root, 'developer')).userStyles.savedValue.status, 'unknown');
  let file = await record(root, 'DEVELOPMENT', plan);
  await write(root, file, (await read(root, file)).replace('## Body', tick + 'User Style Locked' + tick + ': ' + tick + 'true' + tick + '\n\n## Body'));
  assert.equal((await discoverInvocation(root, 'developer')).userStyles.locked, 'unknown');
  await record(root, 'DEVELOPMENT', { ...plan, Mode: 'AUTONOMOUS | STEPWISE | CODE_WITH_ME' });
  assert.equal(group(await discoverInvocation(root, 'developer'), 'collaboration').selected.status, 'unknown');
  file = await record(root, 'DEVELOPMENT', plan);
  await state(root, { Development: 'elsewhere.md' });
  assert.equal(group(await discoverInvocation(root, 'developer'), 'collaboration').selected.status, 'unknown');
  await state(root, { Development: file, WorkflowState: 'SIGNED_OFF', CycleMode: 'UNSET' });
  assert.equal((await discoverInvocation(root, 'developer')).userStyles.savedValue.status, 'unknown');
}));

test('Development references reject escaping, absolute, wrong-cycle and mismatched paths after normalization', () => fixture(async (root) => {
  const file = await record(root, 'DEVELOPMENT', { ...plan, Status: 'APPROVED', 'User Style Locked': 'true' });
  const otherCycle = fixedPath('DEVELOPMENT', 'another-20261005T120000Z-1234abcd');
  for (const reference of [
    '../' + file, '/' + file, path.join(root, file),
    './' + otherCycle, otherCycle.replace('/development/', '/development/../development/'),
    file.replace('/development/', '/development/../architecture/'),
  ]) {
    await state(root, { Development: reference });
    const result = await discoverInvocation(root, 'developer');
    assert.equal(result.complete, false, reference);
    assert.equal(group(result, 'collaboration').selected.status, 'unknown', reference);
    assert.equal(result.userStyles.savedValue.status, 'unknown', reference);
    assert.equal(result.userStyles.locked, 'unknown', reference);
  }
}));

test('normalized Development references keep provenance and record symlink checks', () => fixture(async (root) => {
  const file = await record(root, 'DEVELOPMENT', plan, null, 'another-20261005T120000Z-1234abcd');
  await state(root, { Development: './' + file });
  let result = await discoverInvocation(root, 'developer');
  assert.equal(result.userStyles.savedValue.status, 'unknown');
  diagnostic(result, /wrong or malformed current-cycle provenance/);
  await record(root, 'DEVELOPMENT', plan);
  const outside = await mkdtemp(path.join(os.tmpdir(), 'standards-invocation-outside-'));
  try {
    const target = path.join(outside, 'plan.md');
    await writeFile(target, await read(root, file));
    await rm(path.join(root, file));
    await symlink(target, path.join(root, file));
    result = await discoverInvocation(root, 'developer');
    assert.equal(group(result, 'collaboration').selected.status, 'unknown');
    assert.equal(result.userStyles.savedValue.status, 'unknown');
    assert.equal(result.userStyles.locked, 'unknown');
    diagnostic(result, /symlink escaping its allowed folder/);
  } finally { await rm(outside, { recursive: true, force: true }); }
}));

test('Documenter retains guided collaboration, target detail, and personal style', () => fixture(async (root) => {
  await state(root, { WorkflowState: 'DOCUMENTING', CycleMode: 'DOCUMENTATION', CompletionPolicy: 'NONE' });
  await record(root, 'DOCUMENTATION', { Collaboration: 'GUIDED', Target: 'FILE', 'Target Detail': 'docs/start.md', 'User Style': 'alice' });
  await write(root, '.standards/user-styles/documenter/alice.md', 'Preferences');
  const result = await discoverInvocation(root, 'documenter');
  assert.equal(result.complete, true, JSON.stringify(result.diagnostics));
  assert.equal(group(result, 'collaboration').selected.value, 'GUIDED');
  assert.equal(group(result, 'target').selected.value, 'FILE');
  assert.equal(group(result, 'target').savedArgument.value, 'docs/start.md');
  assert.equal(result.userStyles.selected.value, 'alice');
}));

test('Reviewer resolves state before reading that kind report and style', () => fixture(async (root) => {
  for (const [id, kind] of [['first', 'IMPLEMENTATION'], ['last', 'FINAL_DELIVERABLE']]) {
    await write(root, '.standards/user-styles/reviewer/' + id + '.md', 'Style');
    await record(root, 'REVIEW', { 'User Style': id }, kind);
  }
  for (const [workflow, kind, style] of [['REVIEWING_IMPLEMENTATION', 'IMPLEMENTATION', 'first'], ['REVIEWING_FINAL', 'FINAL_DELIVERABLE', 'last']]) {
    await state(root, { WorkflowState: workflow });
    const result = await discoverInvocation(root, 'reviewer');
    assert.equal(result.complete, true, JSON.stringify(result.diagnostics));
    assert.equal(result.groups[0].selected.value, kind);
    assert.equal(result.groups[0].selected.source, 'state');
    assert.equal(result.userStyles.selected.value, style);
    assert.ok(result.groups[0].options.every((option) => option.selectability !== 'user'));
  }
}));

test('Architect distinguishes state-selected documentation from assessed standard modes', () => fixture(async (root) => {
  await state(root, { WorkflowState: 'ARCHITECTING', CycleMode: 'DOCUMENTATION', CompletionPolicy: 'NONE' });
  assert.equal((await discoverInvocation(root, 'architect')).groups[0].selected.value, 'DOCUMENTATION');
  await state(root, { WorkflowState: 'ARCHITECTING' });
  const result = await discoverInvocation(root, 'architect');
  assert.equal(result.groups[0].selected.status, 'assessment');
  assert.equal(result.groups[0].options.filter((option) => option.condition === 'true').length, 4);
}));

test('Auditor retains an area without forcing its assessed mode or interpreting NONE as a target', () => fixture(async (root) => {
  await state(root, { WorkflowState: 'AUDITING', AuditTarget: 'payment behavior' });
  let result = await discoverInvocation(root, 'auditor');
  assert.equal(group(result, 'inspection-mode').selected.status, 'assessment');
  assert.equal(group(result, 'target').savedArgument.value, 'payment behavior');
  assert.equal(group(result, 'target').options[0].selectability, 'assessment-required');
  await state(root, { WorkflowState: 'AUDITING', AuditTarget: 'NONE' });
  result = await discoverInvocation(root, 'auditor');
  assert.equal(group(result, 'target').savedArgument.status, 'none');
}));

test('a saved Tester mode is resume evidence, not a new assessment', () => fixture(async (root) => {
  await state(root, { WorkflowState: 'TESTING' });
  await record(root, 'VERIFICATION', { Mode: 'REVERIFY', 'User Style': 'NONE' });
  const result = await discoverInvocation(root, 'tester');
  assert.equal(result.groups[0].savedValue.value, 'REVERIFY');
  assert.equal(result.groups[0].selected.status, 'assessment');
}));

test('conditions use three-valued all/any logic and canonical strings', async () => {
  const facts = async ({ field }) => field === 'unknown' ? { status: 'unknown', value: null } : { status: 'known', value: field };
  const p = (value) => ({ fact: { field: value }, equals: 'true' });
  assert.equal(await evaluateInvocationCondition(p('unknown'), facts), 'unknown');
  assert.equal(await evaluateInvocationCondition({ all: [p('unknown'), p('false')] }, facts), 'false');
  assert.equal(await evaluateInvocationCondition({ all: [p('unknown'), p('true')] }, facts), 'unknown');
  assert.equal(await evaluateInvocationCondition({ any: [p('unknown'), p('true')] }, facts), 'true');
  assert.equal(await evaluateInvocationCondition({ any: [p('unknown'), p('false')] }, facts), 'unknown');
  assert.equal(await evaluateInvocationCondition({ all: [p('true'), { any: [p('false'), p('true')] }] }, facts), 'true');
});

test('conflicting or partly unknown state conditions do not pick a winner or report', () => fixture(async (root) => {
  await state(root, { WorkflowState: 'REVIEWING_IMPLEMENTATION' });
  const file = skill('reviewer') + '/modes/final-deliverable.md';
  await editMetadata(root, file, (value) => { value.when.equals = 'REVIEWING_IMPLEMENTATION'; });
  let result = await discoverInvocation(root, 'reviewer');
  assert.equal(result.groups[0].selected.status, 'conflict');
  assert.equal(result.userStyles.selected.status, 'unknown');
  await editMetadata(root, file, (value) => {
    value.when = { fact: { kind: 'record', artifact: 'DEVELOPMENT', field: 'User Style Locked' }, equals: 'true' };
  });
  result = await discoverInvocation(root, 'reviewer');
  assert.equal(result.groups[0].selected.status, 'unknown');
  assert.equal(result.userStyles.selected.status, 'unknown');
}));

test('cyclic state dependencies fail, but saved bindings may use their own state-derived group', () => fixture(async (root) => {
  await editMetadata(root, skill('reviewer') + '/SKILL.md', (value) => {
    value.groups[0].savedValue = { kind: 'record', artifact: 'REVIEW', field: 'ReviewKind', reviewKindFromGroup: 'review-kind' };
  });
  assert.equal((await discoverInvocation(root, 'reviewer')).catalogStatus, 'complete');
  await editMetadata(root, skill('reviewer') + '/modes/implementation.md', (value) => {
    value.when = { fact: { kind: 'record', artifact: 'REVIEW', field: 'ReviewKind', reviewKindFromGroup: 'review-kind' }, equals: 'IMPLEMENTATION' };
  });
  const result = await discoverInvocation(root, 'reviewer');
  assert.equal(result.catalogStatus, 'unavailable');
  diagnostic(result, /Cyclic/);
}));

test('state corruption and impossible routes cannot establish a state-selected kind', () => fixture(async (root) => {
  for (const values of [
    { WorkflowState: 'REVIEWING_FINAL', CycleMode: 'EXPEDITED', CompletionPolicy: 'NONE' },
    { WorkflowState: 'REVIEWING_IMPLEMENTATION', Id: '../../wrong' },
  ]) {
    await state(root, values);
    assert.equal((await discoverInvocation(root, 'reviewer')).groups[0].selected.status, 'unknown');
  }
  await state(root, { WorkflowState: 'REVIEWING_FINAL' });
  await write(root, '.standards/STATE.md', (await read(root, '.standards/STATE.md')) + '\n<<<<<<< merge conflict\n');
  assert.equal((await discoverInvocation(root, 'reviewer')).groups[0].selected.status, 'unknown');
}));

test('styles use direct children and internal aliases without substituting missing or ambiguous selections', () => fixture(async (root) => {
  await state(root);
  await record(root, 'DEVELOPMENT', { ...plan, Status: 'APPROVED', 'User Style': 'missing', 'User Style Locked': 'true' });
  await write(root, '.standards/user-styles/developer/tony.md', 'Do not echo this content');
  await write(root, '.standards/user-styles/developer/nested/alice.md', 'Nested');
  await symlink('tony.md', path.join(root, '.standards/user-styles/developer/alias.md'));
  let result = await discoverInvocation(root, 'developer');
  assert.deepEqual(result.userStyles.options.map((item) => item.id), ['alias', 'tony']);
  assert.equal(result.userStyles.selected.value, 'missing');
  assert.equal(result.userStyles.selected.status, 'invalid');
  assert.equal(result.userStyles.locked, 'true');
  await record(root, 'DEVELOPMENT', { ...plan, 'User Style': 'tony.md' });
  result = await discoverInvocation(root, 'developer');
  assert.equal(result.userStyles.selected.value, 'tony');
  await write(root, '.standards/user-styles/developer/tony.md.md', 'Ambiguous filename');
  assert.equal((await discoverInvocation(root, 'developer')).userStyles.selected.status, 'invalid');
}));

test('escaping mode, rule, and style symlinks are rejected', () => fixture(async (root) => {
  await write(root, 'outside.md', sourceBlock(mode));
  await symlink(path.join(root, 'outside.md'), path.join(root, skill('developer'), 'modes/extra.md'));
  let result = await discoverInvocation(root, 'developer');
  assert.equal(result.catalogStatus, 'unavailable');
  diagnostic(result, /symlink escaping/);
  await rm(path.join(root, skill('developer'), 'modes/extra.md'));
  await symlink(path.join(root, 'outside.md'), path.join(root, skill('developer'), 'rules.md'));
  await editMetadata(root, skill('developer') + '/SKILL.md', (value) => { value.groups[0].selectionRules = 'rules.md'; });
  assert.equal((await discoverInvocation(root, 'developer')).catalogStatus, 'unavailable');
  await mkdir(path.join(root, '.standards/user-styles/navigator'), { recursive: true });
  await write(root, '.standards/user-styles/navigator/tony.md', 'Available style');
  await symlink(path.join(root, 'outside.md'), path.join(root, '.standards/user-styles/navigator/unsafe.md'));
  result = await discoverInvocation(root, 'navigator');
  assert.equal(result.userStyles.status, 'unknown');
  assert.deepEqual(result.userStyles.options.map(({ id, selector }) => ({ id, selector })), [{ id: 'tony', selector: null }]);
  assert.equal(result.userStyles.options[0].selectorReason, 'selection unverified');
}));

test('unreadable style directories are unknown, not empty', { skip: process.getuid?.() === 0 }, () => fixture(async (root) => {
  await write(root, '.standards/user-styles/navigator/tony.md', 'Style');
  const directory = path.join(root, '.standards/user-styles/navigator');
  try {
    await chmod(directory, 0);
    const result = await discoverInvocation(root, 'navigator');
    assert.equal(result.userStyles.status, 'unknown');
    assert.equal(result.complete, false);
  } finally { await chmod(directory, 0o700); }
}));

test('parser ignores fenced examples and rejects malformed, repeated, missing and unsupported blocks', () => {
  const valid = sourceBlock(mode);
  assert.deepEqual(parseInvocationBlock(fence + tick + 'markdown\n' + valid + fence + tick + '\n\n' + valid, validate), mode);
  assert.deepEqual(parseInvocationBlock(fence + tick + 'text <!-- example -->\n' + valid + fence + tick + '\n\n' + valid, validate), mode);
  assert.deepEqual(parseInvocationBlock(valid.replace(/\n/g, '\r\n'), validate), mode);
  for (const text of [valid + '\n' + valid, '# Missing\n', marker + '\n' + fence + 'json\n{bad}\n' + fence,
    sourceBlock({ ...mode, schemaVersion: 2 }), sourceBlock({ ...mode, invented: true })]) {
    assert.throws(() => parseInvocationBlock(text, validate));
  }
  for (const invalid of [
    { ...mode, selection: 'state' }, { ...mode, selection: 'assessment', requiresAssessment: true },
    { ...mode, id: 'BAD\n' }, { ...mode, when: { all: [] } }, { ...mode, when: { fact: { kind: 'conversation' }, equals: 'x' } },
  ]) assert.ok(validate(invalid).length);
  assert.throws(() => compileInvocationSchema({ ...schema, inventedKeyword: true }), /Unsupported/);
});

for (const [label, mutate] of [
  ['duplicate groups', (value) => { value.groups.push(value.groups[0]); }],
  ['missing default option', (value) => { value.groups[0].defaultForNew = 'ABSENT'; }],
  ['missing rule anchor', (value) => { value.groups[0].selectionRules = 'SKILL.md#absent'; }],
  ['unsafe rule path', (value) => { value.groups[0].selectionRules = '../outside.md'; }],
  ['unbound mode group', (value) => { value.groups[0].id = 'changed'; }],
]) {
  test('catalog rejects ' + label, () => fixture(async (root) => {
    await editMetadata(root, skill('developer') + '/SKILL.md', mutate);
    const result = await discoverInvocation(root, 'developer');
    assert.equal(result.catalogStatus, 'unavailable');
    assert.deepEqual(result.groups, []);
  }));
}

test('duplicate IDs and unannotated modes invalidate the whole catalog', () => fixture(async (root) => {
  await write(root, skill('developer') + '/modes/extra.md', sourceBlock({ ...mode, id: 'AUTONOMOUS' }));
  assert.equal((await discoverInvocation(root, 'developer')).catalogStatus, 'unavailable');
  await write(root, skill('developer') + '/modes/extra.md', '# Missing metadata\n');
  assert.equal((await discoverInvocation(root, 'developer')).catalogStatus, 'unavailable');
}));

test('installed CLI works from another cwd, emits deterministic JSON, and accepts no mutating flags', () => fixture(async (root) => {
  const file = path.join(root, '.standards/bin/invocation.mjs');
  const before = await snapshot(root);
  const args = [file, 'navigator', '--json'];
  const first = await exec(process.execPath, args, { cwd: os.tmpdir() });
  const second = await exec(process.execPath, args, { cwd: os.tmpdir() });
  assert.equal(first.stdout, second.stdout);
  assert.equal(JSON.parse(first.stdout).complete, true);
  assert.deepEqual(await snapshot(root), before);
  assert.match((await exec(process.execPath, [file, '--help'])).stdout, /Usage:/);
  assert.match((await exec(process.execPath, [file, 'navigator', '--project', root])).stdout, /GRILL_ME/);
  await assert.rejects(exec(process.execPath, [file, 'navigator', '--write']), (error) => error.code === 1 && /Usage:/.test(error.stderr));
  await assert.rejects(exec(process.execPath, [file, '../escape', '--json']), (error) =>
    error.code === 1 && JSON.parse(error.stdout).catalogStatus === 'unavailable');
}));

test('a lone assessment candidate is still assessed, and invalid mode facts stay unknown', () => fixture(async (root) => {
  await state(root, { WorkflowState: 'TESTING' });
  await record(root, 'VERIFICATION', { Mode: 'REVERIFY', 'User Style': 'NONE' });
  await rm(path.join(root, skill('tester'), 'modes/verify.md'));
  assert.equal((await discoverInvocation(root, 'tester')).groups[0].selected.status, 'assessment');
  await state(root);
  await record(root, 'DEVELOPMENT', { ...plan, Mode: 'OBSOLETE' });
  await editMetadata(root, skill('developer') + '/modes/autonomous.md', (value) => {
    value.when = { fact: { kind: 'record', artifact: 'DEVELOPMENT', field: 'Mode' }, equals: 'AUTONOMOUS' };
  });
  const result = await discoverInvocation(root, 'developer');
  assert.equal(result.groups[0].options.find((item) => item.id === 'AUTONOMOUS').condition, 'unknown');
  assert.equal(result.groups[0].selected.status, 'invalid');
}));

test('group locks and factual conditions restrict user choices without selecting defaults', () => fixture(async (root) => {
  await state(root);
  await record(root, 'DEVELOPMENT', { ...plan, 'User Style Locked': 'true' });
  await editMetadata(root, skill('developer') + '/SKILL.md', (value) => {
    value.groups[0].lockedWhen = value.userStyles.lockedWhen;
  });
  let result = await discoverInvocation(root, 'developer');
  assert.ok(result.groups[0].options.every((item) => item.selectability === 'locked'));
  assert.equal(result.groups[0].selected.value, 'STEPWISE');
  await editMetadata(root, skill('developer') + '/modes/autonomous.md', (value) => {
    value.when = { fact: { kind: 'workflow', field: 'CycleMode' }, equals: 'DOCUMENTATION' };
  });
  result = await discoverInvocation(root, 'developer');
  assert.equal(result.groups[0].options.find((item) => item.id === 'AUTONOMOUS').selectability, 'unavailable');
}));

test('free-text target details are retained without treating a vertical bar as an enum placeholder', () => fixture(async (root) => {
  await state(root, { WorkflowState: 'DOCUMENTING' });
  await record(root, 'DOCUMENTATION', { Collaboration: 'GUIDED', Target: 'VERTICAL_SLICE',
    'Target Detail': 'input A | B', 'User Style': 'NONE' });
  const result = await discoverInvocation(root, 'documenter');
  assert.equal(result.complete, true, JSON.stringify(result.diagnostics));
  assert.equal(group(result, 'target').savedArgument.value, 'input A | B');
}));

test('state-controlled groups cannot advertise their user options as freely selectable', () => fixture(async (root) => {
  await state(root, { CycleMode: 'DOCUMENTATION', CompletionPolicy: 'NONE', WorkflowState: 'ARCHITECTING' });
  await write(root, skill('architect') + '/modes/extra.md', sourceBlock({ ...mode, group: 'design-mode' }));
  const result = await discoverInvocation(root, 'architect');
  assert.equal(result.groups[0].selected.value, 'DOCUMENTATION');
  assert.equal(result.groups[0].options.find((item) => item.id === 'EXTRA').selectability, 'state-controlled');
}));

test('a missing mode directory, reserved style file, and directory symlink remain visible errors', () => fixture(async (root) => {
  await rm(path.join(root, skill('developer'), 'modes'), { recursive: true });
  assert.equal((await discoverInvocation(root, 'developer')).catalogStatus, 'unavailable');
  await write(root, '.standards/user-styles/navigator/NONE.md', 'Reserved');
  let result = await discoverInvocation(root, 'navigator');
  assert.equal(result.userStyles.status, 'unknown');
  assert.deepEqual(result.userStyles.options, []);
  await rm(path.join(root, '.standards/user-styles/navigator'), { recursive: true });
  await mkdir(path.join(root, 'outside'), { recursive: true });
  await symlink(path.join(root, 'outside'), path.join(root, '.standards/user-styles/navigator'));
  result = await discoverInvocation(root, 'navigator');
  assert.equal(result.userStyles.status, 'unknown');
}));

test('installed Navigator discovery needs neither protocol nor workflow files', () => fixture(async (root) => {
  for (const file of ['PROTOCOL.md', 'STATE.md', 'MODE.md']) await rm(path.join(root, '.standards', file));
  const result = await exec(process.execPath, [path.join(root, '.standards/bin/invocation.mjs'), 'navigator', '--json']);
  assert.equal(JSON.parse(result.stdout).complete, true);
}));

test('unresolved project-mode merges cannot establish a review kind', () => fixture(async (root) => {
  await state(root, { WorkflowState: 'REVIEWING_IMPLEMENTATION' });
  await write(root, '.standards/MODE.md', (await read(root, '.standards/MODE.md')) + '\n<<<<<<< merge conflict\n');
  const result = await discoverInvocation(root, 'reviewer');
  assert.equal(result.groups[0].selected.status, 'unknown');
  diagnostic(result, /MODE.md has merge conflicts/);
}));

test('documentation discovery does not reuse an omitted owner record', () => fixture(async (root) => {
  await state(root, { WorkflowState: 'DOCUMENTING', CycleMode: 'DOCUMENTATION', CompletionPolicy: 'NONE' });
  await record(root, 'DEVELOPMENT', plan);
  const result = await discoverInvocation(root, 'developer');
  assert.equal(result.userStyles.savedValue.status, 'unknown');
  assert.equal(result.userStyles.locked, 'unknown');
  diagnostic(result, /omits this record type/);
}));

test('Navigator option help refreshes its installed catalog without workflow files or preference writes', () => fixture(async (root) => {
  for (const file of ['PROTOCOL.md', 'STATE.md', 'MODE.md']) await rm(path.join(root, '.standards', file));
  await write(root, '.standards/user-styles/navigator/tony.md', 'PRIVATE TONY PREFERENCES');
  const file = path.join(root, '.standards/bin/invocation.mjs');
  const discover = async () => JSON.parse((await exec(process.execPath, [file, 'navigator', '--client', 'codex', '--json'])).stdout);
  const initial = await discover();
  assert.equal(initial.complete, true);
  assert.deepEqual(initial.userStyles.options.map((item) => item.id), ['tony']);
  await write(root, '.standards/user-styles/navigator/alice.md', 'PRIVATE ALICE PREFERENCES');
  await write(root, skill('navigator') + '/modes/map.md',
    sourceBlock({ ...mode, group: 'conversation-mode', id: 'MAP', label: 'Map',
      description: 'Map existing project structure.' }) + '\nUnselected mode procedure.\n');
  const before = await snapshot(root);
  const next = await discover();
  assert.equal(next.complete, true);
  assert.ok(next.groups[0].options.some((option) => option.id === 'MAP' && option.selectability === 'user'));
  assert.deepEqual(next.userStyles.options.map((item) => item.id), ['alice', 'tony']);
  assert.equal(next.groups[0].selected.status, 'conversation');
  assert.equal(next.groups[0].selected.value, null);
  assert.equal(next.userStyles.selected.status, 'conversation');
  assert.equal(next.userStyles.selected.value, null);
  assert.doesNotMatch(JSON.stringify(next), /PRIVATE|Unselected mode procedure/);
  assert.deepEqual(await snapshot(root), before);
}));

test('visible record fields survive inline comments while commented values stay hidden', () => fixture(async (root) => {
  await state(root);
  const file = await record(root, 'DEVELOPMENT', plan);
  const text = (await read(root, file))
    .replace(tick + 'Mode' + tick + ': ' + tick + 'STEPWISE' + tick,
      tick + 'Mode' + tick + ': ' + tick + 'STEPWISE' + tick + ' <!-- retained collaboration -->')
    .replace(tick + 'User Style Locked' + tick + ': ' + tick + 'false' + tick,
      tick + 'User Style Locked' + tick + ': ' + tick + 'false' + tick
        + ' <!-- historical example: ' + tick + 'User Style Locked' + tick + ': ' + tick + 'true' + tick + ' -->');
  await write(root, file, text);
  const result = await discoverInvocation(root, 'developer');
  assert.equal(result.complete, true, JSON.stringify(result.diagnostics));
  assert.equal(result.groups[0].selected.value, 'STEPWISE');
  assert.equal(result.userStyles.locked, 'false');
}));

test('comment-like text in a code-span style identifier remains literal', () => fixture(async (root) => {
  await state(root);
  const id = 'tony<!--literal-->';
  await write(root, '.standards/user-styles/developer/' + id + '.md', 'Style preferences');
  await record(root, 'DEVELOPMENT', { ...plan, 'User Style': id });
  const result = await discoverInvocation(root, 'developer');
  assert.equal(result.complete, true, JSON.stringify(result.diagnostics));
  assert.equal(result.userStyles.selected.value, id);
}));

test('overlapping style names provide an unambiguous invocation without changing the saved selection', () => fixture(async (root) => {
  await state(root);
  await write(root, '.standards/user-styles/developer/tony.md', 'First style');
  await write(root, '.standards/user-styles/developer/tony.md.md', 'Second style');
  await record(root, 'DEVELOPMENT', { ...plan, 'User Style': 'tony.md.md' });
  const before = await snapshot(root);
  const result = await discoverInvocation(root, 'developer');
  assert.equal(result.complete, true, JSON.stringify(result.diagnostics));
  assert.deepEqual(result.userStyles.options.map(({ id, selector }) => ({ id, selector })), [
    { id: 'tony', selector: 'tony' },
    { id: 'tony.md', selector: 'tony.md.md' },
  ]);
  const summary = (await exec(process.execPath, [path.join(root, '.standards/bin/invocation.mjs'), 'developer', '--client', 'codex'])).stdout;
  assert.match(summary, /tony\.md \(invoke as tony\.md\.md\)/);
  assert.equal(result.userStyles.savedValue.value, 'tony.md.md');
  assert.equal(result.userStyles.selected.value, 'tony.md');
  assert.deepEqual(await snapshot(root), before);
}));

test('styles with no unique accepted name remain inventory information only', () => fixture(async (root) => {
  for (const file of ['tony.md', 'tony.md.md', 'tony.md.md.md']) {
    await write(root, '.standards/user-styles/navigator/' + file, 'Style preferences');
  }
  const result = await discoverInvocation(root, 'navigator');
  assert.equal(result.complete, true);
  assert.deepEqual(result.userStyles.options.map(({ id, selector }) => ({ id, selector })), [
    { id: 'tony', selector: 'tony' },
    { id: 'tony.md', selector: null },
    { id: 'tony.md.md', selector: 'tony.md.md.md' },
  ]);
  const summary = (await exec(process.execPath, [path.join(root, '.standards/bin/invocation.mjs'), 'navigator', '--client', 'codex'])).stdout;
  assert.match(summary, /tony\.md \(ambiguous name\)/);
  assert.equal(result.userStyles.options.find((item) => item.id === 'tony.md').selectorReason, 'ambiguous name');
  assert.equal(result.userStyles.selected.status, 'conversation');
}));

for (const { name, files, input, selector, display } of [
  { name: 'ordinary tony', files: ['tony.md'], input: 'tony.md', selector: 'tony', display: 'tony' },
  { name: 'overlapping names', files: ['tony.md', 'tony.md.md'], input: 'tony.md.md', selector: 'tony.md.md', display: 'tony.md' },
  { name: 'NONE', files: ['tony.md', 'tony.md.md'], input: 'NONE', selector: 'NONE', display: 'NONE' },
]) {
  test('style selectors survive persistence, approval and resume: ' + name, () => fixture(async (root) => {
    await state(root);
    for (const file of files) await write(root, '.standards/user-styles/developer/' + file, 'Style preferences');
    await record(root, 'DEVELOPMENT', { ...plan, 'User Style': input });
    const selected = await discoverInvocation(root, 'developer');
    assert.equal(selected.complete, true, JSON.stringify(selected.diagnostics));
    assert.equal(selected.userStyles.selected.value, display);
    assert.equal(selected.userStyles.locked, 'false');
    const accepted = input === 'NONE' ? 'NONE'
      : selected.userStyles.options.find((option) => option.id === display).selector;
    assert.equal(accepted, selector);
    // Simulate authoring and approval writes; discovery only reads saved state.
    const file = await record(root, 'DEVELOPMENT', { ...plan, 'User Style': accepted });
    for (const fields of [
      { Status: 'PROPOSED', 'User Style Locked': 'false', Mode: 'STEPWISE' },
      { Status: 'APPROVED', 'User Style Locked': 'true', Mode: 'STEPWISE' },
      { Status: 'IN_PROGRESS', 'User Style Locked': 'true', Mode: 'AUTONOMOUS' },
      { Status: 'PROPOSED', 'User Style Locked': 'true', Mode: 'CODE_WITH_ME' },
    ]) {
      let text = await read(root, file);
      for (const [key, value] of Object.entries(fields)) text = setField(text, key, value);
      await write(root, file, text);
      const before = await snapshot(root);
      const invocation = await exec(process.execPath, [
        path.join(root, '.standards/bin/invocation.mjs'), 'developer', '--client', 'codex', '--json',
      ]);
      const resumed = JSON.parse(invocation.stdout);
      assert.equal(resumed.complete, true, JSON.stringify(resumed.diagnostics));
      assert.equal(resumed.userStyles.savedValue.value, selector);
      assert.equal(resumed.userStyles.selected.value, display);
      assert.equal(resumed.userStyles.locked, fields['User Style Locked']);
      assert.equal(group(resumed, 'collaboration').selected.value, fields.Mode);
      assert.deepEqual(await snapshot(root), before);
    }
  }));
}

test('an overlapping display identifier is invalid as a saved selector even when locked', () => fixture(async (root) => {
  await state(root);
  for (const file of ['tony.md', 'tony.md.md']) await write(root, '.standards/user-styles/developer/' + file, 'Style preferences');
  for (const [status, locked] of [['PROPOSED', 'false'], ['APPROVED', 'true'], ['PROPOSED', 'true']]) {
    await record(root, 'DEVELOPMENT', { ...plan, Status: status, 'User Style': 'tony.md', 'User Style Locked': locked });
    const before = await snapshot(root);
    const result = await discoverInvocation(root, 'developer');
    assert.equal(result.complete, false);
    assert.equal(result.userStyles.savedValue.value, 'tony.md');
    assert.equal(result.userStyles.selected.status, 'invalid');
    assert.equal(result.userStyles.selected.value, 'tony.md');
    assert.equal(result.userStyles.locked, locked);
    diagnostic(result, /does not resolve to exactly one available file/);
    assert.deepEqual(await snapshot(root), before);
  }
}));

test('record selector syntax restrictions follow the binding without restricting conversation styles', () => fixture(async (root) => {
  const persisted = ['developer', 'tester', 'reviewer', 'documenter', 'synchronizer'];
  const conversation = ['navigator', 'scoper', 'architect', 'auditor'];
  for (const role of [...persisted, ...conversation]) {
    for (const file of ['<formal>.md', 'team | compact.md']) {
      await write(root, '.standards/user-styles/' + role + '/' + file, 'PRIVATE STYLE CONTENT');
    }
    for (const client of ['codex', 'claude']) {
      const result = await discoverInvocation(root, role, { client });
      const formal = result.userStyles.options.find((item) => item.id === '<formal>');
      const pipe = result.userStyles.options.find((item) => item.id === 'team | compact');
      assert.equal(formal.selector, persisted.includes(role) ? '<formal>.md' : '<formal>', role + '/' + client);
      assert.equal(formal.selectorReason, null);
      assert.equal(pipe.selector, persisted.includes(role) ? null : 'team | compact', role + '/' + client);
      assert.equal(pipe.selectorReason, persisted.includes(role) ? 'no record-compatible name' : null);
      assert.doesNotMatch(JSON.stringify(result), /PRIVATE STYLE CONTENT/);
    }
  }
}, ['codex', 'claude']));
