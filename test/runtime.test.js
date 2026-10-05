import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { chmod, mkdtemp, readFile, readdir, realpath, rm, stat, symlink, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { installProject } from '../lib/install.js';
import { slugFor } from '../runtime/cycle.mjs';
import { stopMessage } from '../runtime/hook.mjs';
import { runCheck } from '../runtime/check.mjs';
import { resetProject } from '../lib/reset.js';
import { uninstallProject } from '../lib/uninstaller.js';
import { parseState } from '../runtime/lib/state.mjs';
import { fixedPath, provenanceBlock, recordSection } from '../runtime/lib/records.mjs';

const read = (root, relative) => readFile(path.join(root, relative), 'utf8');
async function write(root, relative, value) {
  await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
  await writeFile(path.join(root, relative), value);
}

function run(command, args, cwd) {
  return new Promise((resolve) => {
    execFile(command, args, { cwd }, (error, stdout, stderr) => {
      resolve({ code: error ? error.code : 0, stdout, stderr });
    });
  });
}

const tool = (root, name, ...args) => run(process.execPath, [path.join(root, '.standards/bin', `${name}.mjs`), ...args], root);
// Automatic maintenance is off: after a commit, git may repack in a detached
// process, which races the removal of the temporary project.
const git = (root, ...args) => run('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com',
  '-c', 'maintenance.auto=false', '-c', 'gc.auto=0', ...args], root);

async function commit(root) {
  await git(root, 'add', '-A');
  await git(root, 'commit', '-q', '-m', 'snapshot');
}

// An installed project in a fresh temporary folder; brownfield by default.
async function project(body, { withGit = false, projectMode = 'BROWNFIELD', clients = ['claude'] } = {}) {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'standards-runtime-test-')));
  try {
    if (projectMode === 'BROWNFIELD') await write(root, 'app.py', 'print("hi")\n');
    await installProject({ projectRoot: root, clients });
    if (withGit) {
      await git(root, 'init', '-q', '-b', 'main');
      await commit(root);
    }
    await body(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function editState(root, edit) {
  await write(root, '.standards/STATE.md', edit(await read(root, '.standards/STATE.md')));
}

async function editStateFields(root, fields) {
  await editState(root, (text) => Object.entries(fields)
    .reduce((current, [name, value]) => setField(current, name, value), text));
}

const setField = (text, name, value) => text.replace(new RegExp('`' + name + '`:(\\s*)`[^`]*`'), `\`${name}\`:$1\`${value}\``);

// Generate an ID with the tool and record it as the active cycle.
async function startCycle(root, { state = 'SCOPING', mode = 'STANDARD', policy = 'FULL_DELIVERABLE' } = {}) {
  const { stdout, code } = await tool(root, 'cycle', 'new', '--request', 'Add user search');
  assert.equal(code, 0);
  const id = stdout.trim();
  await editState(root, (text) => [['Id', id], ['Request', 'Add user search'], ['CycleMode', mode],
    ['CompletionPolicy', mode === 'STANDARD' ? policy : 'NONE'], ['WorkflowState', state]]
    .reduce((current, [name, value]) => setField(current, name, value), text));
  return id;
}

// Create a record the way a role does, with no user style selected.
async function init(root, ...args) {
  const result = await tool(root, 'artifact', 'init', ...args);
  assert.equal(result.code, 0, result.stderr);
  const relative = result.stdout.trim();
  await write(root, relative, (await read(root, relative)).replace('`User Style`: `NONE | <identifier>`', '`User Style`: `NONE`'));
  return relative;
}

async function fillHeader(root, relative, values) {
  let text = await read(root, relative);
  for (const [name, value] of Object.entries(values)) text = setField(text, name, value);
  await write(root, relative, text);
}

async function check(root) {
  const result = await tool(root, 'check', '--json');
  return { code: result.code, ...JSON.parse(result.stdout) };
}

const messages = (result) => result.problems.map(({ file, message }) => `${file}: ${message}`);

function hasProblem(result, pattern) {
  assert.ok(messages(result).some((line) => pattern.test(line)),
    `expected a problem matching ${pattern}, got:\n${messages(result).join('\n') || '(none)'}`);
}

// A documentation cycle establishes its own evidence without fabricating any
// current-cycle Developer, Tester, or implementation Reviewer record.
async function documentationCycle(root, through = 'AWAITING_USER_SIGNOFF') {
  const id = await startCycle(root, { state: 'AUDITING', mode: 'DOCUMENTATION' });
  await editStateFields(root, { Request: 'Document the existing greeting command.' });
  await cleanBoundary(root);
  if (through === 'AUDITING') return { id };
  await write(root, '.standards/CONTEXT.md', '# Project Context\n\napp.py prints a greeting.\n');
  await moveCycle(root, 'SCOPING');
  await cleanBoundary(root);
  const scope = await init(root, 'SCOPE');
  await write(root, scope, `${await read(root, scope)}\n# Greeting guide\n\n`
    + '- `AC-001`: Explain the command and its existing output.\n'
    + '- `AC-002`: Explain the audience and limits.\n'
    + '\n## Retired Acceptance Identifiers\n\n- `AC-003`: Retired old guide title.\n');
  await editStateFields(root, { Scope: scope });
  if (through === 'SCOPING') return { id, scope };
  await moveCycle(root, 'ARCHITECTING');
  await cleanBoundary(root);
  const spec = await init(root, 'ARCHITECTURE');
  await write(root, spec, `${await read(root, spec)}\n# Existing contracts\n\n## Acceptance Coverage\n\n`
    + '- AC-001: app.py writes the greeting to stdout.\n'
    + '- AC-002: No architectural impact; Documenter explains the audience and limits.\n');
  await editStateFields(root, { Architecture: spec });
  if (through === 'ARCHITECTING') return { id, scope, spec };
  const records = {};
  for (const [state, type, kind] of [
    ['DOCUMENTING', 'DOCUMENTATION'], ['REVIEWING_FINAL', 'REVIEW', 'FINAL_DELIVERABLE'],
    ['SYNCHRONIZING', 'SYNCHRONIZATION'],
  ]) {
    await moveCycle(root, state);
    await cleanBoundary(root);
    const file = await init(root, type, ...(kind ? ['--kind', kind] : []));
    await fillHeader(root, file, { Status: 'COMPLETE', 'User Style': 'NONE', Collaboration: 'AUTONOMOUS',
      Target: 'ACTIVE_CHANGE', 'Target Detail': 'greeting guide' });
    await write(root, file, `${await read(root, file)}\n## Acceptance Evidence\n\n`
      + 'AC-001: greeting command and output checked against app.py.\n'
      + 'AC-002: audience and limits checked against the scoped guide.\n');
    records[state] = file;
    await cleanBoundary(root);
    if (through === state) return { id, scope, spec, ...records };
  }
  await moveCycle(root, 'AWAITING_USER_SIGNOFF');
  await cleanBoundary(root);
  return { id, scope, spec, ...records };
}

test('documentation route reaches readiness without implementation records', () => project(async (root) => {
  const cycle = await documentationCycle(root);
  const all = await readdir(path.join(root, '.standards/docs'), { recursive: true });
  assert.equal(all.some((file) => /verification|development|implementation\.md/.test(file)), false);
  const saved = parseState(await read(root, '.standards/STATE.md'));
  assert.equal(saved.active.development, 'NONE');
  assert.equal(saved.active.completionPolicy, 'NONE');
  assert.equal(saved.active.id, cycle.id);
}));

test('documentation lifecycle: an assessed no-change result signs off and starts a fresh cycle', () => project(async (root) => {
  const guide = '# Greeting\n\nRun python3 app.py; it prints hi.\n';
  await write(root, 'docs/usage.md', guide);
  const cycle = await documentationCycle(root);
  for (const file of [cycle.DOCUMENTING, cycle.REVIEWING_FINAL, cycle.SYNCHRONIZING]) {
    await write(root, file, `${await read(root, file)}\nNo-change disposition: docs/usage.md already explains existing behavior; saved content inspected.\n`);
  }
  await cleanBoundary(root);
  const records = await Promise.all([cycle.scope, cycle.spec, cycle.DOCUMENTING, cycle.REVIEWING_FINAL, cycle.SYNCHRONIZING]
    .map(async (file) => [file, await read(root, file)]));
  await moveCycle(root, 'SIGNED_OFF', { kind: 'SIGNOFF', CycleMode: 'UNSET', Reason: 'User explicitly accepted the assessed guide.' });
  await cleanBoundary(root);
  await commit(root);
  const next = await startCycle(root, { state: 'AUDITING', mode: 'DOCUMENTATION' });
  assert.notEqual(next, cycle.id);
  await editStateFields(root, { Kind: 'NEW_CYCLE', From: 'SIGNED_OFF', Scope: 'NONE', Architecture: 'NONE' });
  await cleanBoundary(root);
  assert.equal(await read(root, 'docs/usage.md'), guide);
  for (const [file, text] of records) assert.equal(await read(root, file), text);
  const saved = parseState(await read(root, '.standards/STATE.md'));
  assert.equal(saved.active.completionPolicy, 'NONE');
  assert.equal(saved.active.development, 'NONE');
  assert.equal(saved.recovery.active, false);
}, { withGit: true }));

test('documentation lifecycle: cancellation retains docs and carries source provenance into Auditor reconciliation', () => project(async (root) => {
  const cycle = await documentationCycle(root, 'DOCUMENTING');
  const guide = '# Greeting\n\nA partial guide retained after cancellation.\n';
  await write(root, 'docs/usage.md', guide);
  await moveCycle(root, 'CANCELLED', { kind: 'CANCEL', CycleMode: 'UNSET' });
  await cleanBoundary(root);
  await commit(root);
  const next = await startCycle(root, { state: 'AUDITING', mode: 'DOCUMENTATION' });
  await editStateFields(root, { Kind: 'NEW_CYCLE', From: 'CANCELLED', Scope: 'NONE', Architecture: 'NONE' });
  const reconciliation = `\`BaselineReconciliation\`:\n\n- \`SourceCycle\`: \`${cycle.id}\`\n  \`Request\`: \`Document the existing greeting command.\``;
  await editState(root, (text) => text.replace(/`BaselineReconciliation`:\s*`NONE`/, reconciliation));
  await cleanBoundary(root);
  assert.notEqual(next, cycle.id);
  assert.equal(await read(root, 'docs/usage.md'), guide);
  const saved = parseState(await read(root, '.standards/STATE.md'));
  assert.deepEqual(saved.active.baseline.entries, [{ sourceCycle: cycle.id, request: 'Document the existing greeting command.' }]);
  await editStateFields(root, { CycleMode: 'EXPEDITED', WorkflowState: 'DEVELOPING', Kind: 'NEW_CYCLE' });
  hasProblem(await check(root), /EXPEDITED cycle cannot carry BaselineReconciliation/);
}, { withGit: true }));

test('documentation lifecycle: reinstall retains guided choices; reset and uninstall retain project docs', () => project(async (root) => {
  const cycle = await documentationCycle(root, 'DOCUMENTING');
  const request = 'Standalone Documenter: update docs/usage.md in GUIDED mode using style concise; edit only this file.';
  await write(root, 'docs/usage.md', '# Existing guide\n');
  await write(root, '.standards/user-styles/documenter/concise.md', '# Concise\n\nUse short paragraphs.\n');
  await fillHeader(root, cycle.DOCUMENTING, { Status: 'BLOCKED', Collaboration: 'GUIDED', Target: 'FILE',
    'Target Detail': 'docs/usage.md', 'User Style': 'concise' });
  await editStateFields(root, { Request: request, BlockedOn: 'Apply the saved guided edit to docs/usage.md.' });
  const state = await read(root, '.standards/STATE.md');
  const record = await read(root, cycle.DOCUMENTING);
  await installProject({ projectRoot: root });
  assert.equal(await read(root, '.standards/STATE.md'), state);
  assert.equal(await read(root, cycle.DOCUMENTING), record);
  await cleanBoundary(root);
  await resetProject({ projectRoot: root });
  await cleanBoundary(root);
  const fresh = parseState(await read(root, '.standards/STATE.md'));
  assert.equal(fresh.CycleMode, 'UNSET');
  assert.equal(fresh.active.id, 'UNSET');
  assert.equal(fresh.PendingCycleRequest, 'UNSET');
  await assert.rejects(read(root, cycle.DOCUMENTING), { code: 'ENOENT' });
  assert.equal(await read(root, 'docs/usage.md'), '# Existing guide\n');
  assert.equal(await read(root, '.standards/user-styles/documenter/concise.md'), '# Concise\n\nUse short paragraphs.\n');
  await uninstallProject({ projectRoot: root });
  assert.equal(await read(root, 'docs/usage.md'), '# Existing guide\n');
  assert.equal(await read(root, 'app.py'), 'print("hi")\n');
  await assert.rejects(read(root, '.standards/STATE.md'), { code: 'ENOENT' });
}));

test('documentation routes reject illegal states, skipped forward gates, and direct entry', () => project(async (root) => {
  await documentationCycle(root, 'AUDITING');
  const initial = await read(root, '.standards/STATE.md');
  for (const state of ['DEVELOPING', 'TESTING', 'REVIEWING_IMPLEMENTATION']) {
    await write(root, '.standards/STATE.md', setField(initial, 'WorkflowState', state));
    hasProblem(await check(root), new RegExp(`${state} is not part of a DOCUMENTATION cycle`));
  }
  await write(root, '.standards/STATE.md', setField(initial, 'WorkflowState', 'DOCUMENTING'));
  hasProblem(await check(root), /starts in AUDITING/);
  await write(root, '.standards/STATE.md', initial);
  await moveCycle(root, 'ARCHITECTING');
  hasProblem(await check(root), /AUDITING -> ARCHITECTING skips/);
}));

test('documentation mode rejects standard completion policies and implementation scheduling', () => project(async (root) => {
  await documentationCycle(root, 'AUDITING');
  const initial = await read(root, '.standards/STATE.md');
  for (const policy of ['FULL_DELIVERABLE', 'IMPLEMENTATION_REVIEWED']) {
    await write(root, '.standards/STATE.md', setField(initial, 'CompletionPolicy', policy));
    hasProblem(await check(root), /CompletionPolicy .* is not valid with CycleMode DOCUMENTATION/);
  }
  for (const [field, value] of [['Development', 'docs/plan.md'], ['PendingVerificationCadence', 'INCREMENTAL'], ['PromotionReason', 'Need tests']]) {
    await write(root, '.standards/STATE.md', setField(initial, field, value));
    hasProblem(await check(root), new RegExp(`DOCUMENTATION cycle keeps Active Work\\.${field} NONE`));
  }
  await write(root, '.standards/STATE.md', setField(initial, 'Kind', 'CHECKPOINT'));
  hasProblem(await check(root), /CHECKPOINT requires a STANDARD/);
}));

test('greenfield cannot request or activate documentation mode', () => project(async (root) => {
  await editStateFields(root, { PendingCycleMode: 'DOCUMENTATION' });
  hasProblem(await check(root), /GREENFIELD project cannot use DOCUMENTATION/);
  await editStateFields(root, { PendingCycleMode: 'UNSET' });
  await startCycle(root, { state: 'AUDITING', mode: 'DOCUMENTATION' });
  hasProblem(await check(root), /GREENFIELD project cannot use DOCUMENTATION/);
}, { projectMode: 'GREENFIELD' }));

test('documentation readiness requires context, scope, architecture, and every included record', () => project(async (root) => {
  const cycle = await documentationCycle(root);
  for (const file of ['.standards/CONTEXT.md', cycle.scope, cycle.spec,
    cycle.DOCUMENTING, cycle.REVIEWING_FINAL, cycle.SYNCHRONIZING]) {
    const text = await read(root, file);
    await rm(path.join(root, file));
    assert.ok((await check(root)).problems.some((problem) => problem.file === file || problem.message.includes(file)), file);
    await write(root, file, text);
  }
  for (const field of ['Scope', 'Architecture']) {
    await editStateFields(root, { [field]: 'NONE' });
    hasProblem(await check(root), new RegExp(`Active Work\\.${field} is NONE`));
    await editStateFields(root, { [field]: field === 'Scope' ? cycle.scope : cycle.spec });
  }
  await cleanBoundary(root);
}));

test('documentation forward gates require complete included records', () => project(async (root) => {
  const cycle = await documentationCycle(root);
  const saved = await read(root, '.standards/STATE.md');
  for (const [owner, next, file] of [
    ['DOCUMENTING', 'REVIEWING_FINAL', cycle.DOCUMENTING],
    ['REVIEWING_FINAL', 'SYNCHRONIZING', cycle.REVIEWING_FINAL],
    ['SYNCHRONIZING', 'AWAITING_USER_SIGNOFF', cycle.SYNCHRONIZING],
  ]) {
    await write(root, '.standards/STATE.md', setField(setField(saved, 'WorkflowState', next), 'From', owner));
    for (const status of ['IN_PROGRESS', 'BLOCKED']) {
      await fillHeader(root, file, { Status: status });
      hasProblem(await check(root), new RegExp(`must be COMPLETE once the cycle has passed ${owner}`));
    }
    await fillHeader(root, file, { Status: 'COMPLETE' });
    await cleanBoundary(root);
  }
}));

test('documentation acceptance coverage is checked by each included evidence owner and after handoff', () => project(async (root) => {
  const cycle = await documentationCycle(root);
  const saved = await read(root, '.standards/STATE.md');
  for (const [previous, owner, next, file] of [
    ['ARCHITECTING', 'DOCUMENTING', 'REVIEWING_FINAL', cycle.DOCUMENTING],
    ['DOCUMENTING', 'REVIEWING_FINAL', 'SYNCHRONIZING', cycle.REVIEWING_FINAL],
    ['REVIEWING_FINAL', 'SYNCHRONIZING', 'AWAITING_USER_SIGNOFF', cycle.SYNCHRONIZING],
  ]) {
    const complete = await read(root, file);
    await write(root, file, complete.replace('AC-002: audience and limits checked against the scoped guide.', 'Audience evidence missing.')
      + '\n## Previous Cycles\n\nAC-002: historical mention is not current evidence.\n');
    await write(root, '.standards/STATE.md', setField(setField(saved, 'WorkflowState', owner), 'From', previous));
    hasProblem(await check(root), /is COMPLETE but does not account for AC-002/);
    await write(root, '.standards/STATE.md', setField(setField(saved, 'WorkflowState', next), 'From', owner));
    const hook = await runCheck(root, { atTurnEnd: true });
    hasProblem(hook, /is COMPLETE but does not account for AC-002/);
    await write(root, file, complete);
  }
}));

test('documentation acceptance preserves identity and demands architecture coverage', () => project(async (root) => {
  const cycle = await documentationCycle(root);
  const spec = await read(root, cycle.spec);
  await write(root, cycle.spec, spec.replace('- AC-002: No architectural impact; Documenter explains the audience and limits.', 'No other coverage.'));
  hasProblem(await check(root), /does not account for AC-002.*design coverage/);
  await write(root, cycle.spec, spec);
  const scope = await read(root, cycle.scope);
  for (const [append, pattern] of [
    ['\n- AC-001: Duplicate.\n', /AC-001 is defined more than once/],
    ['\n- AC-003: Current and retired.\n', /AC-003 is both current and retired/],
  ]) {
    await write(root, cycle.scope, scope.replace('## Retired Acceptance Identifiers', `${append}\n## Retired Acceptance Identifiers`));
    hasProblem(await check(root), pattern);
  }
  await write(root, cycle.scope, scope.replaceAll('AC-001', 'ZZ-001').replaceAll('AC-002', 'ZZ-002'));
  hasProblem(await check(root), /needs current acceptance conditions/);
  await write(root, cycle.scope, scope);
  await write(root, cycle.DOCUMENTING, `${await read(root, cycle.DOCUMENTING)}\nAC-999: Undefined claim.\n`);
  hasProblem(await check(root), /AC-999.*not defined in the scope/);
}));

test('documentation readiness rejects substituted records and unresolved baseline or blockers', () => project(async (root) => {
  const cycle = await documentationCycle(root);
  const review = await read(root, cycle.REVIEWING_FINAL);
  await write(root, cycle.REVIEWING_FINAL, review.replaceAll('FINAL_DELIVERABLE', 'IMPLEMENTATION'));
  hasProblem(await check(root), /must hold.*REVIEW FINAL_DELIVERABLE.*holds REVIEW IMPLEMENTATION/);
  await write(root, cycle.REVIEWING_FINAL, review);
  const documentation = await read(root, cycle.DOCUMENTING);
  await write(root, cycle.DOCUMENTING, documentation.replace(/^<!--[\s\S]*?-->\s*/, ''));
  hasProblem(await check(root), /does not start with a STANDARDS provenance block.*DOCUMENTATION record/);
  await write(root, cycle.DOCUMENTING, documentation.replaceAll(cycle.id, 'old-guide-20261001T120000Z-1234abcd'));
  hasProblem(await check(root), /holds a DOCUMENTATION record for cycle.*not this cycle/);
  await write(root, cycle.DOCUMENTING, documentation);
  await editState(root, (text) => text.replace('`BaselineReconciliation`: `NONE`',
    '`BaselineReconciliation`:\n\n- `SourceCycle`: `old-work-20261001T120000Z-1234abcd`\n  `Request`: `Old work.`'));
  hasProblem(await check(root), /DOCUMENTATION cycle cannot await sign-off while BaselineReconciliation is unresolved/);
  await editStateFields(root, { BlockedOn: 'Unresolved audience question.' });
  hasProblem(await check(root), /AWAITING_USER_SIGNOFF requires Active Work.BlockedOn NONE/);
}));

test('documentation entry handoffs cannot bypass Auditor or carry failure routing', () => project(async (root) => {
  await documentationCycle(root);
  const readiness = await read(root, '.standards/STATE.md');
  // These records otherwise satisfy readiness, isolating entry validation.
  for (const from of ['SIGNED_OFF', 'CANCELLED']) {
    await editStateFields(root, { Kind: 'NEW_CYCLE', From: from });
    hasProblem(await check(root), /DOCUMENTATION cycle starts in AUDITING/);
    await write(root, '.standards/STATE.md', readiness);
  }
  await editStateFields(root, { WorkflowState: 'AUDITING', Kind: 'INITIAL', From: 'SCOPING' });
  hasProblem(await check(root), /DOCUMENTATION INITIAL handoff requires From NONE/);
  await editStateFields(root, { Kind: 'NEW_CYCLE', From: 'SCOPING' });
  hasProblem(await check(root), /DOCUMENTATION NEW_CYCLE handoff requires From SIGNED_OFF or CANCELLED/);
  for (const kind of ['INITIAL', 'NEW_CYCLE']) {
    await editStateFields(root, { Kind: kind, From: kind === 'INITIAL' ? 'NONE' : 'SIGNED_OFF', FailureType: 'DOCUMENTATION' });
    hasProblem(await check(root), /DOCUMENTATION .* handoff requires FailureType NONE/);
  }
  await write(root, '.standards/STATE.md', readiness);
  await editStateFields(root, { FailureType: 'DOCUMENTATION' });
  hasProblem(await check(root), /DOCUMENTATION FORWARD handoff requires FailureType NONE/);
}));

test('documentation can start a fresh Auditor-first cycle after either terminal state', () => project(async (root) => {
  await documentationCycle(root);
  for (const terminal of ['SIGNED_OFF', 'CANCELLED']) {
    await editStateFields(root, { WorkflowState: terminal, CycleMode: 'UNSET',
      Kind: terminal === 'SIGNED_OFF' ? 'SIGNOFF' : 'CANCEL', From: 'AWAITING_USER_SIGNOFF' });
    await cleanBoundary(root);
    await startCycle(root, { state: 'AUDITING', mode: 'DOCUMENTATION' });
    await editStateFields(root, { Kind: 'NEW_CYCLE', From: terminal, Scope: 'NONE', Architecture: 'NONE' });
    await cleanBoundary(root);
  }
}));

test('documentation acceptance validates references in a reused unmarked project design', () => project(async (root) => {
  const cycle = await documentationCycle(root);
  const canonical = 'docs/existing-design.md';
  const design = (await read(root, cycle.spec)).replace(/^<!--[\s\S]*?-->\s*/, '');
  const history = '\n## Previous Cycles\n\n- AC-900: Coverage from a different scope document.\n';
  await write(root, canonical, `${design}${history}`);
  await rm(path.join(root, cycle.spec));
  await editStateFields(root, { Architecture: canonical });
  await cleanBoundary(root);
  await write(root, canonical, `${design}\n- AC-999: An invented requirement.\n${history}`);
  hasProblem(await check(root), /existing-design\.md: mentions AC-999, which is not defined in the scope/);
}));

async function documentationFrames(root, frames) {
  await editState(root, (text) => text.replace(/## Recovery[\s\S]*?(?=## Outstanding Obligations)/,
    `## Recovery\n\n\`Active\`: \`${frames.length > 0}\`\n\n`
    + frames.map((frame, i) => frameText(frame).replace('### Frame 1', `### Frame ${i + 1}`)).join('\n\n') + '\n\n'));
}

test('documentation same-state failures and rework still require the correct owner', () => project(async (root) => {
  await documentationCycle(root);
  const owners = [['AUDITING', 'PROJECT_CONTEXT'], ['SCOPING', 'SCOPING'],
    ['ARCHITECTING', 'ARCHITECTURE'], ['DOCUMENTING', 'DOCUMENTATION'],
    ['REVIEWING_FINAL', 'REVIEW'], ['SYNCHRONIZING', 'SYNCHRONIZATION']];
  for (const kind of ['FAILURE', 'USER_REWORK']) {
    for (const [index, [owner, type]] of owners.entries()) {
      await editStateFields(root, { WorkflowState: owner, Kind: kind, From: owner, FailureType: type });
      // A local correction needs no frame, but it still belongs to this role.
      await cleanBoundary(root);
      await editStateFields(root, { FailureType: owners[(index + 1) % owners.length][1] });
      for (const atTurnEnd of [false, true]) {
        hasProblem(await runCheck(root, { atTurnEnd }), /routes to .*not /);
      }
    }
    await editStateFields(root, { WorkflowState: 'AWAITING_USER_SIGNOFF', Kind: kind,
      From: 'AWAITING_USER_SIGNOFF', FailureType: 'DOCUMENTATION' });
    for (const atTurnEnd of [false, true]) {
      hasProblem(await runCheck(root, { atTurnEnd }), /routes to DOCUMENTING, not AWAITING_USER_SIGNOFF/);
    }
  }
}));

test('documentation recovery validates every saved frame against the included owners and reruns', () => project(async (root) => {
  await documentationCycle(root);
  const ready = await read(root, '.standards/STATE.md');
  for (const [owner, type] of [['AUDITING', 'PROJECT_CONTEXT'], ['SCOPING', 'SCOPING'],
    ['ARCHITECTING', 'ARCHITECTURE'], ['DOCUMENTING', 'DOCUMENTATION'], ['REVIEWING_FINAL', 'REVIEW'], ['SYNCHRONIZING', 'SYNCHRONIZATION']]) {
    await documentationFrames(root, [{ From: 'AWAITING_USER_SIGNOFF', Owner: owner, FailureType: type, ResumeAt: 'AWAITING_USER_SIGNOFF' }]);
    await editStateFields(root, { WorkflowState: owner, Kind: 'FAILURE', From: 'AWAITING_USER_SIGNOFF', FailureType: type });
    await cleanBoundary(root);
    await write(root, '.standards/STATE.md', ready);
  }
  for (const [fields, expected] of [
    [{ From: 'TESTING', ResumeAt: 'TESTING' }, /From must be an included DOCUMENTATION state/],
    [{ Owner: 'DEVELOPING', FailureType: 'IMPLEMENTATION' }, /Owner must be an included DOCUMENTATION role/],
    [{ Owner: 'REVIEWING_IMPLEMENTATION', FailureType: 'REVIEW' }, /REVIEW cannot target this owner in DOCUMENTATION/],
    [{ RerunThrough: 'TESTING' }, /RerunThrough must be a downstream included DOCUMENTATION role/],
    [{ RerunThrough: 'AWAITING_USER_SIGNOFF' }, /RerunThrough must be a downstream included DOCUMENTATION role/],
    [{ RerunThrough: 'AUDITING' }, /RerunThrough must be a downstream included DOCUMENTATION role/],
    [{ From: 'AUDITING', ResumeAt: 'AUDITING' }, /same-state DOCUMENTATION correction does not push a recovery frame/],
  ]) {
    await documentationFrames(root, [{ From: 'REVIEWING_FINAL', Owner: 'AUDITING', FailureType: 'PROJECT_CONTEXT', ResumeAt: 'REVIEWING_FINAL', ...fields }]);
    await editStateFields(root, { WorkflowState: fields.Owner ?? 'AUDITING', Kind: 'FAILURE', From: fields.From ?? 'REVIEWING_FINAL', FailureType: fields.FailureType ?? 'PROJECT_CONTEXT' });
    hasProblem(await check(root), expected);
    await write(root, '.standards/STATE.md', ready);
  }
}));

test('documentation forbids fabricated implementation records but permits prior-cycle supporting records', () => project(async (root) => {
  const { id } = await documentationCycle(root, 'AUDITING');
  for (const [type, kind] of [['DEVELOPMENT'], ['VERIFICATION'], ['REVIEW', 'IMPLEMENTATION']]) {
    const result = await tool(root, 'artifact', 'init', type, ...(kind ? ['--kind', kind] : []));
    assert.equal(result.code, 1);
    assert.match(result.stderr, /DOCUMENTATION omits/);
    const file = fixedPath(type, id, kind);
    await assert.rejects(read(root, file), { code: 'ENOENT' });
    await write(root, file, `${provenanceBlock(type, id, kind)}\n\n# Record\n\n\`Cycle\`: \`${id}\`\n\`Status\`: \`IN_PROGRESS\`\n`);
    hasProblem(await check(root), /current-cycle implementation record cannot be fabricated/);
    await rm(path.join(root, file));
    const previous = 'old-work-20261001T120000Z-1234abcd';
    await write(root, fixedPath(type, previous, kind), `${provenanceBlock(type, previous, kind)}\n\n# Prior supporting evidence\n`);
    await cleanBoundary(root);
  }
}));

test('documentation rejects a gitignored current-cycle development record with Development NONE', () => project(async (root) => {
  const { id } = await documentationCycle(root, 'AUDITING');
  await write(root, '.gitignore', '.standards/docs/\n');
  const file = fixedPath('DEVELOPMENT', id);
  await write(root, file, `${provenanceBlock('DEVELOPMENT', id)}\n\n# Development Plan\n\n`
    + `\`Cycle\`: \`${id}\`\n\`Status\`: \`IN_PROGRESS\`\n`);
  assert.equal((await git(root, 'check-ignore', file)).code, 0);
  assert.equal(parseState(await read(root, '.standards/STATE.md')).active.development, 'NONE');
  hasProblem(await check(root), /current-cycle implementation record cannot be fabricated/);
  hasProblem(await runCheck(root, { atTurnEnd: true }), /current-cycle implementation record cannot be fabricated/);
  await rm(path.join(root, file));
  await cleanBoundary(root);
}, { withGit: true }));

test('documentation omitted-owner decisions preserve work rather than invent promotion or failure routing', () => project(async (root) => {
  await documentationCycle(root, 'DOCUMENTING');
  await editStateFields(root, { BlockedOn: 'The requested example needs a behavior change; revise the documentation scope or explicitly cancel and start an implementation cycle.' });
  await cleanBoundary(root);
  const saved = parseState(await read(root, '.standards/STATE.md'));
  assert.equal(saved.CycleMode, 'DOCUMENTATION');
  assert.equal(saved.active.completionPolicy, 'NONE');
  assert.equal(saved.recovery.active, false);
  for (const type of ['IMPLEMENTATION', 'VERIFICATION']) {
    await editStateFields(root, { Kind: 'FAILURE', From: 'DOCUMENTING', FailureType: type });
    hasProblem(await check(root), /cannot route .* work to an omitted owner/);
  }
  await editStateFields(root, { Kind: 'PROMOTE', WorkflowState: 'AUDITING', PromotionReason: 'Need implementation' });
  hasProblem(await check(root), /cannot be promoted in place/);
}));

test('committed documentation cycles cannot be converted in place', () => project(async (root) => {
  await documentationCycle(root, 'AUDITING');
  await commit(root);
  await editStateFields(root, { CycleMode: 'STANDARD', CompletionPolicy: 'FULL_DELIVERABLE' });
  hasProblem(await check(root), /DOCUMENTATION cycle cannot be converted in place/);
}, { withGit: true }));

test('documentation normal forward gates still hold during recovery', () => project(async (root) => {
  const cycle = await documentationCycle(root);
  const frame = { From: 'AWAITING_USER_SIGNOFF', Owner: 'SCOPING', FailureType: 'SCOPING',
    ResumeAt: 'AWAITING_USER_SIGNOFF', RerunThrough: 'SYNCHRONIZING' };
  await documentationFrames(root, [frame]);
  await editStateFields(root, { WorkflowState: 'REVIEWING_FINAL', Kind: 'FORWARD', From: 'DOCUMENTING' });
  await fillHeader(root, cycle.DOCUMENTING, { Status: 'IN_PROGRESS' });
  hasProblem(await check(root), /must be COMPLETE once the cycle has passed DOCUMENTING/);
  await fillHeader(root, cycle.DOCUMENTING, { Status: 'COMPLETE' });
  await cleanBoundary(root);
  await editStateFields(root, { From: 'ARCHITECTING' });
  hasProblem(await check(root), /ARCHITECTING -> REVIEWING_FINAL skips/);
  await editStateFields(root, { WorkflowState: 'DOCUMENTING', From: 'ARCHITECTING', Architecture: 'NONE' });
  hasProblem(await check(root), /Active Work.Architecture is NONE/);
  await editStateFields(root, { WorkflowState: 'ARCHITECTING', From: 'SCOPING', Architecture: cycle.spec });
  await write(root, cycle.scope, '# Empty scope\n');
  hasProblem(await check(root), /needs current acceptance conditions/);
  await documentationFrames(root, [{ ...frame, Owner: 'ARCHITECTING', FailureType: 'ARCHITECTURE' }]);
  await editStateFields(root, { WorkflowState: 'SCOPING', Kind: 'RESUME', From: 'DOCUMENTING' });
  hasProblem(await check(root), /active DOCUMENTATION rerun must stay between ARCHITECTING and SYNCHRONIZING/);
  await editStateFields(root, { From: 'AWAITING_USER_SIGNOFF' });
  hasProblem(await check(root), /RESUME handoff must come from an included role/);
}));

test('documentation upstream RESUME requires owned artifacts and current acceptance coverage', () => project(async (root) => {
  const cycle = await documentationCycle(root);
  const ready = await read(root, '.standards/STATE.md');
  const outer = { From: 'AWAITING_USER_SIGNOFF', Owner: 'SCOPING', FailureType: 'SCOPING',
    ResumeAt: 'AWAITING_USER_SIGNOFF', RerunThrough: 'SYNCHRONIZING' };
  for (const [from, target, frames, file, pointer, expected] of [
    ['AUDITING', 'ARCHITECTING', [outer], '.standards/CONTEXT.md', null, /requires Auditor-owned context/],
    ['SCOPING', 'AUDITING', [], cycle.scope, 'Scope', /Active Work.Scope is NONE/],
    ['SCOPING', 'ARCHITECTING', [outer], cycle.scope, 'Scope', /Active Work.Scope is NONE/],
    ['ARCHITECTING', 'AUDITING', [], cycle.spec, 'Architecture', /Active Work.Architecture is NONE/],
    ['ARCHITECTING', 'DOCUMENTING', [outer], cycle.spec, 'Architecture', /Active Work.Architecture is NONE/],
  ]) {
    await write(root, '.standards/STATE.md', ready);
    await documentationFrames(root, frames);
    await editStateFields(root, { WorkflowState: target, Kind: 'RESUME', From: from });
    const content = await read(root, file);
    if (pointer) await editStateFields(root, { [pointer]: 'NONE' });
    else await write(root, file, '');
    for (const atTurnEnd of [false, true]) hasProblem(await runCheck(root, { atTurnEnd }), expected);
    if (pointer) {
      await editStateFields(root, { [pointer]: file });
      await write(root, file, content.replaceAll(/AC-00[12]/g, 'missing coverage'));
      for (const atTurnEnd of [false, true]) {
        hasProblem(await runCheck(root, { atTurnEnd }), pointer === 'Scope'
          ? /needs current acceptance conditions/ : /does not account for AC-001/);
      }
    }
    await write(root, file, content);
    await cleanBoundary(root);
  }
}));

test('documentation final-review RESUME requires a full report after a return or nested recovery', () => project(async (root) => {
  const cycle = await documentationCycle(root);
  const report = await read(root, cycle.REVIEWING_FINAL);
  const outer = { From: 'AWAITING_USER_SIGNOFF', Owner: 'SCOPING', FailureType: 'SCOPING',
    ResumeAt: 'AWAITING_USER_SIGNOFF', RerunThrough: 'SYNCHRONIZING' };
  for (const [target, frames] of [['DOCUMENTING', []], ['SYNCHRONIZING', [outer]]]) {
    await documentationFrames(root, frames);
    await editStateFields(root, { WorkflowState: target, Kind: 'RESUME', From: 'REVIEWING_FINAL' });
    for (const status of ['IN_PROGRESS', 'BLOCKED']) {
      await fillHeader(root, cycle.REVIEWING_FINAL, { Status: status });
      hasProblem(await check(root), /must be COMPLETE for a successful RESUME handoff from REVIEWING_FINAL/);
      hasProblem(await runCheck(root, { atTurnEnd: true }), /must be COMPLETE for a successful RESUME handoff from REVIEWING_FINAL/);
    }
    await rm(path.join(root, cycle.REVIEWING_FINAL));
    hasProblem(await check(root), /must exist for a successful RESUME handoff from REVIEWING_FINAL/);
    await write(root, cycle.REVIEWING_FINAL, report.replace('AC-002: audience and limits checked against the scoped guide.', 'Audience evidence missing.'));
    hasProblem(await check(root), /is COMPLETE but does not account for AC-002/);
    hasProblem(await runCheck(root, { atTurnEnd: true }), /is COMPLETE but does not account for AC-002/);
    await write(root, cycle.REVIEWING_FINAL, report);
    await cleanBoundary(root);
  }
}));

test('documentation corrective returns preserve incomplete owned records but cannot use normal forward or direct readiness', () => project(async (root) => {
  const cycle = await documentationCycle(root);
  for (const [owner, file, type] of [['DOCUMENTING', cycle.DOCUMENTING, 'DOCUMENTATION'], ['SYNCHRONIZING', cycle.SYNCHRONIZING, 'SYNCHRONIZATION']]) {
    await fillHeader(root, file, { Status: 'IN_PROGRESS' });
    await fillHeader(root, cycle.REVIEWING_FINAL, { Status: 'IN_PROGRESS' });
    await write(root, file, `${await read(root, file)}\nVerified the frame's specific correction against current inputs; remaining work depends on unfinished final review.\n`);
    await documentationFrames(root, [{ From: 'REVIEWING_FINAL', Owner: owner, FailureType: type, ResumeAt: 'REVIEWING_FINAL' }]);
    await editStateFields(root, { WorkflowState: owner, Kind: 'FAILURE', From: 'REVIEWING_FINAL', FailureType: type });
    await cleanBoundary(root);
    await documentationFrames(root, []);
    await moveCycle(root, 'REVIEWING_FINAL', { kind: 'RESUME' });
    await cleanBoundary(root);
    const record = await read(root, file);
    await rm(path.join(root, file));
    hasProblem(await check(root), /must exist with current-cycle provenance for a corrective RESUME/);
    await write(root, file, record);
    await fillHeader(root, cycle.REVIEWING_FINAL, { Status: 'COMPLETE' });
    await moveCycle(root, 'SYNCHRONIZING');
    if (owner === 'DOCUMENTING') hasProblem(await check(root), /must be COMPLETE once the cycle has passed DOCUMENTING/);
    else await cleanBoundary(root); // Synchronizer resumes its unfinished full assignment.
    await editStateFields(root, { WorkflowState: 'AWAITING_USER_SIGNOFF', Kind: 'RESUME', From: owner });
    hasProblem(await check(root), /must be COMPLETE once the cycle has passed/);
    await fillHeader(root, file, { Status: 'COMPLETE' });
  }
}));

test('documentation retains an incomplete corrective return through further recovery before review resumes', () => project(async (root) => {
  const cycle = await documentationCycle(root);
  await fillHeader(root, cycle.DOCUMENTING, { Status: 'IN_PROGRESS' });
  await fillHeader(root, cycle.REVIEWING_FINAL, { Status: 'IN_PROGRESS' });
  await write(root, cycle.DOCUMENTING, `${await read(root, cycle.DOCUMENTING)}\n`
    + 'The saved guide correction is verified. The remaining disposition depends only on unfinished final review; revisit Documenter after that assessment.\n');
  await editStateFields(root, { WorkflowState: 'REVIEWING_FINAL', Kind: 'RESUME', From: 'DOCUMENTING' });
  await cleanBoundary(root);
  const returned = await read(root, '.standards/STATE.md');
  const documentation = await read(root, cycle.DOCUMENTING);
  for (const kind of ['FAILURE', 'USER_REWORK']) {
    await editStateFields(root, { Kind: kind, From: 'REVIEWING_FINAL', FailureType: 'REVIEW' });
    await cleanBoundary(root);
  }
  for (const [owner, type] of [['AUDITING', 'PROJECT_CONTEXT'], ['SCOPING', 'SCOPING'],
    ['ARCHITECTING', 'ARCHITECTURE'], ['SYNCHRONIZING', 'SYNCHRONIZATION']]) {
    await write(root, '.standards/STATE.md', returned);
    await fillHeader(root, cycle.REVIEWING_FINAL, { Status: 'IN_PROGRESS' });
    await documentationFrames(root, [{ From: 'REVIEWING_FINAL', Owner: owner,
      FailureType: type, ResumeAt: 'REVIEWING_FINAL' }]);
    await moveCycle(root, owner, { kind: 'FAILURE', FailureType: type });
    await cleanBoundary(root);
    if (owner === 'SYNCHRONIZING') {
      await fillHeader(root, cycle.SYNCHRONIZING, { Status: 'IN_PROGRESS' });
      await write(root, cycle.SYNCHRONIZING, `${await read(root, cycle.SYNCHRONIZING)}\n`
        + 'The reconciliation correction is verified; final review must finish before the full synchronization gate.\n');
    }
    await documentationFrames(root, []);
    await moveCycle(root, 'REVIEWING_FINAL', { kind: 'RESUME' });
    await cleanBoundary(root);
    // The earlier incomplete return still needs its record, and cannot make a
    // normal forward handoff or readiness assertion count as full completion.
    await rm(path.join(root, cycle.DOCUMENTING));
    hasProblem(await check(root), /must exist once the cycle has passed DOCUMENTING/);
    await write(root, cycle.DOCUMENTING, documentation);
    await fillHeader(root, cycle.REVIEWING_FINAL, { Status: 'COMPLETE' });
    await moveCycle(root, 'SYNCHRONIZING');
    hasProblem(await check(root), /must be COMPLETE once the cycle has passed DOCUMENTING/);
    await editStateFields(root, { WorkflowState: 'AWAITING_USER_SIGNOFF', Kind: 'RESUME', From: 'SYNCHRONIZING' });
    hasProblem(await check(root), /must be COMPLETE once the cycle has passed DOCUMENTING/);
  }
}));

test('documentation nested recovery reruns the included evidence after a changed acceptance condition', () => project(async (root) => {
  const cycle = await documentationCycle(root);
  const outer = { From: 'AWAITING_USER_SIGNOFF', Owner: 'SCOPING', FailureType: 'SCOPING', ResumeAt: 'AWAITING_USER_SIGNOFF' };
  await documentationFrames(root, [outer]);
  await moveCycle(root, 'SCOPING', { kind: 'USER_REWORK', FailureType: 'SCOPING' });
  const nested = { From: 'SCOPING', Owner: 'AUDITING', FailureType: 'PROJECT_CONTEXT', ResumeAt: 'SCOPING' };
  await documentationFrames(root, [outer, nested]);
  await moveCycle(root, 'AUDITING', { kind: 'FAILURE', FailureType: 'PROJECT_CONTEXT' });
  await cleanBoundary(root);
  await documentationFrames(root, [outer]);
  await moveCycle(root, 'SCOPING', { kind: 'RESUME' });
  assert.equal(parseState(await read(root, '.standards/STATE.md')).recovery.frames.length, 1);
  await write(root, cycle.scope, (await read(root, cycle.scope)).replace('- `AC-002`: Explain the audience and limits.', '- `AC-004`: Explain the command limitations.')
    + '\n- `AC-002`: Retired because its meaning changed.\n');
  for (const file of [cycle.DOCUMENTING, cycle.REVIEWING_FINAL, cycle.SYNCHRONIZING]) await fillHeader(root, file, { Status: 'IN_PROGRESS' });
  await documentationFrames(root, [{ ...outer, RerunThrough: 'SYNCHRONIZING' }]);
  await moveCycle(root, 'ARCHITECTING');
  await cleanBoundary(root);
  await write(root, cycle.spec, `${await read(root, cycle.spec)}\nAC-004: Existing limitations are established; no architectural impact.\n`);
  await moveCycle(root, 'DOCUMENTING');
  await cleanBoundary(root);
  for (const [state, next, file] of [['DOCUMENTING', 'REVIEWING_FINAL', cycle.DOCUMENTING], ['REVIEWING_FINAL', 'SYNCHRONIZING', cycle.REVIEWING_FINAL], ['SYNCHRONIZING', 'AWAITING_USER_SIGNOFF', cycle.SYNCHRONIZING]]) {
    assert.equal(parseState(await read(root, '.standards/STATE.md')).WorkflowState, state);
    await write(root, file, `${await read(root, file)}\nAC-004: Current limitations inspected and evidenced.\n`);
    await fillHeader(root, file, { Status: 'COMPLETE' });
    if (next === 'AWAITING_USER_SIGNOFF') await documentationFrames(root, []);
    await moveCycle(root, next, { kind: next === 'AWAITING_USER_SIGNOFF' ? 'RESUME' : 'FORWARD' });
    await cleanBoundary(root);
  }
}));

// A STANDARD cycle at implementation review whose records all agree.
async function standardCycle(root) {
  const id = await startCycle(root, { state: 'REVIEWING_IMPLEMENTATION' });
  const scope = await init(root, 'SCOPE');
  await write(root, scope, `${await read(root, scope)}\n# Search\n\n## Work\n\n### 1. Search\n\n**Done when:**\n\n`
    + '- `AC-001`: Users can search by name.\n- `AC-002`: The guide explains search.\n\n'
    + '## Retired Acceptance Identifiers\n\n- `AC-003`: Retired because it was split.\n');
  const spec = await init(root, 'ARCHITECTURE');
  await write(root, spec, `${await read(root, spec)}\n# Technical Design\n\n## Acceptance Coverage\n\n`
    + '- `AC-001`: Name index.\n- `AC-002`: No architectural impact; Documenter owns it.\n');
  const plan = await init(root, 'DEVELOPMENT');
  await fillHeader(root, plan, { Mode: 'AUTONOMOUS', 'User Style': 'NONE', 'User Style Locked': 'true', Status: 'COMPLETE' });
  await write(root, plan, `${await read(root, plan)}\n## Build Steps\n\n### DEV-001 — Search endpoint\n\n`
    + '`Status`: `DONE` `Depends On`: `NONE`\n`Acceptance`: `AC-001`\n\n### DEV-002 — Search box\n\n'
    + '`Status`: `DONE` `Depends On`: `DEV-001`\n`Acceptance`: `AC-001`\n');
  const report = await init(root, 'VERIFICATION');
  await fillHeader(root, report, { Mode: 'VERIFY', Status: 'COMPLETE' });
  await write(root, report, `${await read(root, report)}\n## Acceptance Evidence\n\n`
    + '| AC-001 | test/search.test.js | passed |\n| AC-002 | pending Documenter | pending |\n');
  await editState(root, (text) => [['Scope', scope], ['Architecture', spec], ['Development', plan]]
    .reduce((current, [name, value]) => setField(current, name, value), text));
  return { id, scope, spec, plan, report };
}

// All acceptance evidence is implementation-owned or Tester-owned; no later
// documentation dependency. Recorded closure evidence exercises the checker's
// mechanical prerequisites; Reviewer still determines evidence sufficiency.
async function implementationReviewedCycle(root) {
  const cycle = await standardCycle(root);
  await write(root, cycle.scope, (await read(root, cycle.scope)).replace('The guide explains search.', 'Users see search results.'));
  await write(root, cycle.spec, (await read(root, cycle.spec)).replace('No architectural impact; Documenter owns it.', 'Search-results component.'));
  await write(root, cycle.report, (await read(root, cycle.report)).replace('pending Documenter | pending', 'test/search-results.test.js | passed'));
  await write(root, cycle.plan, (await read(root, cycle.plan)).replace(
    '`Depends On`: `DEV-001`\n`Acceptance`: `AC-001`', '`Depends On`: `DEV-001`\n`Acceptance`: `AC-002`'));
  const review = await init(root, 'REVIEW', '--kind', 'IMPLEMENTATION');
  await fillHeader(root, review, { Status: 'COMPLETE' });
  await write(root, review, `${await read(root, review)}\nAC-001 and AC-002 have current implementation and verification evidence.\n`);
  await write(root, review, `${await read(root, review)}\n## Implementation-Reviewed Closure\n\n`
    + '`Policy`: `IMPLEMENTATION_REVIEWED`\n`Eligibility`: `ELIGIBLE`\n'
    + '`User Choice`: `User explicitly requested completion after implementation review.`\n`User Reason`: `NONE`\n'
    + '`Assessed Inputs`: `Current search scope, results-component design, endpoint, UI, and test content.`\n'
    + '`Evidence`: `AC-001 and AC-002: search and results tests passed in the current full verification report.`\n'
    + '`Unmet Requirements`: `NONE`\n`Omitted Phases`: `DOCUMENTING, REVIEWING_FINAL, SYNCHRONIZING`\n'
    + '`Omitted Guarantees`: `Normal documentation completion, assembled-deliverable final review, and independent synchronization omitted.`\n');
  await editStateFields(root, { CompletionPolicy: 'IMPLEMENTATION_REVIEWED', WorkflowState: 'AWAITING_USER_SIGNOFF',
    Kind: 'FORWARD', From: 'REVIEWING_IMPLEMENTATION', FailureType: 'NONE', Reason: 'Implementation review passed.' });
  return { ...cycle, review };
}

// One independently tested outcome, with an approved future outcome unfinished.
async function incrementalCycle(root) {
  const cycle = await standardCycle(root);
  const { scope, spec, plan, report } = cycle;
  await write(root, scope, (await read(root, scope)).replace('## Retired', '- `AC-004`: Users see search results.\n\n## Retired'));
  await write(root, spec, `${await read(root, spec)}- \`AC-004\`: Search-results component.\n`);
  await fillHeader(root, plan, { Status: 'IN_PROGRESS', 'Verification Cadence': 'INCREMENTAL', 'Current Increment': '1' });
  await write(root, plan, (await read(root, plan)).replace('### DEV-002',
    '**Self-Check**\n\n`node --test test/search.test.js` in project root; dirty endpoint content; exit 0.\n\n### DEV-002')
    .replace('`Status`: `DONE` `Depends On`: `DEV-001`\n`Acceptance`: `AC-001`',
      '`Status`: `PENDING` `Depends On`: `DEV-001`\n`Acceptance`: `AC-004`')
    + '\n## Verification Increments\n\n### Increment 1\n\n'
    + '`Development Steps`: `DEV-001` `Acceptance`: `AC-001`\n\n**Ready Outcome**\n\nSearch endpoint returns matches.\n\n'
    + '### Increment 2\n\n`Development Steps`: `DEV-002` `Acceptance`: `AC-004`\n\n**Ready Outcome**\n\nSearch results are displayed.\n');
  await fillHeader(root, report, { Status: 'IN_PROGRESS', 'Assessment Purpose': 'INCREMENT', 'Assessment Target': 'Increment 1' });
  await write(root, report, `${await read(root, report)}| AC-004 | DEV-002 | AWAITING_IMPLEMENTATION |\n`
    + '\n## Increment Assessments\n\n| Increment | Outcome | Evidence | Disposition |\n| --- | --- | --- | --- |\n'
    + '| 1 | Endpoint / AC-001 | dirty endpoint content; search tests passed | VERIFIED |\n'
    + '\n## Execution Evidence\n\n`node --test test/search.test.js` in project root; dirty endpoint content; exit 0, 3 passes.\n');
  await editState(root, (text) => [['WorkflowState', 'TESTING'], ['Kind', 'CHECKPOINT'], ['From', 'DEVELOPING'],
    ['FailureType', 'NONE'], ['Reason', 'Increment 1 ready.']]
    .reduce((current, [name, value]) => setField(current, name, value), text));
  return cycle;
}

function suspendedAssignment({ number = 1, frame = 1, reason = 'A defect.', purpose, target }) {
  return `### Suspended Assignment ${number}\n\n\`Recovery Frame\`: \`${frame}\` \`Recovery Reason\`: \`${reason}\`\n`
    + `\`Purpose\`: \`${purpose}\` \`Target\`: \`${target}\`\n`
    + '`Assessed Inputs`: `dirty endpoint and search test content`\n`Next Action`: `reconcile evidence and continue the assignment`\n';
}

// These lifecycle fixtures simulate role-authored transitions. The executable
// checker verifies saved structure; role evals cover authorization, freshness,
// and evidence sufficiency, which cannot be proved by labels in a fixture.
async function cleanBoundary(root) {
  assert.deepEqual(messages(await check(root)), []);
  assert.deepEqual((await runCheck(root, { atTurnEnd: true })).problems, []);
}

async function moveCycle(root, state, { kind = 'FORWARD', ...fields } = {}) {
  const before = parseState(await read(root, '.standards/STATE.md'));
  await editStateFields(root, { WorkflowState: state, Kind: kind, From: before.WorkflowState,
    FailureType: 'NONE', Reason: 'The current assignment passed its applicable gate.', ...fields });
}

async function lifecycleReview(root, projectMode, policy) {
  await cleanBoundary(root);
  const id = await startCycle(root, { state: projectMode === 'GREENFIELD' ? 'SCOPING' : 'AUDITING', policy });
  await editStateFields(root, { Request: `Add user search. User selected ${policy} for this cycle.` });
  await cleanBoundary(root);
  if (projectMode === 'BROWNFIELD') {
    await write(root, '.standards/CONTEXT.md', '# Project Context\n\nThe existing app prints a greeting.\n');
    await moveCycle(root, 'SCOPING');
    await cleanBoundary(root);
  }
  const scope = await init(root, 'SCOPE');
  await write(root, scope, `${await read(root, scope)}\n# Search\n\n- \`AC-001\`: Search finds matching names.\n`);
  await editStateFields(root, { Scope: scope });
  await moveCycle(root, 'ARCHITECTING');
  await cleanBoundary(root);
  const spec = await init(root, 'ARCHITECTURE');
  await write(root, spec, `${await read(root, spec)}\n# Design\n\n## Acceptance Coverage\n\n- AC-001: Filter names by query.\n`);
  await editStateFields(root, { Architecture: spec });
  if (projectMode === 'GREENFIELD') {
    await moveCycle(root, 'AUDITING');
    await write(root, '.standards/CONTEXT.md', '# Project Context\n\nNo implementation exists; the search design is implementable.\n');
    await cleanBoundary(root);
  }
  await moveCycle(root, 'DEVELOPING');
  await cleanBoundary(root);
  const plan = await init(root, 'DEVELOPMENT');
  await fillHeader(root, plan, { Mode: 'AUTONOMOUS', 'User Style': 'NONE', 'User Style Locked': 'true', Status: 'COMPLETE' });
  await write(root, plan, `${await read(root, plan)}\n## Build Steps\n\n### DEV-001 — Search\n\n`
    + '`Status`: `DONE` `Depends On`: `NONE`\n`Acceptance`: `AC-001`\n');
  await editStateFields(root, { Development: plan });
  await write(root, 'app.py', 'def search(names, query):\n    return [name for name in names if query in name]\n');
  // Greenfield permanently becomes brownfield at the first implementation.
  await write(root, '.standards/MODE.md', (await read(root, '.standards/MODE.md')).replace('`GREENFIELD`', '`BROWNFIELD`'));
  await moveCycle(root, 'TESTING');
  const verification = await init(root, 'VERIFICATION');
  await fillHeader(root, verification, { Mode: 'VERIFY', Status: 'COMPLETE' });
  await write(root, verification, `${await read(root, verification)}\n## Acceptance Evidence\n\n`
    + '| AC-001 | Current search implementation | matching and nonmatching names verified |\n');
  await cleanBoundary(root);
  await moveCycle(root, 'REVIEWING_IMPLEMENTATION');
  const review = await init(root, 'REVIEW', '--kind', 'IMPLEMENTATION');
  await fillHeader(root, review, { Status: 'COMPLETE' });
  await write(root, review, `${await read(root, review)}\n## Acceptance Assessment\n\nAC-001: current search and full verification assessed.\n`);
  await cleanBoundary(root);
  return { id, scope, spec, plan, verification, review };
}

async function recordClosure(root, review, eligibility = 'ELIGIBLE') {
  const text = await read(root, review);
  const request = parseState(await read(root, '.standards/STATE.md')).active.request;
  assert.equal(text.includes('## Implementation-Reviewed Closure'), false, 'archive the prior assessment before replacing it');
  await write(root, review, `${text}\n## Implementation-Reviewed Closure\n\n`
    + '`Policy`: `IMPLEMENTATION_REVIEWED`\n' + `\`Eligibility\`: \`${eligibility}\`\n`
    + `\`User Choice\`: \`User instruction: ${request}\`\n` + '`User Reason`: `NONE`\n'
    + '`Assessed Inputs`: `Current scope, design, app.py and full verification`\n'
    + '`Evidence`: `Current AC-001 implementation assessment and full verification`\n'
    + '`Unmet Requirements`: `NONE`\n`Omitted Phases`: `DOCUMENTING, REVIEWING_FINAL, SYNCHRONIZING`\n'
    + '`Omitted Guarantees`: `Normal documentation completion, final review, and independent synchronization`\n');
}

async function fullTail(root) {
  for (const [state, type, reviewKind] of [
    ['DOCUMENTING', 'DOCUMENTATION'], ['REVIEWING_FINAL', 'REVIEW', 'FINAL_DELIVERABLE'], ['SYNCHRONIZING', 'SYNCHRONIZATION'],
  ]) {
    if (parseState(await read(root, '.standards/STATE.md')).WorkflowState !== state) await moveCycle(root, state);
    const file = await init(root, type, ...(reviewKind ? ['--kind', reviewKind] : []));
    await fillHeader(root, file, { Status: 'COMPLETE', 'User Style': 'NONE', Collaboration: 'AUTONOMOUS', Target: 'ACTIVE_CHANGE', 'Target Detail': 'search' });
    await write(root, file, `${await read(root, file)}\nAC-001: applicable evidence inspected; no remaining owned work.\n`);
    await cleanBoundary(root);
  }
  await moveCycle(root, 'AWAITING_USER_SIGNOFF');
  await cleanBoundary(root);
}

for (const projectMode of ['GREENFIELD', 'BROWNFIELD']) {
  for (const policy of ['FULL_DELIVERABLE', 'IMPLEMENTATION_REVIEWED']) {
    test(`completion lifecycle: ${projectMode}/${policy} reaches sign-off and starts a fresh default cycle`, () => project(async (root) => {
      const { id, review } = await lifecycleReview(root, projectMode, policy);
      if (policy === 'FULL_DELIVERABLE') await fullTail(root);
      else {
        await recordClosure(root, review);
        await moveCycle(root, 'AWAITING_USER_SIGNOFF');
        await cleanBoundary(root);
        for (const file of [`.standards/docs/documentation/${id}.md`, `.standards/docs/reviews/${id}/final-deliverable.md`,
          `.standards/docs/synchronization/${id}.md`]) await assert.rejects(read(root, file), { code: 'ENOENT' });
      }
      assert.match(await read(root, '.standards/MODE.md'), /`BROWNFIELD`/);
      const historicalReview = await read(root, review);
      await moveCycle(root, 'SIGNED_OFF', { kind: 'SIGNOFF', CycleMode: 'UNSET', Reason: 'User explicitly accepted the reviewed work.' });
      await cleanBoundary(root);
      assert.equal(parseState(await read(root, '.standards/STATE.md')).active.completionPolicy, policy);
      // A new cycle replaces Active Work; history stays in the prior report.
      const nextId = await startCycle(root, { state: 'AUDITING' });
      await editStateFields(root, { Kind: 'NEW_CYCLE', From: 'SIGNED_OFF', Scope: 'NONE', Architecture: 'NONE', Development: 'NONE' });
      await cleanBoundary(root);
      assert.notEqual(nextId, id);
      assert.equal(parseState(await read(root, '.standards/STATE.md')).active.completionPolicy, 'FULL_DELIVERABLE');
      assert.equal(await read(root, review), historicalReview);
    }, { projectMode }));
  }
}

test('completion lifecycle: late selection, withdrawal, and reselection preserve history and require reassessment', () => project(async (root) => {
  const { review } = await lifecycleReview(root, 'BROWNFIELD', 'FULL_DELIVERABLE');
  await moveCycle(root, 'DOCUMENTING');
  await cleanBoundary(root);
  await moveCycle(root, 'REVIEWING_IMPLEMENTATION', { kind: 'COMPLETION_CHANGE', CompletionPolicy: 'IMPLEMENTATION_REVIEWED',
    Request: 'Add user search. User selected IMPLEMENTATION_REVIEWED.', Reason: 'User selected FULL_DELIVERABLE -> IMPLEMENTATION_REVIEWED.' });
  await cleanBoundary(root);
  const returned = await read(root, '.standards/STATE.md');
  await moveCycle(root, 'AWAITING_USER_SIGNOFF');
  hasProblem(await check(root), /requires an Implementation-Reviewed Closure assessment/);
  await write(root, '.standards/STATE.md', returned);
  await recordClosure(root, review);
  await moveCycle(root, 'AWAITING_USER_SIGNOFF');
  await cleanBoundary(root);
  const firstAssessment = await read(root, review);
  await moveCycle(root, 'DOCUMENTING', { kind: 'COMPLETION_CHANGE', CompletionPolicy: 'FULL_DELIVERABLE',
    Request: 'Add user search. User selected FULL_DELIVERABLE.', Reason: 'User withdrew IMPLEMENTATION_REVIEWED for FULL_DELIVERABLE.' });
  await cleanBoundary(root);
  assert.equal(await read(root, review), firstAssessment);
  // Documenter has not begun. The user can select the shorter route again.
  await moveCycle(root, 'REVIEWING_IMPLEMENTATION', { kind: 'COMPLETION_CHANGE', CompletionPolicy: 'IMPLEMENTATION_REVIEWED',
    Request: 'Add user search. User selected IMPLEMENTATION_REVIEWED again.', Reason: 'User selected FULL_DELIVERABLE -> IMPLEMENTATION_REVIEWED again.' });
  await write(root, review, firstAssessment.replace('## Implementation-Reviewed Closure', '## Closure Assessment History'));
  await recordClosure(root, review, 'NOT_ASSESSED');
  await cleanBoundary(root);
  await moveCycle(root, 'AWAITING_USER_SIGNOFF');
  hasProblem(await check(root), /requires Closure Eligibility ELIGIBLE/);
  // Fill only the current section: the historical conclusion remains intact.
  await write(root, review, (await read(root, review)).replace('`Eligibility`: `NOT_ASSESSED`', '`Eligibility`: `ELIGIBLE`'));
  await cleanBoundary(root);
  assert.equal(recordSection(await read(root, review), 'Closure Assessment History').trim(),
    recordSection(firstAssessment, 'Implementation-Reviewed Closure').trim());
  assert.match(recordSection(await read(root, review), 'Implementation-Reviewed Closure'), /selected IMPLEMENTATION_REVIEWED again/);
  await moveCycle(root, 'DOCUMENTING', { kind: 'COMPLETION_CHANGE', CompletionPolicy: 'FULL_DELIVERABLE',
    Request: 'Add user search. User selected FULL_DELIVERABLE.', Reason: 'User withdrew IMPLEMENTATION_REVIEWED for FULL_DELIVERABLE.' });
  await fullTail(root);
}));

for (const policy of ['FULL_DELIVERABLE', 'IMPLEMENTATION_REVIEWED']) {
  test(`completion lifecycle: cancellation retains ${policy} and new work carries reconciliation, not the old policy`, () => project(async (root) => {
    const { id, review } = await lifecycleReview(root, 'BROWNFIELD', policy);
    if (policy === 'IMPLEMENTATION_REVIEWED') await recordClosure(root, review);
    const history = await read(root, review);
    await moveCycle(root, 'CANCELLED', { kind: 'CANCEL', CycleMode: 'UNSET', Reason: 'User cancelled; implementation retained.' });
    await cleanBoundary(root);
    assert.equal(parseState(await read(root, '.standards/STATE.md')).active.completionPolicy, policy);
    const nextId = await startCycle(root, { state: 'AUDITING' });
    await editStateFields(root, { Kind: 'NEW_CYCLE', From: 'CANCELLED', Scope: 'NONE', Architecture: 'NONE', Development: 'NONE' });
    await editState(root, (text) => text.replace('`BaselineReconciliation`: `NONE`',
      `\`BaselineReconciliation\`:\n\n- \`SourceCycle\`: \`${id}\`\n  \`Request\`: \`Retained search implementation\``));
    await cleanBoundary(root);
    const next = parseState(await read(root, '.standards/STATE.md'));
    assert.notEqual(nextId, id);
    assert.equal(next.active.completionPolicy, 'FULL_DELIVERABLE');
    assert.equal(next.active.baseline.entries[0].sourceCycle, id);
    assert.equal(await read(root, review), history);
  }));
}

test('completion lifecycle: reset removes shorter-policy work and initializes NONE', () => project(async (root) => {
  const { review } = await lifecycleReview(root, 'BROWNFIELD', 'IMPLEMENTATION_REVIEWED');
  await recordClosure(root, review);
  await moveCycle(root, 'AWAITING_USER_SIGNOFF');
  const app = await read(root, 'app.py');
  await resetProject({ projectRoot: root });
  await cleanBoundary(root);
  const state = parseState(await read(root, '.standards/STATE.md'));
  assert.equal(state.active.completionPolicy, 'NONE');
  assert.equal(state.active.id, 'UNSET');
  await assert.rejects(read(root, review), { code: 'ENOENT' });
  assert.equal(await read(root, 'app.py'), app);
}));

test('completion lifecycle: expedited promotion initializes full policy and retains corrective obligations', () => project(async (root) => {
  const id = await startCycle(root, { state: 'DEVELOPING', mode: 'EXPEDITED' });
  await cleanBoundary(root);
  assert.equal(parseState(await read(root, '.standards/STATE.md')).active.completionPolicy, 'NONE');
  await editState(root, (text) => withFrame(text, { From: 'REVIEWING_IMPLEMENTATION', Owner: 'DEVELOPING',
    FailureType: 'IMPLEMENTATION', ResumeAt: 'REVIEWING_IMPLEMENTATION' }));
  await editStateFields(root, { Kind: 'FAILURE', From: 'REVIEWING_IMPLEMENTATION', FailureType: 'IMPLEMENTATION' });
  await cleanBoundary(root);
  await moveCycle(root, 'AUDITING', { kind: 'PROMOTE', CycleMode: 'STANDARD', CompletionPolicy: 'FULL_DELIVERABLE',
    PromotionReason: 'Authorization needs a designed cross-cutting contract.' });
  await editState(root, (text) => text.replace(/## Recovery[\s\S]*$/, '## Recovery\n\n`Active`: `false`\n\n'
    + '## Outstanding Obligations\n\n`Active`: `true`\n\n### Obligation 1\n\n'
    + '`Owner`: `DEVELOPING` `FailureType`: `IMPLEMENTATION` `Reason`: `A defect.`\n'));
  await cleanBoundary(root);
  const promoted = parseState(await read(root, '.standards/STATE.md'));
  assert.equal(promoted.active.id, id);
  assert.equal(promoted.active.completionPolicy, 'FULL_DELIVERABLE');
  assert.deepEqual(promoted.recovery.frames, []);
  assert.equal(promoted.obligations.items[0].fields.Owner, 'DEVELOPING');
  await editStateFields(root, { CompletionPolicy: 'NONE' });
  hasProblem(await check(root), /CompletionPolicy NONE is not valid with CycleMode STANDARD/);
}));

test('completion lifecycle: nested documentation recovery preserves the outer frame until closure reassessment', () => project(async (root) => {
  const { review } = await lifecycleReview(root, 'BROWNFIELD', 'IMPLEMENTATION_REVIEWED');
  await recordClosure(root, review);
  await moveCycle(root, 'AWAITING_USER_SIGNOFF');
  await cleanBoundary(root);
  const outer = { From: 'AWAITING_USER_SIGNOFF', Owner: 'DOCUMENTING', FailureType: 'DOCUMENTATION',
    ResumeAt: 'AWAITING_USER_SIGNOFF' };
  await editState(root, (text) => withFrame(text, outer));
  await moveCycle(root, 'DOCUMENTING', { kind: 'FAILURE', FailureType: 'DOCUMENTATION', Reason: 'A defect.' });
  const documentation = await init(root, 'DOCUMENTATION');
  await fillHeader(root, documentation, { Status: 'IN_PROGRESS', 'User Style': 'NONE', Collaboration: 'AUTONOMOUS', Target: 'ACTIVE_CHANGE', 'Target Detail': 'search' });
  await cleanBoundary(root);
  const outerState = parseState(await read(root, '.standards/STATE.md')).recovery.frames[0];
  const nested = { From: 'DOCUMENTING', Owner: 'DEVELOPING', FailureType: 'IMPLEMENTATION', ResumeAt: 'DOCUMENTING' };
  await editState(root, (text) => text.replace('## Outstanding Obligations',
    `${frameText(nested).replace('### Frame 1', '### Frame 2')}\n\n## Outstanding Obligations`));
  await moveCycle(root, 'DEVELOPING', { kind: 'FAILURE', FailureType: 'IMPLEMENTATION', Reason: 'A defect.' });
  await cleanBoundary(root);
  // Developer and Tester re-establish their current full evidence, then pop
  // only the inner frame. The outer Documenter assignment is still unfinished.
  await editState(root, (text) => text.replace(/### Frame 2[\s\S]*?(?=## Outstanding)/,
    frameText({ ...nested, RerunThrough: 'TESTING' }).replace('### Frame 1', '### Frame 2') + '\n\n'));
  await moveCycle(root, 'TESTING', { kind: 'RESUME' });
  await cleanBoundary(root);
  await editState(root, (text) => text.replace(/### Frame 2[\s\S]*?(?=## Outstanding)/, ''));
  await moveCycle(root, 'DOCUMENTING', { kind: 'RESUME' });
  await cleanBoundary(root);
  assert.deepEqual(parseState(await read(root, '.standards/STATE.md')).recovery.frames, [outerState]);
  await fillHeader(root, documentation, { Status: 'COMPLETE' });
  await write(root, documentation, `${await read(root, documentation)}\nAC-001: corrected search example verified against current behavior.\n`);
  await editState(root, (text) => text.replace('`RerunThrough`: `NONE`', '`RerunThrough`: `REVIEWING_IMPLEMENTATION`'));
  await moveCycle(root, 'REVIEWING_IMPLEMENTATION', { kind: 'RESUME' });
  await write(root, review, (await read(root, review)).replace('## Implementation-Reviewed Closure', '## Closure Assessment History'));
  await recordClosure(root, review, 'NOT_ASSESSED');
  await cleanBoundary(root);
  const pending = await read(root, '.standards/STATE.md');
  await moveCycle(root, 'AWAITING_USER_SIGNOFF', { kind: 'RESUME' });
  hasProblem(await check(root), /AWAITING_USER_SIGNOFF requires an empty recovery stack/);
  await editState(root, (text) => text.replace(/## Recovery[\s\S]*?(?=## Outstanding)/, '## Recovery\n\n`Active`: `false`\n\n'));
  hasProblem(await check(root), /requires Closure Eligibility ELIGIBLE/);
  await write(root, '.standards/STATE.md', pending);
  await write(root, review, (await read(root, review)).replace('`Eligibility`: `NOT_ASSESSED`', '`Eligibility`: `ELIGIBLE`'));
  await editState(root, (text) => text.replace(/## Recovery[\s\S]*?(?=## Outstanding)/, '## Recovery\n\n`Active`: `false`\n\n'));
  await moveCycle(root, 'AWAITING_USER_SIGNOFF', { kind: 'RESUME' });
  await cleanBoundary(root);
}));

test('slugs use plain lowercase words and stay short', () => {
  assert.equal(slugFor('Add user search by name & e-mail (v2)!'), 'add-user-search-by-name-e-mail-v2');
  assert.equal(slugFor('Ünïcode — café search'), 'unicode-cafe-search');
  assert.ok(slugFor('word '.repeat(30)).length <= 40);
  assert.equal(slugFor('!!!'), 'cycle');
});

test('cycle new prints an ID that check accepts and changes no file', () => project(async (root) => {
  const state = await read(root, '.standards/STATE.md');
  const { code, stdout } = await tool(root, 'cycle', 'new', '--request', 'Add user search by name');
  assert.equal(code, 0);
  const id = stdout.trim();
  assert.match(id, /^add-user-search-by-name-\d{8}T\d{6}Z-[0-9a-f]{8}$/);
  assert.equal(await read(root, '.standards/STATE.md'), state);
  await editState(root, (text) => [['Id', id], ['Request', 'Add user search by name'], ['CycleMode', 'STANDARD'],
    ['CompletionPolicy', 'FULL_DELIVERABLE']]
    .reduce((current, [name, value]) => setField(current, name, value), text));
  await installProject({ projectRoot: root, clients: ['claude'] });
  assert.equal((await check(root)).ok, true);
}));

test('cycle new refuses while a cycle is active and works again after sign-off', () => project(async (root) => {
  await startCycle(root);
  const refused = await tool(root, 'cycle', 'new', '--request', 'Another change');
  assert.equal(refused.code, 1);
  assert.match(refused.stderr, /still active/);
  await editState(root, (text) => setField(setField(text, 'WorkflowState', 'SIGNED_OFF'), 'CycleMode', 'UNSET'));
  assert.equal((await tool(root, 'cycle', 'new', '--request', 'Another change')).code, 0);
}));

test('cycle new calls with the same request print distinct IDs', () => project(async (root) => {
  const results = await Promise.all(Array.from({ length: 8 }, () => tool(root, 'cycle', 'new', '--request', 'Change')));
  assert.deepEqual(results.map((result) => result.code), Array(8).fill(0));
  assert.equal(new Set(results.map((result) => result.stdout.trim())).size, 8);
}));

test('cycle new refuses a conflicted or missing STATE.md', () => project(async (root) => {
  const state = await read(root, '.standards/STATE.md');
  await write(root, '.standards/STATE.md', `<<<<<<< ours\n${state}=======\n${state}>>>>>>> theirs\n`);
  const conflicted = await tool(root, 'cycle', 'new', '--request', 'Search');
  assert.equal(conflicted.code, 1);
  assert.match(conflicted.stderr, /merge conflicts/);
  await rm(path.join(root, '.standards/STATE.md'));
  const missing = await tool(root, 'cycle', 'new', '--request', 'Search');
  assert.equal(missing.code, 1);
  assert.match(missing.stderr, /STATE\.md is missing/);
}));

test('id next counts current, retired, and last-committed identifiers', () => project(async (root) => {
  await startCycle(root);
  const scope = await init(root, 'SCOPE');
  const base = await read(root, scope);
  await write(root, scope, `${base}\n- \`AC-001\`: One.\n- \`AC-002\`: Two.\n\n## Retired Acceptance Identifiers\n\n- \`AC-004\`: Gone.\n`);
  assert.equal((await tool(root, 'id', 'next', 'AC', scope)).stdout.trim(), 'AC-005');
  await write(root, scope, `${base}\n- \`AC-001\`: One.\n- \`AC-006\`: Six.\n`);
  await commit(root);
  await write(root, scope, `${base}\n- \`AC-001\`: One.\n`);
  assert.equal((await tool(root, 'id', 'next', 'AC', scope)).stdout.trim(), 'AC-007');
}, { withGit: true }));

test('id next ignores references into other records and checks the record type', () => project(async (root) => {
  const id = await startCycle(root, { state: 'REVIEWING_IMPLEMENTATION' });
  const review = await init(root, 'REVIEW', '--kind', 'IMPLEMENTATION');
  await write(root, review, `${await read(root, review)}\n### F-001 — Bug\n\nSee .standards/docs/reviews/${id}/final-deliverable.md#F-009.\n`);
  assert.equal((await tool(root, 'id', 'next', 'F', review)).stdout.trim(), 'F-002');
  const wrong = await tool(root, 'id', 'next', 'DEV', review);
  assert.equal(wrong.code, 1);
  assert.match(wrong.stderr, /DEVELOPMENT record/);
  const report = await init(root, 'VERIFICATION');
  assert.equal((await tool(root, 'id', 'next', 'DOC', report)).code, 1);
}));

test('artifact init writes provenance and the template header, and is safe to repeat', () => project(async (root) => {
  const id = await startCycle(root, { state: 'TESTING' });
  const report = await init(root, 'VERIFICATION');
  assert.equal(report, `.standards/docs/verification/${id}.md`);
  const text = await read(root, report);
  assert.ok(text.startsWith(`<!-- STANDARDS\nArtifact: VERIFICATION\nCycle: ${id}\n-->\n\n# Verification Report\n`));
  assert.match(text, new RegExp(`\`Cycle\`: \`${id}\` \`Mode\`: \`VERIFY \\| REVERIFY\``));
  assert.equal(await init(root, 'VERIFICATION'), report);
  assert.equal(await read(root, report), text);

  const review = await init(root, 'REVIEW', '--kind', 'FINAL_DELIVERABLE');
  assert.equal(review, `.standards/docs/reviews/${id}/final-deliverable.md`);
  assert.match(await read(root, review), /ReviewKind: FINAL_DELIVERABLE\n-->[\s\S]*`ReviewKind`: `FINAL_DELIVERABLE`/);
  assert.equal((await tool(root, 'artifact', 'init', 'REVIEW')).code, 1);

  const scope = await init(root, 'SCOPE');
  assert.equal(scope, `.standards/docs/scope/${id}.md`);
  assert.equal(await read(root, scope), `<!-- STANDARDS\nArtifact: SCOPE\nCycle: ${id}\n-->\n`);
  assert.equal(await init(root, 'DEVELOPMENT'), `.standards/docs/development/${id}.md`);
  assert.equal((await tool(root, 'artifact', 'init', 'DEVELOPMENT', '--dir', 'plans')).code, 1);
}));

test('artifact init never overwrites another file and needs an active cycle', () => project(async (root) => {
  assert.match((await tool(root, 'artifact', 'init', 'SCOPE')).stderr, /no active cycle/);
  const id = await startCycle(root, { state: 'TESTING' });
  await write(root, `.standards/docs/verification/${id}.md`, '# Notes kept by the team\n');
  const result = await tool(root, 'artifact', 'init', 'VERIFICATION');
  assert.equal(result.code, 1);
  assert.match(result.stderr, /collision/);
  assert.equal(await read(root, `.standards/docs/verification/${id}.md`), '# Notes kept by the team\n');
}));

test('check passes on a fresh install and on a consistent cycle', () => project(async (root) => {
  assert.deepEqual((await check(root)).problems, []);
  await standardCycle(root);
  const result = await check(root);
  assert.deepEqual(messages(result), []);
  assert.equal(result.code, 0);
}));

test('check stops at merge conflicts in the runtime', () => project(async (root) => {
  await editState(root, (text) => `${text}<<<<<<< ours\n=======\n>>>>>>> theirs\n`);
  const result = await check(root);
  assert.equal(result.code, 1);
  assert.equal(result.problems.length, 1);
  hasProblem(result, /STATE\.md: has an unresolved merge conflict/);
}));

test('check reports workflow state problems', () => project(async (root) => {
  await startCycle(root, { state: 'AWAITING_USER_SIGNOFF' });
  await editState(root, (text) => text
    .replace('## Recovery\n\n`Active`: `false`', '## Recovery\n\n`Active`: `false`\n\n### Frame 2\n\n'
      + '`From`: `TESTING` `Owner`: `ARCHITECTING` `FailureType`: `ARCHITECTURE`\n`Reason`: `Retry undefined.`\n'
      + '`ResumeAt`: `TESTING` `RerunThrough`: `NOWHERE`')
    .replace('## Outstanding Obligations\n\n`Active`: `false`', '## Outstanding Obligations\n\n`Active`: `true`\n\n'
      + '### Obligation 1\n\n`Owner`: `TESTING` `FailureType`: `VERIFICATION`'));
  const result = await check(root);
  hasProblem(result, /Recovery\.Active is `false` but there is 1 frame/);
  hasProblem(result, /found `Frame 2` in position 1/);
  hasProblem(result, /Recovery frame 2: `RerunThrough`/);
  hasProblem(result, /Obligation 1: `Reason` is missing/);
  hasProblem(result, /AWAITING_USER_SIGNOFF requires an empty recovery stack/);
  await editState(root, (text) => setField(text, 'Id', 'made-up-id-1234'));
  hasProblem(await check(root), /Active Work\.Id `made-up-id-1234` is not in the form cycle\.mjs generates/);
}));

test('a new cycle may not reuse the ID of the cycle the last commit ended', () => project(async (root) => {
  const id = await startCycle(root, { state: 'AWAITING_USER_SIGNOFF' });
  await editState(root, (text) => [['WorkflowState', 'SIGNED_OFF'], ['CycleMode', 'UNSET'], ['Kind', 'SIGNOFF'],
    ['From', 'AWAITING_USER_SIGNOFF']].reduce((current, [name, value]) => setField(current, name, value), text));
  await commit(root);
  // The next cycle's ID is generated while no cycle is active.
  const next = await tool(root, 'cycle', 'new', '--request', 'Next change');
  assert.equal(next.code, 0, next.stderr);
  const reopen = (cycle) => editState(root, (text) => [['WorkflowState', 'AUDITING'], ['CycleMode', 'STANDARD'],
    ['CompletionPolicy', 'FULL_DELIVERABLE'],
    ['Kind', 'NEW_CYCLE'], ['From', 'SIGNED_OFF'], ['Id', cycle]].reduce((current, [name, value]) => setField(current, name, value), text));
  await reopen(id);
  hasProblem(await check(root), new RegExp(`Active Work\\.Id \`${id}\` belongs to the cycle the last commit ended in SIGNED_OFF`));
  await reopen(next.stdout.trim());
  assert.deepEqual(messages(await check(root)), []);
}, { withGit: true }));

test('check reports provenance problems', () => project(async (root) => {
  const id = await startCycle(root, { state: 'TESTING' });
  await write(root, 'docs/notes/broken.md', '<!-- STANDARDS\nArtifact: VERIFICATON\nCycle: x-1\n-->\n');
  await write(root, 'docs/old/review.md', '<!-- STANDARDS\nArtifact: REVIEW\nCycle: never-registered-1\nReviewKind: IMPLEMENTATION\n-->\n');
  await write(root, 'docs/elsewhere/report.md', `<!-- STANDARDS\nArtifact: VERIFICATION\nCycle: ${id}\n-->\n\n`
    + '# Verification Report\n\n`Cycle`: `other-cycle` `Mode`: `VERIFY | REVERIFY` `Status`: `COMPLETE`\n');
  const result = await check(root);
  hasProblem(result, /broken\.md: has a malformed provenance block \(unknown Artifact `VERIFICATON`\)/);
  // A record from an earlier cycle is history, whatever form its ID has.
  assert.equal(messages(result).some((line) => line.includes('review.md')), false);
  hasProblem(result, new RegExp(`report\\.md: is this cycle's VERIFICATION record, but it must be at \\.standards/docs/verification/${id}\\.md`));
  hasProblem(result, /report\.md: shows Cycle `other-cycle`/);
  hasProblem(result, /report\.md: field `Mode` still shows the template's choices/);
}));

test('check enforces acceptance IDs against the last commit', () => project(async (root) => {
  const { scope, plan } = await standardCycle(root);
  await commit(root);
  const text = await read(root, scope);
  await write(root, scope, text.replace('- `AC-002`: The guide explains search.\n', '')
    .replace('## Retired Acceptance Identifiers', '- `AC-003`: Back again.\n- `AC-001`: Duplicate.\n\n## Retired Acceptance Identifiers'));
  await write(root, plan, (await read(root, plan)).replace('`Acceptance`: `AC-001`\n\n### DEV-002', '`Acceptance`: `AC-009`\n\n### DEV-002'));
  const result = await check(root);
  hasProblem(result, /AC-002 was in the last commit but is gone now/);
  hasProblem(result, /AC-003 is both current and retired/);
  hasProblem(result, /AC-001 is defined more than once/);
  hasProblem(result, /mentions AC-009, which is not defined in the scope/);
}, { withGit: true }));

test('COMPLETE records past their phase must account for every current AC', () => project(async (root) => {
  const { scope, spec, report } = await standardCycle(root);
  await write(root, scope, (await read(root, scope)).replace('## Retired', '- `AC-005`: Search is fast.\n\n## Retired'));
  const result = await check(root);
  hasProblem(result, new RegExp(`${spec}: does not account for AC-005`));
  hasProblem(result, new RegExp(`${report}: is COMPLETE but does not account for AC-005`));
}));

test('a COMPLETE record must account for every current AC in its own phase', () => project(async (root) => {
  const { scope, report } = await standardCycle(root);
  await editState(root, (text) => setField(text, 'WorkflowState', 'TESTING'));
  await write(root, scope, (await read(root, scope)).replace('## Retired', '- `AC-005`: Search is fast.\n\n## Retired'));
  // Tester's own check before handing off catches the gap.
  hasProblem(await check(root), new RegExp(`${report}: is COMPLETE but does not account for AC-005`));
  // A record still in progress is not held to full coverage yet.
  await fillHeader(root, report, { Status: 'IN_PROGRESS' });
  assert.equal(messages(await check(root)).some((line) => line.includes(`${report}: is COMPLETE`)), false);
}));

test('everything under Previous Cycles in a reused design is history', () => project(async (root) => {
  const { spec } = await standardCycle(root);
  const current = (await read(root, spec)).replace('- `AC-002`: No architectural impact; Documenter owns it.\n', '');
  // Earlier coverage moved with its own heading still does not count.
  await write(root, spec, `${current}\n## Previous Cycles\n\n## Acceptance Coverage\n\n- \`AC-002\`: Earlier coverage.\n`);
  hasProblem(await check(root), new RegExp(`${spec}: does not account for AC-002`));
  // A "## " line inside a code block does not end the section early.
  await write(root, spec, `${current}\n## Previous Cycles\n\n\`\`\`md\n## Example\n\`\`\`\n\n- \`AC-002\`: Earlier coverage.\n`);
  hasProblem(await check(root), new RegExp(`${spec}: does not account for AC-002`));
}));

test('everything under Previous Cycles in a reused scope is history', () => project(async (root) => {
  const { scope, spec } = await standardCycle(root);
  const text = await read(root, scope);
  // An earlier condition moved with its own heading is not current, so nothing must cover it.
  await write(root, scope, '# Search\n\n## Work\n\n- `AC-004`: Users can search by name.\n\n'
    + '## Previous Cycles\n\n## Work\n\n- `AC-001`: An earlier condition.\n');
  const lines = messages(await check(root));
  assert.equal(lines.some((line) => /does not account for AC-001|AC-001 is under Previous Cycles/.test(line)), false, lines.join('\n'));
  hasProblem(await check(root), new RegExp(`${spec}: does not account for AC-004`));
  // A "## Previous Cycles" line inside a code block does not turn current conditions into history.
  await write(root, scope, text.replace('## Retired Acceptance Identifiers',
    '```md\n## Previous Cycles\n```\n\n- `AC-004`: Results are paged.\n\n## Retired Acceptance Identifiers'));
  hasProblem(await check(root), new RegExp(`${spec}: does not account for AC-004`));
}));

test('check reports this cycle\'s conditions placed below Previous Cycles', () => project(async (root) => {
  const { scope } = await standardCycle(root);
  const misplaced = /under Previous Cycles but numbered after|has conditions only under Previous Cycles/;
  const scopeProblems = async () => messages(await check(root)).filter((line) => line.startsWith(`${scope}:`) && misplaced.test(line));
  // Earlier cycles' lower-numbered conditions at the end are fine.
  await write(root, scope, '# Search\n\n## Work\n\n- `AC-004`: Now.\n\n## Previous Cycles\n\n## Work\n\n- `AC-001`: Earlier.\n');
  assert.deepEqual(await scopeProblems(), []);
  // A higher-numbered condition under the heading is this cycle's work in the wrong place.
  await write(root, scope, '# Search\n\n## Work\n\n- `AC-004`: Now.\n\n## Previous Cycles\n\n- `AC-001`: Earlier.\n\n## Work\n\n- `AC-005`: Also now.\n');
  hasProblem(await check(root), /AC-005 is under Previous Cycles but numbered after this cycle's conditions/);
  // So is a scope whose only conditions are under the heading.
  await write(root, scope, '# Search\n\n## Previous Cycles\n\n- `AC-001`: Earlier.\n\n## Work\n\n- `AC-004`: Now.\n');
  hasProblem(await check(root), /has conditions only under Previous Cycles/);
}));

test('during a rerun, the current state\'s own COMPLETE record must cover a new AC', () => project(async (root) => {
  const { scope, spec, report } = await standardCycle(root);
  // A user rework adds AC-005 and reruns the cycle; no record covers it yet.
  await editState(root, (text) => text.replace('## Recovery\n\n`Active`: `false`', '## Recovery\n\n`Active`: `true`\n\n### Frame 1\n\n'
    + '`From`: `AWAITING_USER_SIGNOFF` `Owner`: `SCOPING` `FailureType`: `SCOPING`\n`Reason`: `Paging was added.` '
    + '`ResumeAt`: `AWAITING_USER_SIGNOFF` `RerunThrough`: `SYNCHRONIZING`'));
  await write(root, scope, (await read(root, scope)).replace('## Retired', '- `AC-005`: Results are paged.\n\n## Retired'));
  const coverage = async () => messages(await check(root)).filter((line) => line.includes('account for AC-005'));
  // Before the rerun reaches TESTING, later records and the design are left for the rerun.
  await editState(root, (text) => setField(text, 'WorkflowState', 'DEVELOPING'));
  assert.deepEqual(await coverage(), []);
  // At TESTING, Tester's own record must cover the new AC before it hands off.
  await editState(root, (text) => setField(text, 'WorkflowState', 'TESTING'));
  assert.deepEqual(await coverage(), [`${report}: is COMPLETE but does not account for AC-005.`]);
  assert.equal((await coverage()).some((line) => line.startsWith(`${spec}:`)), false);
}));

test('a condition the scope mentions without defining is reported on the scope, marked or not', () => project(async (root) => {
  const { scope, spec, report } = await standardCycle(root);
  const undefinedHere = /AC-00\d appears in the scope but is not defined as a condition\. Each condition must be a list item/;
  // A table row does not define a condition, so Scoper's own check reports it on the scope.
  await write(root, scope, (await read(root, scope)).replace('- `AC-001`: Users can search by name.\n',
    '| ID | Condition |\n| - | - |\n| `AC-001` | Users can search by name. |\n'));
  let lines = messages(await check(root));
  assert.ok(lines.some((line) => line.startsWith(`${scope}: `) && undefinedHere.test(line)), lines.join('\n'));
  // The scope gets that one message, not a second one as a record citing its own ID.
  assert.equal(lines.filter((line) => line.startsWith(`${scope}: `) && line.includes('AC-001')).length, 1, lines.join('\n'));
  // A record that cites it is told why the ID is undefined.
  const cited = `${spec}: mentions AC-001, which appears in the scope ${scope} but is not defined there as a condition.`;
  assert.ok(lines.some((line) => line.startsWith(cited)), lines.join('\n'));
  // The same holds for an unmarked project document used as the scope, whose check used to pass silently.
  await write(root, 'docs/requirements.md', '# Requirements\n\n## Acceptance\n\n### AC-001 — Search by name\n\n'
    + '- `AC-002`: The guide explains search.\n');
  await editState(root, (text) => setField(text, 'Scope', 'docs/requirements.md'));
  lines = messages(await check(root));
  assert.ok(lines.some((line) => line.startsWith('docs/requirements.md: AC-001 appears in the scope')), lines.join('\n'));
  // Mentions in a code block or under Previous Cycles are not reported.
  await write(root, 'docs/requirements.md', '# Requirements\n\n## Acceptance\n\n- `AC-001`: Search by name.\n'
    + '- `AC-002`: The guide explains search.\n\n```md\n| `AC-007` | Example |\n```\n\n'
    + '## Previous Cycles\n\n| `AC-000` | An earlier condition in a table. |\n');
  await write(root, report, `${await read(root, report)}\nSee AC-000.\n`);
  lines = messages(await check(root));
  assert.equal(lines.some((line) => /appears in the scope/.test(line)), false, lines.join('\n'));
  // A record citing an ID found only in that history gets the plain message, not the format hint.
  assert.ok(lines.includes(`${report}: mentions AC-000, which is not defined in the scope docs/requirements.md.`), lines.join('\n'));
}));

test('design coverage and paths are checked from the state after ARCHITECTING', () => project(async (root) => {
  const { scope, spec } = await standardCycle(root);
  await write(root, scope, (await read(root, scope)).replace('## Retired', '- `AC-005`: Search is fast.\n\n## Retired'));
  await editState(root, (text) => setField(text, 'WorkflowState', 'AUDITING'));
  // A brownfield audit comes before the design, so it is not checked yet.
  assert.equal(messages(await check(root)).some((line) => line.includes(`${spec}: does not account`)), false);
  // A greenfield audit comes after the design.
  await write(root, '.standards/MODE.md', (await read(root, '.standards/MODE.md')).replace('BROWNFIELD', 'GREENFIELD'));
  hasProblem(await check(root), new RegExp(`${spec}: does not account for AC-005`));
  await editState(root, (text) => setField(setField(text, 'Scope', 'NONE'), 'Architecture', 'NONE'));
  const result = await check(root);
  hasProblem(result, /Active Work\.Scope is NONE, but this STANDARD cycle is already in AUDITING/);
  hasProblem(result, /Active Work\.Architecture is NONE, but this STANDARD cycle is already in AUDITING/);
}));

test('check requires cross-record references to name their file', () => project(async (root) => {
  const { id } = await standardCycle(root);
  const review = await init(root, 'REVIEW', '--kind', 'IMPLEMENTATION');
  await fillHeader(root, review, { Status: 'IN_PROGRESS' });
  await write(root, review, `${await read(root, review)}\n### F-001 — Missing escape\n\nAC-001.\n`);
  const doc = await init(root, 'DOCUMENTATION');
  await fillHeader(root, doc, { Status: 'IN_PROGRESS', Collaboration: 'AUTONOMOUS', Target: 'ACTIVE_CHANGE',
    'Target Detail': 'active cycle', 'User Style': 'NONE' });
  await write(root, doc, `${await read(root, doc)}\n### D-001 — Old style\n\nSee F-001 and ${review}#F-001 and ${review}#F-007. AC-001 AC-002\n`);
  const result = await check(root);
  hasProblem(result, /documentation\/.*: mentions F-001 without naming its record/);
  assert.ok(messages(result).some((line) => line.includes(
    `refers to ${review}#F-007, but that file has no F-007`,
  )), JSON.stringify(result));
  hasProblem(result, /numbers its discrepancies D-NNN; documentation records use DOC-NNN/);
  assert.equal(messages(result).some((line) => line.includes(`#F-001, but`)), false);

  // A Markdown link relative to the referring file names the same record.
  await write(root, doc, (await read(root, doc)).replace(`${review}#F-007`, `../reviews/${id}/implementation.md#F-001`));
  assert.equal(messages(await check(root)).some((line) => /#F-00\d, but/.test(line)), false);
}));

test('a Markdown link to another record may use the identifier as its text', () => project(async (root) => {
  const { id, plan } = await standardCycle(root);
  const review = await init(root, 'REVIEW', '--kind', 'IMPLEMENTATION');
  await fillHeader(root, review, { Status: 'IN_PROGRESS' });
  await write(root, review, `${await read(root, review)}\n### F-001 — Missing escape\n\nAC-001.\n`);
  const target = `../reviews/${id}/implementation.md`;
  await write(root, plan, `${await read(root, plan)}\nFixes [F-001](${target}#F-001).\n`);
  assert.deepEqual(messages(await check(root)), []);
  // Link text that names a different entry than the link target is still reported.
  await write(root, plan, `${await read(root, plan)}\nAlso [F-001](${target}#F-002).\n`);
  const result = await check(root);
  hasProblem(result, /development\/.*: mentions F-001 without naming its record/);
  hasProblem(result, /refers to .*#F-002, but that file has no F-002/);
}));

test('check validates development plans', () => project(async (root) => {
  const { plan } = await standardCycle(root);
  await commit(root);
  await write(root, plan, (await read(root, plan))
    .replace('### DEV-001 — Search endpoint\n\n`Status`: `DONE` `Depends On`: `NONE`',
      '### DEV-003 — Search endpoint\n\n`Status`: `DONE` `Depends On`: `DEV-002`')
    .replace('`Status`: `DONE` `Depends On`: `DEV-001`', '`Status`: `WAITING` `Depends On`: `DEV-003, DEV-008`'));
  const result = await check(root);
  hasProblem(result, /DEV-001 was DONE in the last commit but is missing now/);
  hasProblem(result, /DEV-002: Status must be PENDING, IN_PROGRESS, or DONE/);
  hasProblem(result, /DEV-002 depends on DEV-008, which is not a step/);
  hasProblem(result, /depend on each other in a loop/);
  hasProblem(result, /The plan is COMPLETE but DEV-002 is not DONE/);
}, { withGit: true }));

test('check flags acceptance IDs in expedited cycles', () => project(async (root) => {
  await startCycle(root, { state: 'DEVELOPING', mode: 'EXPEDITED' });
  const plan = await init(root, 'DEVELOPMENT');
  await fillHeader(root, plan, { Mode: 'AUTONOMOUS', 'User Style': 'NONE', 'User Style Locked': 'false', Status: 'PROPOSED' });
  await write(root, plan, `${await read(root, plan)}\n### DEV-001 — Fix\n\n\`Status\`: \`PENDING\` \`Depends On\`: \`NONE\`\n\`Acceptance\`: \`AC-001\`\n`);
  await editState(root, (text) => setField(text, 'Development', plan));
  hasProblem(await check(root), /uses acceptance IDs \(AC-001\), but EXPEDITED cycles have none/);
}));

test('install ships the tools, and reinstall restores them without other changes', () => project(async (root) => {
  await rm(path.join(root, '.standards/bin'), { recursive: true });
  const restored = await installProject({ projectRoot: root, clients: ['claude'] });
  assert.equal(restored.changed, 1);
  assert.match(await read(root, '.standards/bin/check.mjs'), /runCheck/);
  assert.equal((await installProject({ projectRoot: root, clients: ['claude'] })).changed, 0);
}));

test('install ships the protocol chapters, and reinstall restores them without other changes', () => project(async (root) => {
  const source = new URL('../protocol/', import.meta.url);
  const chapters = (await readdir(source)).sort();
  assert.deepEqual((await readdir(path.join(root, '.standards/protocol'))).sort(), chapters);
  await rm(path.join(root, '.standards/protocol'), { recursive: true });
  const restored = await installProject({ projectRoot: root, clients: ['claude'] });
  assert.equal(restored.changed, 1);
  for (const name of chapters) {
    assert.equal(await read(root, `.standards/protocol/${name}`), await readFile(new URL(name, source), 'utf8'));
  }
  assert.equal((await installProject({ projectRoot: root, clients: ['claude'] })).changed, 0);
}));

// Run a command with JSON on stdin, the way Claude Code and Codex run hooks.
function withStdin(command, args, { cwd, input, env = {} }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: { ...process.env, ...env } });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
    child.stdin.end(JSON.stringify(input));
  });
}

const hook = (root, event, input) =>
  withStdin(process.execPath, [path.join(root, '.standards/bin/hook.mjs'), event], { cwd: root, input: { cwd: root, ...input } });

test('the hook script handles only the stop event', () => project(async (root) => {
  const result = await hook(root, 'pre-tool-use', { tool_name: 'Edit', tool_input: { file_path: 'app.py' } });
  assert.equal(result.code, 1);
  assert.match(result.stderr, /Usage: node \.standards\/bin\/hook\.mjs stop/);
}));

// The Stop payload Claude Code sends (session_id, transcript_path, cwd,
// permission_mode, hook_event_name, stop_hook_active, last_assistant_message).
// Codex sends the same flag plus turn_id.
const claudeStop = (root, session, active) => ({
  session_id: session, transcript_path: '/tmp/transcript.jsonl', cwd: root, permission_mode: 'default',
  hook_event_name: 'Stop', stop_hook_active: active, last_assistant_message: 'Done.',
});

test('stop sends the agent back on every turn with problems, but not while it is already continuing', () => project(async (root) => {
  await write(root, 'docs/notes/broken.md', '<!-- STANDARDS\nArtifact: VERIFICATON\nCycle: x-1\n-->\n');
  await commit(root);
  const session = randomUUID();
  // The problem is committed and nothing relevant changed, so the check is skipped.
  assert.equal((await hook(root, 'stop', claudeStop(root, session, false))).code, 0);

  await write(root, 'README.md', '# Project\n');
  for (let turn = 1; turn <= 3; turn += 1) {
    const sent = await hook(root, 'stop', claudeStop(root, session, false));
    assert.equal(sent.code, 2, `turn ${turn}`);
    assert.match(sent.stderr, /broken\.md: has a malformed provenance block/);
    assert.match(sent.stderr, /Do not guess a repair/);
    // Stopping again after being sent back goes through.
    assert.equal((await hook(root, 'stop', claudeStop(root, session, true))).code, 0, `turn ${turn} continuation`);
  }

  await rm(path.join(root, 'docs/notes/broken.md'));
  assert.equal((await hook(root, 'stop', claudeStop(root, session, false))).code, 0);
}, { withGit: true }));

test('at turn end, stop holds the role that made the last handoff, not the one that took over', () => project(async (root) => {
  const { scope, spec, report } = await standardCycle(root);
  const session = randomUUID();
  const review = await init(root, 'REVIEW', '--kind', 'IMPLEMENTATION');
  await fillHeader(root, review, { Status: 'COMPLETE' });
  await write(root, review, `${await read(root, review)}\n## Contract and Evidence Assessment\n\nAC-001 and AC-002 supported.\n`);
  const docs = await init(root, 'DOCUMENTATION');
  await fillHeader(root, docs, { Status: 'COMPLETE', Collaboration: 'AUTONOMOUS', Target: 'ACTIVE_CHANGE',
    'Target Detail': 'active cycle', 'User Style': 'NONE' });
  await write(root, docs, `${await read(root, docs)}\n## Documentation Work and Evidence\n\nAC-001 and AC-002 documented.\n`);
  // A user rework added AC-005; every COMPLETE record above is now stale.
  await write(root, scope, (await read(root, scope)).replace('## Retired', '- `AC-005`: Results are paged.\n\n## Retired'));
  const frame = (number, from, owner, type, rerun) => `### Frame ${number}\n\n\`From\`: \`${from}\` \`Owner\`: \`${owner}\` `
    + `\`FailureType\`: \`${type}\`\n\`Reason\`: \`Paging was added.\` \`ResumeAt\`: \`${from}\` \`RerunThrough\`: \`${rerun}\`\n\n`;
  const rework = frame(1, 'AWAITING_USER_SIGNOFF', 'SCOPING', 'SCOPING', 'SYNCHRONIZING');
  // Put the workflow in a state after a given handoff, then run the stop hook.
  async function after({ state, kind, from, failureType = 'NONE', frames = [] }) {
    await editState(root, (text) => [['WorkflowState', state], ['Kind', kind], ['From', from], ['FailureType', failureType]]
      .reduce((current, [name, value]) => setField(current, name, value), text)
      .replace(/## Recovery[\s\S]*?(?=## Outstanding)/, `## Recovery\n\n\`Active\`: \`${frames.length > 0}\`\n\n${frames.join('')}`));
    return hook(root, 'stop', claudeStop(root, session, false));
  }
  const stale = (file) => new RegExp(`${file}: (is COMPLETE but )?does not account for AC-005`);
  const expectSentBack = (result, cited, spared) => {
    assert.equal(result.code, 2, result.stderr);
    for (const file of cited) assert.match(result.stderr, stale(file));
    for (const file of spared) assert.doesNotMatch(result.stderr, stale(file));
  };

  // During a rerun, the role that just took over is never blamed for its own stale record.
  let result = await after({ state: 'TESTING', kind: 'FORWARD', from: 'DEVELOPING', frames: [rework] });
  assert.equal(result.code, 0, result.stderr);
  // Running check directly still reports it to that role.
  hasProblem(await check(root), stale(report));
  // A FORWARD, RESUME, or FAILURE handoff was made by its From state's role, so that record is held.
  expectSentBack(await after({ state: 'REVIEWING_IMPLEMENTATION', kind: 'FORWARD', from: 'TESTING', frames: [rework] }),
    [report, spec], [review]);
  expectSentBack(await after({ state: 'REVIEWING_IMPLEMENTATION', kind: 'RESUME', from: 'TESTING', frames: [rework] }),
    [report, spec], [review]);
  expectSentBack(await after({ state: 'ARCHITECTING', kind: 'FAILURE', from: 'TESTING', failureType: 'ARCHITECTURE',
    frames: [rework, frame(2, 'TESTING', 'ARCHITECTING', 'ARCHITECTURE', 'NONE')] }), [report], [spec]);
  // Any agent may record a user rework, so its From state's record is not held:
  // here the user asks for an implementation change before Tester has started.
  result = await after({ state: 'DEVELOPING', kind: 'USER_REWORK', from: 'TESTING', failureType: 'IMPLEMENTATION',
    frames: [rework, frame(2, 'TESTING', 'DEVELOPING', 'IMPLEMENTATION', 'NONE')] });
  assert.equal(result.code, 0, result.stderr);
  // Nor is anything held in SCOPING, where Scoper may have changed the conditions since the handoff.
  result = await after({ state: 'SCOPING', kind: 'RESUME', from: 'DOCUMENTING', frames: [rework] });
  assert.equal(result.code, 0, result.stderr);

  // Outside recovery, every earlier state's record is held, not just the one handed off from...
  expectSentBack(await after({ state: 'DOCUMENTING', kind: 'FORWARD', from: 'REVIEWING_IMPLEMENTATION' }),
    [report, review, spec], [docs]);
  // ...and the current state's own record is still left to its owner, while check reports it.
  expectSentBack(await after({ state: 'REVIEWING_IMPLEMENTATION', kind: 'RESUME', from: 'TESTING' }), [report, spec], [review]);
  hasProblem(await check(root), stale(review));
}));

test('during a rerun, the design is held once Architect hands off, not while it is interrupted', () => project(async (root) => {
  const { scope, spec } = await standardCycle(root);
  // A user rework added AC-005 and the design does not cover it yet.
  await write(root, scope, (await read(root, scope)).replace('## Retired', '- `AC-005`: Results are paged.\n\n## Retired'));
  const frame = (number, from, owner, type, rerun) => `### Frame ${number}\n\n\`From\`: \`${from}\` \`Owner\`: \`${owner}\` `
    + `\`FailureType\`: \`${type}\`\n\`Reason\`: \`Paging was added.\` \`ResumeAt\`: \`${from}\` \`RerunThrough\`: \`${rerun}\`\n\n`;
  const rework = frame(1, 'AWAITING_USER_SIGNOFF', 'SCOPING', 'SCOPING', 'SYNCHRONIZING');
  const gap = new RegExp(`^${spec}: does not account for AC-005`);
  // Put the workflow in a state after a given handoff and report whether check finds the design gap.
  async function designGap({ state, kind, from, failureType = 'NONE', frames = [rework] }) {
    await editState(root, (text) => [['WorkflowState', state], ['Kind', kind], ['From', from], ['FailureType', failureType]]
      .reduce((current, [name, value]) => setField(current, name, value), text)
      .replace(/## Recovery[\s\S]*?(?=## Outstanding)/, `## Recovery\n\n\`Active\`: \`true\`\n\n${frames.join('')}`));
    return messages(await check(root)).some((line) => gap.test(line));
  }
  // While Architect is working on the rerun, the design is not held yet.
  assert.equal(await designGap({ state: 'ARCHITECTING', kind: 'RESUME', from: 'SCOPING' }), false);
  // Once Architect hands off forward or resumes, it must cover every current condition...
  assert.equal(await designGap({ state: 'DEVELOPING', kind: 'FORWARD', from: 'ARCHITECTING' }), true);
  const sent = await hook(root, 'stop', claudeStop(root, randomUUID(), false));
  assert.equal(sent.code, 2);
  assert.match(sent.stderr, new RegExp(`${spec}: does not account for AC-005`));
  assert.equal(await designGap({ state: 'TESTING', kind: 'RESUME', from: 'ARCHITECTING' }), true);
  // ...but a FAILURE from ARCHITECTING interrupted the design,
  assert.equal(await designGap({ state: 'AUDITING', kind: 'FAILURE', from: 'ARCHITECTING', failureType: 'PROJECT_CONTEXT',
    frames: [rework, frame(2, 'ARCHITECTING', 'AUDITING', 'PROJECT_CONTEXT', 'NONE')] }), false);
  // a user rework may be recorded by any agent,
  assert.equal(await designGap({ state: 'DEVELOPING', kind: 'USER_REWORK', from: 'ARCHITECTING', failureType: 'IMPLEMENTATION',
    frames: [rework, frame(2, 'ARCHITECTING', 'DEVELOPING', 'IMPLEMENTATION', 'NONE')] }), false);
  // and in SCOPING, Scoper may have changed the conditions since Architect handed off.
  assert.equal(await designGap({ state: 'SCOPING', kind: 'RESUME', from: 'ARCHITECTING' }), false);
}));

test('without stop_hook_active, stop falls back to sending the agent back once per turn', () => project(async (root) => {
  await write(root, 'docs/notes/broken.md', '<!-- STANDARDS\nArtifact: NOPE\nCycle: x-1\n-->\n');
  const session = randomUUID();
  assert.equal((await hook(root, 'stop', { session_id: session, turn_id: 't1' })).code, 2);
  assert.equal((await hook(root, 'stop', { session_id: session, turn_id: 't1' })).code, 0);
  assert.equal((await hook(root, 'stop', { session_id: session, turn_id: 't2' })).code, 2);
}));

test('stop always checks outside git', () => project(async (root) => {
  assert.equal((await hook(root, 'stop', { session_id: randomUUID() })).code, 0);
  await write(root, 'docs/notes/broken.md', '<!-- STANDARDS\nArtifact: NOPE\nCycle: x-1\n-->\n');
  assert.equal((await hook(root, 'stop', { session_id: randomUUID() })).code, 2);
}));

test('the stop message lists at most 15 problems', () => {
  const problems = Array.from({ length: 20 }, (_, index) => ({ file: `f${index}.md`, message: 'bad.' }));
  const message = stopMessage(problems);
  assert.equal(message.split('\n').filter((line) => line.startsWith('- f')).length, 15);
  assert.match(message, /\.\.\.and 5 more/);
});

// The hook commands must work as written: Codex runs them from the session's
// folder (possibly a subfolder) and they walk up to the project, Claude Code
// sets CLAUDE_PROJECT_DIR.
test('the installed hook commands reach the hook script', () => project(async (root) => {
  const codex = JSON.parse(await readFile(new URL('../templates/codex/.codex/hooks.json', import.meta.url), 'utf8'));
  const claude = JSON.parse(await readFile(new URL('../templates/claude/settings-hooks.json', import.meta.url), 'utf8'));
  await mkdir(path.join(root, 'src/deep'), { recursive: true });
  for (const [config, options] of [[codex, { cwd: path.join(root, 'src/deep') }],
    [claude, { cwd: path.join(root, 'src/deep'), env: { CLAUDE_PROJECT_DIR: root } }]]) {
    assert.deepEqual(Object.keys(config.hooks), ['Stop']);
    const [stop] = config.hooks.Stop;
    assert.match(stop.hooks[0].command, /hook\.mjs" stop$/);
    const allowed = await withStdin('sh', ['-c', stop.hooks[0].command], { ...options, input: { session_id: randomUUID() } });
    assert.equal(allowed.code, 0, allowed.stderr);
    // A problem in an uncommitted workflow file sends the agent back, so the command ran check.
    await write(root, 'docs/broken.md', '<!-- STANDARDS\nArtifact: NOPE\nCycle: x-1\n-->\n');
    const sent = await withStdin('sh', ['-c', stop.hooks[0].command], { ...options,
      input: { session_id: randomUUID(), stop_hook_active: false } });
    assert.equal(sent.code, 2, sent.stderr);
    assert.match(sent.stderr, /broken\.md: has a malformed provenance block/);
    await rm(path.join(root, 'docs/broken.md'));
  }
}, { withGit: true }));

// A project may be a subfolder of a larger repository, where the git root has
// no `.standards/`. Codex loads that subfolder's `.codex/hooks.json`, so the
// command must find the nearest project folder rather than the git root, and
// check must read git from the subfolder project.
test('the Codex hooks work in a project inside a larger repository', async () => {
  const repo = await realpath(await mkdtemp(path.join(os.tmpdir(), 'standards-monorepo-test-')));
  try {
    const root = path.join(repo, 'app');
    await write(root, 'app.py', 'print("hi")\n');
    await installProject({ projectRoot: root, clients: ['codex'] });
    await git(repo, 'init', '-q', '-b', 'main');
    await startCycle(root);
    const scope = await init(root, 'SCOPE');
    await write(root, scope, `${await read(root, scope)}\n# Search\n\n- \`AC-001\`: Users can search by name.\n`);
    await editState(root, (text) => setField(text, 'Scope', scope));
    await commit(repo);
    assert.deepEqual(messages(await check(root)), []);

    const hooks = JSON.parse(await read(root, '.codex/hooks.json')).hooks;
    const cwd = path.join(root, 'src/deep');
    await mkdir(cwd, { recursive: true });
    const run = (event, input) => withStdin('sh', ['-c', hooks[event][0].hooks[0].command], { cwd, input });

    // The Codex Stop payload: nothing changed since the commit, so the turn ends.
    const stop = { session_id: randomUUID(), turn_id: 't1', cwd: root, hook_event_name: 'Stop', stop_hook_active: false };
    const quiet = await run('Stop', stop);
    assert.equal(quiet.code, 0, quiet.stderr);
    // Deleting a committed condition is caught only by comparing with the last
    // commit, so this proves check ran and read git from inside the subfolder.
    await write(root, scope, (await read(root, scope)).replace(/^- `AC-001`.*\n/m, ''));
    const sent = await run('Stop', stop);
    assert.equal(sent.code, 2, sent.stderr);
    assert.match(sent.stderr, /AC-001 was in the last commit but is gone now/);
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test('paths through a symlink to the project are recognized', () => project(async (root) => {
  const link = path.join(await realpath(os.tmpdir()), `standards-link-${randomUUID()}`);
  await symlink(root, link);
  try {
    await startCycle(root);
    const scope = await init(root, 'SCOPE');
    const next = await tool(root, 'id', 'next', 'AC', path.join(link, scope));
    assert.equal(next.stdout.trim(), 'AC-001', next.stderr);
  } finally {
    await rm(link, { force: true });
  }
}));

// Node resolves symlinks for the running script but not for the path it was
// started with; the tools must still run instead of silently exiting.
test('tools run when started through a symlinked project path', () => project(async (root) => {
  const link = path.join(await realpath(os.tmpdir()), `standards-link-${randomUUID()}`);
  await symlink(root, link);
  try {
    const checked = await run(process.execPath, [path.join(link, '.standards/bin/check.mjs'), '--json'], link);
    assert.equal(JSON.parse(checked.stdout).ok, true);
    const cycle = await run(process.execPath, [path.join(link, '.standards/bin/cycle.mjs'), 'new', '--request', 'Search'], link);
    assert.match(cycle.stdout, /^search-\d{8}T\d{6}Z-[0-9a-f]{8}\n$/);
    await write(root, 'docs/broken.md', '<!-- STANDARDS\nArtifact: NOPE\nCycle: x-1\n-->\n');
    const sent = await withStdin(process.execPath, [path.join(link, '.standards/bin/hook.mjs'), 'stop'], {
      cwd: link, input: { cwd: link, session_id: randomUUID(), stop_hook_active: false },
    });
    assert.equal(sent.code, 2, sent.stderr);
  } finally {
    await rm(link, { force: true });
  }
}));

test('check reports baseline reconciliation and handoff problems', () => project(async (root) => {
  await startCycle(root, { state: 'AUDITING' });
  await editState(root, (text) => setField(text, 'Kind', 'FAILURE')
    .replace('`BaselineReconciliation`: `NONE`', '`BaselineReconciliation`:\n\n'
      + '- `SourceCycle`: `ghost-cycle-1` `Request`: `Old work.`\n'
      + '- `SourceCycle`: `ghost-cycle-1` `Request`: `Old work again.`'));
  const result = await check(root);
  hasProblem(result, /A FAILURE handoff needs a FailureType/);
  hasProblem(result, /BaselineReconciliation lists `ghost-cycle-1` more than once/);
  hasProblem(result, /BaselineReconciliation source `ghost-cycle-1` is not a cycle ID/);
  await editState(root, (text) => text.replace(/`BaselineReconciliation`:[\s\S]*?(?=\n## Handoff)/, '`BaselineReconciliation`: `SOMETIMES`\n'));
  hasProblem(await check(root), /BaselineReconciliation must be `NONE` or a list/);
}));

test('check reports Active Work paths that are missing or belong to another record', () => project(async (root) => {
  const id = await startCycle(root, { state: 'TESTING' });
  const report = await init(root, 'VERIFICATION');
  await editState(root, (text) => setField(setField(text, 'Scope', 'docs/scope/missing.md'), 'Architecture', report));
  const result = await check(root);
  hasProblem(result, /Active Work\.Scope points to docs\/scope\/missing\.md, which does not exist/);
  assert.ok(messages(result).some((line) => line.includes(
    `Active Work.Architecture points to ${report}, which is a VERIFICATION record for cycle \`${id}\``,
  )), JSON.stringify(result));
}));

test('check requires scope and design paths once a standard cycle has moved past them', () => project(async (root) => {
  await startCycle(root, { state: 'DEVELOPING' });
  const result = await check(root);
  hasProblem(result, /Active Work\.Scope is NONE, but this STANDARD cycle is already in DEVELOPING/);
  hasProblem(result, /Active Work\.Architecture is NONE, but this STANDARD cycle is already in DEVELOPING/);
}));

test('check reports expedited cycles outside their three states and duplicate records', () => project(async (root) => {
  const id = await startCycle(root, { state: 'TESTING', mode: 'EXPEDITED' });
  await editState(root, (text) => setField(text, 'Scope', 'docs/scope/x.md'));
  await write(root, 'docs/scope/x.md', '# Scope\n');
  const review = await init(root, 'REVIEW', '--kind', 'IMPLEMENTATION');
  await write(root, 'docs/elsewhere/second.md', `<!-- STANDARDS\nArtifact: REVIEW\nCycle: ${id}\nReviewKind: IMPLEMENTATION\n-->\n`);
  await write(root, review, (await read(root, review)).replace('`ReviewKind`: `IMPLEMENTATION`', '`ReviewKind`: `FINAL_DELIVERABLE`'));
  const result = await check(root);
  hasProblem(result, /TESTING is not part of an EXPEDITED cycle/);
  hasProblem(result, /An EXPEDITED cycle keeps Active Work\.Scope and Active Work\.Architecture as NONE/);
  hasProblem(result, /second\.md: is a second REVIEW IMPLEMENTATION record for this cycle; .*implementation\.md is the first/);
  hasProblem(result, /implementation\.md: shows ReviewKind `FINAL_DELIVERABLE` but its provenance block says `IMPLEMENTATION`/);
}));

test('records kept outside the runtime across a reinstall do not make check fail', () => project(async (root) => {
  const id = await startCycle(root, { state: 'DEVELOPING', mode: 'EXPEDITED' });
  const plan = await init(root, 'DEVELOPMENT');
  const kept = `archive/${id}.md`;
  await write(root, kept, await read(root, plan));
  const { uninstallProject } = await import('../lib/uninstaller.js');
  await uninstallProject({ projectRoot: root });
  await installProject({ projectRoot: root, clients: ['claude'] });
  // Uninstall deleted the record inside .standards/docs/; the copy outside stays.
  await assert.rejects(read(root, plan), { code: 'ENOENT' });
  assert.match(await read(root, kept), /Artifact: DEVELOPMENT/);
  assert.deepEqual(messages(await check(root)), []);
  // A new cycle still gets an ID that does not collide with the kept record.
  const { stdout } = await tool(root, 'cycle', 'new', '--request', 'Add user search');
  assert.notEqual(stdout.trim(), id);
}));

// A recovery frame for STATE.md, written the way the protocol shows it.
const frameText = (fields) => `### Frame 1\n\n\`From\`: \`${fields.From}\` \`Owner\`: \`${fields.Owner}\` \`FailureType\`: \`${fields.FailureType}\`\n`
  + `\`Reason\`: \`A defect.\` \`ResumeAt\`: \`${fields.ResumeAt}\` \`RerunThrough\`: \`${fields.RerunThrough ?? 'NONE'}\``;
const withFrame = (text, frame, heading = '### Frame 1') => text.replace('## Recovery\n\n`Active`: `false`',
  `## Recovery\n\n\`Active\`: \`true\`\n\n${frameText(frame).replace('### Frame 1', heading)}`);

test('check examines the cycle\'s fixed record paths directly', () => project(async (root) => {
  const { id, report } = await standardCycle(root);
  assert.deepEqual(messages(await check(root)), []);
  const text = await read(root, report);
  await write(root, report, `\n${text}`);
  hasProblem(await check(root), /does not start with a STANDARDS provenance block, so it cannot be this cycle's VERIFICATION record/);
  await write(root, report, text.replace(`Cycle: ${id}`, 'Cycle: old-cycle-1'));
  hasProblem(await check(root), /holds a VERIFICATION record for cycle `old-cycle-1`, not this cycle's VERIFICATION record/);
  // A gitignored record is still read and checked.
  await write(root, report, text.replace('| AC-002 | pending Documenter | pending |\n', ''));
  await write(root, '.gitignore', '.standards/docs/verification/\n');
  hasProblem(await check(root), new RegExp(`${report}: is COMPLETE but does not account for AC-002`));
}, { withGit: true }));

test('Reviewer entry requires the verification artifact type, not merely a file at its path', () => project(async (root) => {
  const { spec, report } = await standardCycle(root);
  // Architecture may be an unmarked project document. A misplaced architecture
  // record at the verification path must not satisfy the Tester completion gate.
  await write(root, spec, (await read(root, spec)).replace(/^<!--[\s\S]*?-->\s*/, ''));
  await write(root, report, (await read(root, report)).replace('Artifact: VERIFICATION', 'Artifact: ARCHITECTURE'));
  await editState(root, (text) => setField(setField(text, 'Kind', 'FORWARD'), 'From', 'TESTING'));
  hasProblem(await check(root), /must hold.*VERIFICATION.*holds ARCHITECTURE/);
  await editState(root, (text) => withFrame(text, { From: 'AWAITING_USER_SIGNOFF', Owner: 'SCOPING',
    FailureType: 'SCOPING', ResumeAt: 'AWAITING_USER_SIGNOFF', RerunThrough: 'SYNCHRONIZING' }));
  hasProblem(await check(root), /must hold.*VERIFICATION.*holds ARCHITECTURE/);
  const stop = await hook(root, 'stop', claudeStop(root, randomUUID(), false));
  assert.equal(stop.code, 2, stop.stderr);
  assert.match(stop.stderr, /must hold.*VERIFICATION.*holds ARCHITECTURE/);
}));

test('a record\'s Status must be IN_PROGRESS, BLOCKED, or COMPLETE', () => project(async (root) => {
  const { report } = await standardCycle(root);
  const reportProblems = async () => messages(await check(root)).filter((line) => line.startsWith(`${report}:`));
  // One mistake, one message: the phase rule does not repeat an invalid or unfilled Status.
  await fillHeader(root, report, { Status: 'Complete' });
  assert.deepEqual(await reportProblems(), [`${report}: Status \`Complete\` must be IN_PROGRESS, BLOCKED, or COMPLETE.`]);
  await fillHeader(root, report, { Status: 'IN_PROGRESS | BLOCKED | COMPLETE' });
  assert.equal((await reportProblems()).length, 1);
}));

test('Active Work paths written with ./ name the same files', () => project(async (root) => {
  const { scope, spec, plan } = await standardCycle(root);
  await editState(root, (text) => [['Scope', `./${scope}`], ['Architecture', `./${spec}`], ['Development', `./${plan}`]]
    .reduce((current, [name, value]) => setField(current, name, value), text));
  assert.deepEqual(messages(await check(root)), []);
}));

test('invocation discovery agrees with checker on normalized Development references', () => project(async (root) => {
  const { plan } = await standardCycle(root);
  await fillHeader(root, plan, { Mode: 'STEPWISE' });
  const references = [plan, './' + plan, plan.replace('/development/', '/development/../development/')];
  const observed = [];
  for (const reference of references) {
    await editStateFields(root, { Development: reference });
    const checked = await check(root);
    assert.equal(checked.code, 0, JSON.stringify(messages(checked)));
    assert.deepEqual(messages(checked), []);
    const before = await Promise.all([read(root, '.standards/STATE.md'), read(root, plan)]);
    const invocation = await tool(root, 'invocation', 'developer', '--client', 'claude', '--json');
    assert.equal(invocation.code, 0, invocation.stderr);
    const result = JSON.parse(invocation.stdout);
    observed.push({
      reference, complete: result.complete,
      mode: result.groups.find((item) => item.id === 'collaboration').selected.value,
      style: result.userStyles.savedValue.value, locked: result.userStyles.locked,
    });
    assert.deepEqual(await Promise.all([read(root, '.standards/STATE.md'), read(root, plan)]), before);
  }
  assert.deepEqual(observed, references.map((reference) => ({
    reference, complete: true, mode: 'STEPWISE', style: 'NONE', locked: 'true',
  })));
}));

for (const client of ['codex', 'claude']) {
  for (const cycleMode of ['STANDARD', 'EXPEDITED']) {
    test('record style selectors round-trip through discovery and checker: ' + cycleMode + '/' + client, () => project(async (root) => {
      let plan;
      if (cycleMode === 'STANDARD') {
        const cycle = await standardCycle(root);
        plan = cycle.plan;
        await rm(path.join(root, cycle.report));
        await editStateFields(root, { WorkflowState: 'DEVELOPING', Kind: 'FORWARD', From: 'ARCHITECTING',
          Reason: 'Architecture completed' });
        await write(root, plan, (await read(root, plan)).replaceAll('`Status`: `DONE`', '`Status`: `PENDING`'));
      } else {
        await startCycle(root, { state: 'DEVELOPING', mode: cycleMode });
        plan = await init(root, 'DEVELOPMENT');
        await write(root, plan, await read(root, plan) + '\n## Build Steps\n\n### DEV-001 — Fix\n\n'
          + '`Status`: `PENDING` `Depends On`: `NONE`\n`Acceptance`: `EXPEDITED_REQUEST`\n');
        await editStateFields(root, { Development: plan });
      }
      await fillHeader(root, plan, { Mode: 'STEPWISE', Status: 'PROPOSED', 'User Style': 'NONE', 'User Style Locked': 'false' });
      const baseline = await read(root, plan);
      const valid = await check(root);
      assert.equal(valid.code, 0, JSON.stringify(messages(valid)));
      assert.deepEqual(messages(valid), []);

      const directory = '.standards/user-styles/developer/';
      const files = ['<formal>.md', 'team | compact.md', 'alice.md', 'tony.md', 'tony.md.md', 'team|compact.md', ' .md'];
      for (const file of files) await write(root, directory + file, 'PRIVATE STYLE CONTENT: ' + file);
      const inspected = ['.standards/STATE.md', plan, ...files.map((file) => directory + file)];
      const snapshot = () => Promise.all(inspected.map(async (file) => [
        file, (await stat(path.join(root, file))).mtimeMs, await read(root, file),
      ]));
      const discover = async () => {
        const before = await snapshot();
        const invocation = await tool(root, 'invocation', 'developer', '--client', client, '--json');
        assert.equal(invocation.code, 0, invocation.stderr);
        assert.doesNotMatch(invocation.stdout, /PRIVATE STYLE CONTENT/);
        const result = JSON.parse(invocation.stdout);
        assert.equal(result.client, client);
        assert.deepEqual(await snapshot(), before);
        return result;
      };
      const save = async (style, status = 'PROPOSED', locked = 'false') => {
        await write(root, plan, baseline);
        await fillHeader(root, plan, { 'User Style': style, Status: status, 'User Style Locked': locked });
      };
      const inventory = await discover();
      assert.equal(inventory.complete, true, JSON.stringify(inventory.diagnostics));
      assert.equal(inventory.userStyles.savedValue.value, 'NONE');
      assert.equal(inventory.userStyles.locked, 'false');

      // Persist every advertised choice, then validate with both installed tools.
      const failures = [];
      for (const option of inventory.userStyles.options.filter((item) => item.selector !== null)) {
        await save(option.selector);
        const checked = await check(root);
        const resumed = await discover();
        if (checked.code !== 0 || !resumed.complete || resumed.userStyles.selected.value !== option.id
            || resumed.userStyles.savedValue.value !== option.selector) {
          failures.push({ selector: option.selector, problems: messages(checked), selected: resumed.userStyles.selected });
        }
      }
      assert.deepEqual(failures, []);
      const option = (id) => inventory.userStyles.options.find((item) => item.id === id);
      assert.equal(option('<formal>').selector, '<formal>.md');
      assert.equal(option(' ').selector, ' .md');
      assert.equal(option('team | compact').selector, null);
      assert.equal(option('team | compact').selectorReason, 'no record-compatible name');
      assert.equal(option('alice').selector, 'alice');
      assert.equal(option('tony').selector, 'tony');
      assert.equal(option('tony.md').selector, 'tony.md.md');
      assert.equal(option('team|compact').selector, 'team|compact');

      // Approval/resume reads must retain the working selector, including on reapproval.
      for (const [selector, display] of [['<formal>.md', '<formal>'], ['tony.md.md', 'tony.md'], ['NONE', 'NONE']]) {
        for (const status of ['APPROVED', 'IN_PROGRESS', 'PROPOSED']) {
          await save(selector, status, 'true');
          const before = await snapshot();
          const checked = await check(root);
          assert.equal(checked.code, 0, JSON.stringify(messages(checked)));
          const resumed = await discover();
          assert.equal(resumed.complete, true, JSON.stringify(resumed.diagnostics));
          assert.equal(resumed.userStyles.savedValue.value, selector);
          assert.equal(resumed.userStyles.selected.value, display);
          assert.equal(resumed.userStyles.locked, 'true');
          assert.deepEqual(await snapshot(), before);
        }
      }

      // Existing unusable or genuinely unfilled values are rejected, never rewritten.
      for (const selector of ['<formal>', 'team | compact', 'team | compact.md', '<identifier>', 'NONE | <identifier>']) {
        await save(selector, 'APPROVED', 'true');
        const before = await snapshot();
        const checked = await check(root);
        hasProblem(checked, /field `User Style` still shows the template's choices/);
        assert.equal(checked.code, 1);
        const resumed = await discover();
        assert.equal(resumed.complete, false);
        assert.equal(resumed.userStyles.selected.status, 'unknown');
        assert.equal(resumed.userStyles.locked, 'true');
        assert.deepEqual(await snapshot(), before);
      }
      await save('NONE');
      for (const mode of ['<mode>', 'AUTONOMOUS | STEPWISE | CODE_WITH_ME']) {
        await fillHeader(root, plan, { Mode: mode });
        hasProblem(await check(root), /field `Mode` still shows the template's choices/);
        const unresolved = await discover();
        assert.equal(unresolved.groups[0].selected.status, 'unknown');
      }
      await save('NONE');
      const before = await snapshot();
      const summary = await tool(root, 'invocation', 'developer', '--client', client);
      assert.equal(summary.code, 0, summary.stderr);
      assert.match(summary.stdout, /<formal> \(invoke as <formal>\.md\)/);
      assert.match(summary.stdout, /team \| compact \(no record-compatible name\)/);
      assert.doesNotMatch(summary.stdout, /team \| compact \(ambiguous name\)/);
      assert.deepEqual(await snapshot(), before);
    }, { clients: [client] }));
  }
}

test('a gitignored plan still gets its record checks', () => project(async (root) => {
  const { plan } = await standardCycle(root);
  await write(root, '.gitignore', '.standards/docs/development/\n');
  await fillHeader(root, plan, { Mode: 'AUTONOMOUS | STEPWISE | CODE_WITH_ME' });
  hasProblem(await check(root), new RegExp(`${plan}: field \`Mode\` still shows the template's choices`));
}, { withGit: true }));

test('recovery frames must be headed exactly ### Frame N', () => project(async (root) => {
  await standardCycle(root);
  await editState(root, (text) => withFrame(text, { From: 'TESTING', Owner: 'REVIEWING_IMPLEMENTATION', FailureType: 'REVIEW', ResumeAt: 'TESTING' },
    '### Frame 1 (review defect)').replace('`Active`: `true`', '`Active`: `false`'));
  const result = await check(root);
  hasProblem(result, /Recovery\.Active is `false` but there is 1 frame/);
  hasProblem(result, /found `Frame 1 \(review defect\)` in position 1/);
}));

test('acceptance conditions may be written in common list forms', () => project(async (root) => {
  const { scope } = await standardCycle(root);
  await write(root, scope, (await read(root, scope))
    .replace('- `AC-001`: Users can search by name.', '- [ ] **AC-001**: Users can search by name.\n- See AC-001 for the search rules.')
    .replace('- `AC-002`: The guide explains search.', '1. AC-002 — The guide explains search.')
    .replace('## Retired Acceptance Identifiers\n\n- `AC-003`: Retired because it was split.',
      '## Retired Acceptance Identifiers ##\n\n- `AC-003`, `AC-004`: Replaced by AC-001 and AC-002.'));
  assert.deepEqual(messages(await check(root)), []);
}));

test('check reports unreadable workflow files instead of crashing', () => project(async (root) => {
  await standardCycle(root);
  await mkdir(path.join(root, 'docs/specs/area'), { recursive: true });
  await editState(root, (text) => setField(text, 'Architecture', 'docs/specs/area'));
  hasProblem(await check(root), /Active Work\.Architecture points to docs\/specs\/area, which is a folder, not a file/);
  // An unreadable Markdown file elsewhere is a note, not a crash.
  await write(root, 'notes/private.md', 'x\n');
  await chmod(path.join(root, 'notes/private.md'), 0o000);
  const result = await check(root);
  assert.ok(result.notes.some((note) => note.includes('Could not read notes/private.md')), result.notes.join('\n'));
}));

test('STATE.md accepts backticks in values, a byte order mark, and fields in any order', () => project(async (root) => {
  await standardCycle(root);
  await editState(root, (text) => `\uFEFF${text
    .replace('`Request`: `Add user search`', '`Request`: ``Add a `--json` flag``')
    .replace('`BlockedOn`: `NONE`', '')
    .replace('`BaselineReconciliation`: `NONE`', '`BaselineReconciliation`: `NONE`\n\n`BlockedOn`: `NONE`')}`);
  assert.deepEqual(messages(await check(root)), []);
  assert.equal((await tool(root, 'artifact', 'init', 'DOCUMENTATION')).code, 0);
}));

test('a plan step\'s own fields are not overridden by later prose', () => project(async (root) => {
  const { plan } = await standardCycle(root);
  await write(root, plan, `${await read(root, plan)}\nThe endpoint answers with \`Status\`: \`200\`.\n`);
  assert.deepEqual(messages(await check(root)), []);
}));

test('once a phase is passed, its record and the plan must be complete', () => project(async (root) => {
  const { plan, report } = await standardCycle(root);
  await fillHeader(root, report, { Status: 'IN_PROGRESS' });
  hasProblem(await check(root), /must be COMPLETE once the cycle has passed TESTING; its Status is `IN_PROGRESS`/);
  // Before the phase is passed, an unfinished record is fine.
  await editState(root, (text) => setField(text, 'WorkflowState', 'TESTING'));
  assert.equal(messages(await check(root)).some((line) => line.includes('once the cycle has passed')), false);
  await fillHeader(root, report, { Status: 'COMPLETE' });
  await editState(root, (text) => setField(text, 'WorkflowState', 'DOCUMENTING'));
  hasProblem(await check(root), /implementation\.md: must exist once the cycle has passed REVIEWING_IMPLEMENTATION/);
  await fillHeader(root, plan, { Status: 'IN_PROGRESS' });
  hasProblem(await check(root), /The plan must be COMPLETE once the cycle has passed DEVELOPING; its Status is `IN_PROGRESS`/);
  await editState(root, (text) => setField(text, 'Development', 'NONE'));
  hasProblem(await check(root), /Active Work\.Development is NONE, but this cycle is already in DOCUMENTING/);
}));

test('an unfinished documentation record may carry on past DOCUMENTING until sign-off', () => project(async (root) => {
  const { id } = await standardCycle(root);
  // A Documenter Corrective Return hands a fix back to final review while its record stays IN_PROGRESS.
  const implementation = await init(root, 'REVIEW', '--kind', 'IMPLEMENTATION');
  await fillHeader(root, implementation, { Status: 'COMPLETE' });
  await write(root, implementation, `${await read(root, implementation)}\nAC-001 AC-002\n`);
  const documentation = await init(root, 'DOCUMENTATION');
  await fillHeader(root, documentation, { Status: 'IN_PROGRESS', Collaboration: 'AUTONOMOUS', Target: 'ACTIVE_CHANGE',
    'Target Detail': 'active cycle', 'User Style': 'NONE' });
  await editState(root, (text) => setField(text, 'WorkflowState', 'REVIEWING_FINAL'));
  assert.equal(messages(await check(root)).some((line) => line.startsWith(`.standards/docs/documentation/${id}.md:`)), false);
  // By sign-off it must be complete.
  await editState(root, (text) => setField(text, 'WorkflowState', 'AWAITING_USER_SIGNOFF'));
  hasProblem(await check(root), /documentation\/.*: must be COMPLETE once the cycle has passed DOCUMENTING/);
}));

test('an expedited cycle needs its plan and implementation review before sign-off', () => project(async (root) => {
  await startCycle(root, { state: 'DEVELOPING', mode: 'EXPEDITED' });
  const plan = await init(root, 'DEVELOPMENT');
  await fillHeader(root, plan, { Mode: 'AUTONOMOUS', 'User Style': 'NONE', 'User Style Locked': 'true', Status: 'COMPLETE' });
  await write(root, plan, `${await read(root, plan)}\n## Build Steps\n\n### DEV-001 — Fix\n\n`
    + '`Status`: `DONE` `Depends On`: `NONE`\n`Acceptance`: `EXPEDITED_REQUEST`\n');
  await editState(root, (text) => setField(setField(text, 'Development', plan), 'WorkflowState', 'AWAITING_USER_SIGNOFF'));
  hasProblem(await check(root), /implementation\.md: must exist once the cycle has passed REVIEWING_IMPLEMENTATION/);
  const review = await init(root, 'REVIEW', '--kind', 'IMPLEMENTATION');
  await fillHeader(root, review, { Status: 'COMPLETE' });
  assert.deepEqual(messages(await check(root)), []);
}));

test('shorter readiness requires a separate eligible closure assessment on forward and recovery returns', () => project(async (root) => {
  const { review } = await implementationReviewedCycle(root);
  const complete = await read(root, review);
  for (const kind of ['FORWARD', 'RESUME']) {
    await editStateFields(root, { Kind: kind });
    await write(root, review, complete.split('## Implementation-Reviewed Closure')[0]);
    hasProblem(await check(root), /requires an Implementation-Reviewed Closure assessment/);
    await write(root, review, setField(complete, 'Eligibility', 'NOT_ASSESSED'));
    hasProblem(await check(root), /requires Closure Eligibility ELIGIBLE/);
    await write(root, review, complete);
    assert.deepEqual(messages(await check(root)), []);
  }
}));

test('a passing ordinary review can remain ineligible for shorter closure', () => project(async (root) => {
  const { review, scope, spec, report, plan } = await implementationReviewedCycle(root);
  await write(root, scope, (await read(root, scope)).replace('Users see search results.', 'The guide explains search.'));
  await write(root, spec, (await read(root, spec)).replace('Search-results component.', 'No architectural impact; Documenter owns it.'));
  await write(root, report, (await read(root, report)).replace('test/search-results.test.js | passed', 'pending Documenter | pending'));
  await write(root, plan, (await read(root, plan)).replace('`Acceptance`: `AC-002`', '`Acceptance`: `AC-001`'));
  await editStateFields(root, { WorkflowState: 'REVIEWING_IMPLEMENTATION', From: 'TESTING' });
  await fillHeader(root, review, { Eligibility: 'INELIGIBLE',
    'Unmet Requirements': 'Documenter must supply required guide evidence for AC-002.' });
  assert.deepEqual(messages(await check(root)), []);
  await editStateFields(root, { WorkflowState: 'AWAITING_USER_SIGNOFF', From: 'REVIEWING_IMPLEMENTATION' });
  hasProblem(await check(root), /requires Closure Eligibility ELIGIBLE/);
  // From Reviewer the user can choose FULL_DELIVERABLE in the same state;
  // Reviewer can then hand off normally with the historical ineligible closure.
  await editStateFields(root, { WorkflowState: 'DOCUMENTING', CompletionPolicy: 'FULL_DELIVERABLE',
    Kind: 'FORWARD', From: 'REVIEWING_IMPLEMENTATION', Reason: 'Implementation review passed; user selected full completion.' });
  assert.deepEqual(messages(await check(root)), []);
}));

test('a final review report cannot supply implementation closure eligibility', () => project(async (root) => {
  const { review } = await implementationReviewedCycle(root);
  const text = await read(root, review);
  await write(root, review, text.split('## Implementation-Reviewed Closure')[0]);
  const final = await init(root, 'REVIEW', '--kind', 'FINAL_DELIVERABLE');
  await fillHeader(root, final, { Status: 'COMPLETE' });
  await write(root, final, `${await read(root, final)}\n## Implementation-Reviewed Closure${text.split('## Implementation-Reviewed Closure')[1]}`);
  const result = await check(root);
  hasProblem(result, /implementation.md: IMPLEMENTATION_REVIEWED sign-off readiness requires an Implementation-Reviewed Closure assessment/);
  hasProblem(result, /final-deliverable.md: Implementation-Reviewed Closure belongs only in the implementation review report/);
}));

test('shorter readiness rejects eligible claims with missing evidence or unresolved owner work', () => project(async (root) => {
  const { review } = await implementationReviewedCycle(root);
  const original = await read(root, review);
  for (const name of ['User Choice', 'Assessed Inputs', 'Evidence', 'Omitted Guarantees']) {
    await write(root, review, setField(original, name, 'NONE'));
    hasProblem(await check(root), new RegExp(`ELIGIBLE closure requires ${name}, not NONE`));
  }
  await write(root, review, setField(original, 'Unmet Requirements', 'Documenter correction remains.'));
  hasProblem(await check(root), /ELIGIBLE closure requires Unmet Requirements NONE/);
}));

test('completion policies must match the cycle mode and initialization state', () => project(async (root) => {
  for (const policy of ['FULL_DELIVERABLE', 'IMPLEMENTATION_REVIEWED']) {
    await editStateFields(root, { CompletionPolicy: policy });
    hasProblem(await check(root), /No cycle has started, so Active Work.CompletionPolicy must be NONE/);
  }
  await editStateFields(root, { CompletionPolicy: 'NONE' });
  await startCycle(root, { state: 'AUDITING' });
  await editStateFields(root, { CompletionPolicy: 'NONE' });
  hasProblem(await check(root), /CompletionPolicy NONE is not valid with CycleMode STANDARD/);
  for (const policy of ['FULL_DELIVERABLE', 'IMPLEMENTATION_REVIEWED']) {
    await editStateFields(root, { CompletionPolicy: policy });
    assert.deepEqual(messages(await check(root)), []);
    await editStateFields(root, { CycleMode: 'EXPEDITED', WorkflowState: 'DEVELOPING' });
    hasProblem(await check(root), /is not valid with CycleMode EXPEDITED/);
    await editStateFields(root, { CycleMode: 'STANDARD', WorkflowState: 'AUDITING' });
  }
  await editStateFields(root, { CycleMode: 'EXPEDITED', WorkflowState: 'DEVELOPING', CompletionPolicy: 'NONE' });
  assert.deepEqual(messages(await check(root)), []);
  // A terminal snapshot retains its last policy without an active cycle mode.
  for (const policy of ['NONE', 'FULL_DELIVERABLE', 'IMPLEMENTATION_REVIEWED']) {
    await editStateFields(root, { CycleMode: 'UNSET', WorkflowState: 'SIGNED_OFF', CompletionPolicy: policy,
      Kind: 'SIGNOFF', From: 'AWAITING_USER_SIGNOFF' });
    assert.deepEqual(messages(await check(root)), []);
  }
}));

for (const mode of ['GREENFIELD', 'BROWNFIELD']) {
  test(`${mode} standard entry supports either completion policy`, () => project(async (root) => {
    const state = mode === 'GREENFIELD' ? 'SCOPING' : 'AUDITING';
    await write(root, '.standards/MODE.md', setField(await read(root, '.standards/MODE.md'), 'ProjectMode', mode));
    await editStateFields(root, { WorkflowState: state });
    await startCycle(root, { state });
    for (const policy of ['FULL_DELIVERABLE', 'IMPLEMENTATION_REVIEWED']) {
      await editStateFields(root, { CompletionPolicy: policy });
      assert.deepEqual(messages(await check(root)), []);
    }
  }));
}

test('shorter completion requires verification and implementation review but not the three omitted records', () => project(async (root) => {
  const { report, review } = await implementationReviewedCycle(root);
  assert.deepEqual(messages(await check(root)), []);
  for (const file of [report, review]) {
    const text = await read(root, file);
    await rm(path.join(root, file));
    hasProblem(await check(root), /must exist once the cycle has passed (TESTING|REVIEWING_IMPLEMENTATION)/);
    await write(root, file, text);
  }
  // FULL_DELIVERABLE still requires all three downstream records.
  await editStateFields(root, { CompletionPolicy: 'FULL_DELIVERABLE', From: 'SYNCHRONIZING' });
  const result = await check(root);
  for (const phase of ['DOCUMENTING', 'REVIEWING_FINAL', 'SYNCHRONIZING']) {
    hasProblem(result, new RegExp(`must exist once the cycle has passed ${phase}`));
  }
}));

test('shorter completion cannot bypass full implementation, verification, or acceptance coverage', () => project(async (root) => {
  const { plan, report, review } = await implementationReviewedCycle(root);
  for (const [file, fields, expected] of [
    [plan, { Status: 'IN_PROGRESS' }, /The plan must be COMPLETE/],
    [report, { Status: 'IN_PROGRESS' }, /must be COMPLETE once the cycle has passed TESTING/],
    [report, { 'Assessment Purpose': 'CORRECTION', 'Assessment Target': 'one case' }, /A COMPLETE report requires Assessment Purpose FULL/],
    [review, { Status: 'BLOCKED' }, /must be COMPLETE once the cycle has passed REVIEWING_IMPLEMENTATION/],
  ]) {
    const text = await read(root, file);
    await fillHeader(root, file, fields);
    hasProblem(await check(root), expected);
    await write(root, file, text);
  }
  await write(root, review, (await read(root, review)).replaceAll('AC-002', ''));
  hasProblem(await check(root), /is COMPLETE but does not account for AC-002/);
}));

test('shorter completion still validates existing records from omitted phases', () => project(async (root) => {
  const { id } = await implementationReviewedCycle(root);
  const file = `.standards/docs/documentation/${id}.md`;
  await write(root, file, '# Unmarked documentation record\n');
  hasProblem(await check(root), /does not start with a STANDARDS provenance block/);
  await rm(path.join(root, file));
  const final = await init(root, 'REVIEW', '--kind', 'FINAL_DELIVERABLE');
  await fillHeader(root, final, { Status: 'COMPLETE' });
  await write(root, final, `${await read(root, final)}\nAC-001 only.\n`);
  hasProblem(await check(root), /final-deliverable.md: is COMPLETE but does not account for AC-002/);
}));

test('shorter completion permits corrective downstream owners only through recovery', () => project(async (root) => {
  await implementationReviewedCycle(root);
  for (const [state, failure] of [['DOCUMENTING', 'DOCUMENTATION'], ['REVIEWING_FINAL', 'REVIEW'], ['SYNCHRONIZING', 'SYNCHRONIZATION']]) {
    await editStateFields(root, { WorkflowState: state, Kind: 'FAILURE', From: 'REVIEWING_IMPLEMENTATION', FailureType: failure });
    const original = await read(root, '.standards/STATE.md');
    hasProblem(await check(root), new RegExp(`${state} is outside the normal IMPLEMENTATION_REVIEWED route`));
    await editState(root, (text) => withFrame(text, { From: 'REVIEWING_IMPLEMENTATION', Owner: state,
      FailureType: failure, ResumeAt: 'REVIEWING_IMPLEMENTATION' }));
    assert.deepEqual(messages(await check(root)), []);
    await write(root, '.standards/STATE.md', original);
  }
}));

test('completion-change handoffs accept late selection and withdrawal with current completed records', () => project(async (root) => {
  const { review, report } = await implementationReviewedCycle(root);
  for (const fields of [
    { WorkflowState: 'REVIEWING_IMPLEMENTATION', From: 'DOCUMENTING', CompletionPolicy: 'IMPLEMENTATION_REVIEWED' },
    { WorkflowState: 'DOCUMENTING', From: 'AWAITING_USER_SIGNOFF', CompletionPolicy: 'FULL_DELIVERABLE' },
  ]) {
    await editStateFields(root, { ...fields, Kind: 'COMPLETION_CHANGE', Reason: 'User changed the completion policy.' });
    assert.deepEqual(messages(await check(root)), []);
    const reviewText = await read(root, review);
    await fillHeader(root, review, { Status: 'IN_PROGRESS' });
    if (fields.WorkflowState === 'REVIEWING_IMPLEMENTATION') {
      assert.deepEqual(messages(await check(root)), []); // Reviewer may reopen its own assessment.
    } else {
      hasProblem(await check(root), /must be COMPLETE for a COMPLETION_CHANGE handoff/);
    }
    await write(root, review, reviewText);
    const verificationText = await read(root, report);
    await fillHeader(root, report, { Status: 'IN_PROGRESS' });
    hasProblem(await check(root), /must be COMPLETE once the cycle has passed TESTING/);
    await write(root, report, verificationText);
  }
}));

test('completion-change handoffs reject wrong routes, modes, and failure semantics', () => project(async (root) => {
  await implementationReviewedCycle(root);
  await editStateFields(root, { WorkflowState: 'REVIEWING_IMPLEMENTATION', From: 'DOCUMENTING',
    Kind: 'COMPLETION_CHANGE', Reason: 'User selected IMPLEMENTATION_REVIEWED.' });
  const original = await read(root, '.standards/STATE.md');
  for (const [fields, expected] of [
    [{ From: 'TESTING' }, /COMPLETION_CHANGE requires an active STANDARD cycle/],
    [{ WorkflowState: 'AWAITING_USER_SIGNOFF' }, /COMPLETION_CHANGE requires an active STANDARD cycle/],
    [{ WorkflowState: 'SIGNED_OFF', CycleMode: 'UNSET' }, /COMPLETION_CHANGE requires an active STANDARD cycle/],
    [{ CompletionPolicy: 'NONE' }, /CompletionPolicy NONE is not valid with CycleMode STANDARD/],
    [{ CycleMode: 'EXPEDITED', CompletionPolicy: 'NONE' }, /COMPLETION_CHANGE requires an active STANDARD cycle/],
    [{ FailureType: 'REVIEW' }, /COMPLETION_CHANGE handoff requires FailureType NONE/],
    [{ Reason: 'NONE' }, /COMPLETION_CHANGE handoff needs a reason/],
  ]) {
    await editStateFields(root, fields);
    hasProblem(await check(root), expected);
    await write(root, '.standards/STATE.md', original);
  }
  for (const section of ['Recovery', 'Outstanding Obligations']) {
    await editState(root, (text) => text.replace(`## ${section}\n\n\`Active\`: \`false\``, `## ${section}\n\n\`Active\`: \`true\``));
    hasProblem(await check(root), /COMPLETION_CHANGE requires inactive recovery with an empty stack and no outstanding obligations/);
    await write(root, '.standards/STATE.md', original);
  }
  await editState(root, (text) => withFrame(text, { From: 'REVIEWING_IMPLEMENTATION', Owner: 'REVIEWING_IMPLEMENTATION',
    FailureType: 'REVIEW', ResumeAt: 'REVIEWING_IMPLEMENTATION' }).replace('## Recovery\n\n`Active`: `true`', '## Recovery\n\n`Active`: `false`'));
  hasProblem(await check(root), /COMPLETION_CHANGE requires inactive recovery with an empty stack and no outstanding obligations/);
}));

test('a saved completion-change handoff permits later same-state choices and receiving-role progress', () => project(async (root) => {
  const { review } = await implementationReviewedCycle(root);
  await editStateFields(root, { WorkflowState: 'REVIEWING_IMPLEMENTATION', From: 'DOCUMENTING',
    Kind: 'COMPLETION_CHANGE', Reason: 'User selected IMPLEMENTATION_REVIEWED.' });
  await editStateFields(root, { CompletionPolicy: 'FULL_DELIVERABLE', BlockedOn: 'Reviewer needs an answer.' });
  await fillHeader(root, review, { Status: 'BLOCKED' });
  assert.deepEqual(messages(await check(root)), []);
  const text = await read(root, review);
  await rm(path.join(root, review));
  hasProblem(await check(root), /must exist for a COMPLETION_CHANGE handoff/);
  await write(root, review, text);
  await fillHeader(root, review, { Status: 'COMPLETE' });
  await editStateFields(root, { WorkflowState: 'DOCUMENTING', From: 'AWAITING_USER_SIGNOFF',
    Reason: 'User withdrew the shorter policy.', BlockedOn: 'Documenter needs approval for its target.' });
  assert.deepEqual(messages(await check(root)), []);
}));

test('shorter sign-off readiness rejects blockers, unresolved baseline, recovery, and pending cadence', () => project(async (root) => {
  await implementationReviewedCycle(root);
  const original = await read(root, '.standards/STATE.md');
  for (const [fields, expected] of [
    [{ BlockedOn: 'Need an answer.' }, /AWAITING_USER_SIGNOFF requires Active Work.BlockedOn NONE/],
    [{ PendingVerificationCadence: 'INCREMENTAL' }, /Clear pending cadence intent/],
  ]) {
    await editStateFields(root, fields);
    hasProblem(await check(root), expected);
    await write(root, '.standards/STATE.md', original);
  }
  await editState(root, (text) => text.replace('`BaselineReconciliation`: `NONE`',
    '`BaselineReconciliation`:\n\n- `SourceCycle`: `old-work-20261001T120000Z-1234abcd`\n  `Request`: `Old work.`'));
  hasProblem(await check(root), /cannot await sign-off while BaselineReconciliation is unresolved/);
  await write(root, '.standards/STATE.md', original);
  await editState(root, (text) => withFrame(text, { From: 'AWAITING_USER_SIGNOFF', Owner: 'REVIEWING_IMPLEMENTATION',
    FailureType: 'REVIEW', ResumeAt: 'AWAITING_USER_SIGNOFF', RerunThrough: 'REVIEWING_IMPLEMENTATION' }));
  hasProblem(await check(root), /AWAITING_USER_SIGNOFF requires an empty recovery stack/);
  await write(root, '.standards/STATE.md', original);
  // A finished recovery may return to sign-off with the shorter requirements.
  await editStateFields(root, { Kind: 'RESUME', From: 'REVIEWING_IMPLEMENTATION' });
  assert.deepEqual(messages(await check(root)), []);
}));

test('direct shorter sign-off returns require the returning downstream owner to have passed its full gate', () => project(async (root) => {
  const { id } = await implementationReviewedCycle(root);
  for (const [phase, type, kind, relative] of [
    ['DOCUMENTING', 'DOCUMENTATION', null, `.standards/docs/documentation/${id}.md`],
    ['REVIEWING_FINAL', 'REVIEW', 'FINAL_DELIVERABLE', `.standards/docs/reviews/${id}/final-deliverable.md`],
    ['SYNCHRONIZING', 'SYNCHRONIZATION', null, `.standards/docs/synchronization/${id}.md`],
  ]) {
    await editStateFields(root, { Kind: 'RESUME', From: phase });
    hasProblem(await check(root), /must exist and be COMPLETE for a direct recovery return to sign-off/);
    const file = await init(root, type, ...(kind ? ['--kind', kind] : []));
    assert.equal(file, relative);
    await fillHeader(root, file, { Status: 'IN_PROGRESS', Collaboration: 'AUTONOMOUS', Target: 'ACTIVE_CHANGE',
      'Target Detail': 'active cycle', 'User Style': 'NONE' });
    await write(root, file, `${await read(root, file)}\nAC-001 and AC-002 assessed for this owned gate.\n`);
    for (const Status of ['IN_PROGRESS', 'BLOCKED']) {
      await fillHeader(root, file, { Status });
      hasProblem(await check(root), /must be COMPLETE for a direct recovery return to sign-off; its Status/);
    }
    await fillHeader(root, file, { Status: 'COMPLETE' });
    assert.deepEqual(messages(await check(root)), []);
  }
}));

test('shorter reconciliation correction returns through Reviewer without inventing final-review completion', () => project(async (root) => {
  const { review } = await implementationReviewedCycle(root);
  const ready = await read(root, '.standards/STATE.md');
  const sync = await init(root, 'SYNCHRONIZATION');
  await fillHeader(root, sync, { Status: 'IN_PROGRESS' });
  await write(root, sync, `${await read(root, sync)}\nOwned reconciliation corrected; normal final review intentionally omitted.\n`);
  await write(root, '.standards/STATE.md', withFrame(ready, {
    From: 'AWAITING_USER_SIGNOFF', Owner: 'SYNCHRONIZING', FailureType: 'SYNCHRONIZATION',
    ResumeAt: 'AWAITING_USER_SIGNOFF', RerunThrough: 'REVIEWING_IMPLEMENTATION',
  }));
  await editStateFields(root, { WorkflowState: 'REVIEWING_IMPLEMENTATION', Kind: 'RESUME', From: 'SYNCHRONIZING' });
  await fillHeader(root, review, { Eligibility: 'NOT_ASSESSED' });
  assert.deepEqual(messages(await check(root)), []);
  // Closing the frame alone cannot reinstate readiness before reassessment.
  await write(root, '.standards/STATE.md', ready);
  await editStateFields(root, { Kind: 'RESUME', From: 'REVIEWING_IMPLEMENTATION' });
  hasProblem(await check(root), /requires Closure Eligibility ELIGIBLE/);
  await fillHeader(root, review, { Eligibility: 'ELIGIBLE' });
  assert.deepEqual(messages(await check(root)), []);
}));

for (const interrupted of ['REVIEWING_IMPLEMENTATION', 'AWAITING_USER_SIGNOFF']) {
  test(`shorter corrective synchronization rerun under Developer resumes ${interrupted} through Reviewer`, () => project(async (root) => {
    const { id, review } = await implementationReviewedCycle(root);
    const ready = await read(root, '.standards/STATE.md');
    const sync = await init(root, 'SYNCHRONIZATION');
    await fillHeader(root, sync, { Status: 'IN_PROGRESS' });
    await write(root, sync, `${await read(root, sync)}\n## Prior Corrective Evidence\n\n`
      + 'Verified the corrected AC-001 evidence reference; normal final review intentionally omitted.\n'
      + '\n## Rerun Evidence\n\nFrame 1, reason A defect., belongs to Developer. '
      + 'The upstream correction changed the endpoint content. Rechecked the prior AC-001 reference '
      + 'and AC-002 evidence against the current full verification report. No owned defect remains. '
      + 'Full synchronization remains incomplete pending implementation Reviewer reassessment '
      + 'and because normal final review is intentionally omitted.\n');
    await fillHeader(root, review, { Eligibility: 'NOT_ASSESSED' });
    const resumesReviewer = interrupted === 'REVIEWING_IMPLEMENTATION';
    await write(root, '.standards/STATE.md', withFrame(ready, {
      From: interrupted, Owner: 'DEVELOPING', FailureType: 'IMPLEMENTATION', ResumeAt: interrupted,
      RerunThrough: resumesReviewer ? 'SYNCHRONIZING' : 'REVIEWING_IMPLEMENTATION',
    }));
    await editStateFields(root, { WorkflowState: 'SYNCHRONIZING', Kind: 'RESUME', From: 'TESTING' });
    assert.deepEqual(messages(await check(root)), []);
    const rerunState = await read(root, '.standards/STATE.md');
    if (resumesReviewer) await write(root, '.standards/STATE.md', ready); // Only this completed frame is popped.
    await editStateFields(root, { WorkflowState: 'REVIEWING_IMPLEMENTATION', Kind: 'RESUME', From: 'SYNCHRONIZING' });
    assert.deepEqual(messages(await check(root)), []);
    const reviewState = await read(root, '.standards/STATE.md');
    if (!resumesReviewer) {
      assert.equal(reviewState.split('## Recovery')[1], rerunState.split('## Recovery')[1], 'the other owner’s frame stays intact');
    }
    // Even a previously eligible label cannot let the incomplete rerun jump
    // directly from Synchronizer to sign-off after clearing the frame.
    await fillHeader(root, review, { Eligibility: 'ELIGIBLE' });
    await write(root, '.standards/STATE.md', ready);
    await editStateFields(root, { Kind: 'RESUME', From: 'SYNCHRONIZING' });
    hasProblem(await check(root), /must be COMPLETE for a direct recovery return to sign-off/);
    // A Reviewer return still requires actual closure reassessment.
    await fillHeader(root, review, { Eligibility: 'NOT_ASSESSED' });
    await editStateFields(root, { Kind: resumesReviewer ? 'FORWARD' : 'RESUME', From: 'REVIEWING_IMPLEMENTATION' });
    hasProblem(await check(root), /requires Closure Eligibility ELIGIBLE/);
    await fillHeader(root, review, { Eligibility: 'ELIGIBLE' });
    assert.deepEqual(messages(await check(root)), []);
    assert.match(await read(root, sync), /`Status`: `IN_PROGRESS`/);
    await assert.rejects(read(root, `.standards/docs/reviews/${id}/final-deliverable.md`), { code: 'ENOENT' });
  }));
}

test('normal forward handoffs use the selected completion boundary', () => project(async (root) => {
  await implementationReviewedCycle(root);
  await editStateFields(root, { From: 'TESTING' });
  hasProblem(await check(root), /Forward sign-off readiness.*must come from REVIEWING_IMPLEMENTATION/);
  await editStateFields(root, { From: 'REVIEWING_IMPLEMENTATION', CompletionPolicy: 'FULL_DELIVERABLE' });
  hasProblem(await check(root), /Normal implementation-review success with FULL_DELIVERABLE hands off to DOCUMENTING/);
  await editStateFields(root, { WorkflowState: 'DOCUMENTING', CompletionPolicy: 'IMPLEMENTATION_REVIEWED' });
  hasProblem(await check(root), /Normal implementation-review success with IMPLEMENTATION_REVIEWED hands off to AWAITING_USER_SIGNOFF/);
}));

test('same-state completion-policy selection preserves an incremental checkpoint', () => project(async (root) => {
  await incrementalCycle(root);
  await editStateFields(root, { CompletionPolicy: 'IMPLEMENTATION_REVIEWED' });
  assert.deepEqual(messages(await check(root)), []);
}));

test('recovery frames and handoffs must agree with each other', () => project(async (root) => {
  await standardCycle(root);
  // A failure that moved the state pushes a matching frame.
  await editState(root, (text) => ['WorkflowState=ARCHITECTING', 'Kind=FAILURE', 'From=TESTING', 'FailureType=ARCHITECTURE']
    .reduce((current, pair) => setField(current, ...pair.split('=')), text));
  hasProblem(await check(root), /Handoff\.Kind is FAILURE from TESTING to ARCHITECTING, so the last recovery frame must record/);
  await editState(root, (text) => withFrame(text, { From: 'TESTING', Owner: 'ARCHITECTING', FailureType: 'ARCHITECTURE', ResumeAt: 'TESTING' }));
  assert.deepEqual(messages(await check(root)), []);
  // A frame's owner, failure type, and return point must agree.
  await editState(root, (text) => text.replace('`FailureType`: `ARCHITECTURE`\n`Reason`', '`FailureType`: `VERIFICATION`\n`Reason`')
    .replace('`ResumeAt`: `TESTING`', '`ResumeAt`: `SYNCHRONIZING`'));
  const result = await check(root);
  hasProblem(result, /Recovery frame 1: a VERIFICATION frame belongs to TESTING, not ARCHITECTING/);
  hasProblem(result, /Recovery frame 1: `ResumeAt` must be the interrupted state, TESTING/);
}));

test('promotion and rework handoffs carry their required fields', () => project(async (root) => {
  await standardCycle(root);
  await editState(root, (text) => ['WorkflowState=AUDITING', 'Kind=PROMOTE', 'From=REVIEWING_IMPLEMENTATION']
    .reduce((current, pair) => setField(current, ...pair.split('=')), text));
  hasProblem(await check(root), /A PROMOTE handoff needs Active Work\.PromotionReason/);
  await editState(root, (text) => ['WorkflowState=REVIEWING_IMPLEMENTATION', 'Kind=USER_REWORK']
    .reduce((current, pair) => setField(current, ...pair.split('=')), text));
  hasProblem(await check(root), /A USER_REWORK handoff needs the FailureType/);
}));

test('nothing moves before the first cycle, and expedited cycles carry no reconciliation', () => project(async (root) => {
  await editState(root, (text) => setField(text, 'WorkflowState', 'TESTING'));
  hasProblem(await check(root), /No cycle has started \(Active Work\.Id is UNSET\), so WorkflowState must still be AUDITING/);
  await editState(root, (text) => setField(text, 'WorkflowState', 'AUDITING'));
  assert.deepEqual(messages(await check(root)), []);
  await startCycle(root, { state: 'DEVELOPING', mode: 'EXPEDITED' });
  await editState(root, (text) => text.replace('`BaselineReconciliation`: `NONE`', '`BaselineReconciliation`:\n\n- `SourceCycle`: `old-cycle-1`\n  `Request`: `Old work.`'));
  hasProblem(await check(root), /An EXPEDITED cycle cannot carry BaselineReconciliation/);
}));

test('a plan moved with git mv is still compared with the last commit', () => project(async (root) => {
  const { id, plan } = await standardCycle(root);
  await commit(root);
  await mkdir(path.join(root, 'plans'));
  await git(root, 'mv', plan, `plans/${id}.md`);
  await editState(root, (text) => setField(text, 'Development', `plans/${id}.md`));
  await write(root, `plans/${id}.md`, (await read(root, `plans/${id}.md`)).replace('### DEV-001', '### DEV-003')
    .replace('`Depends On`: `DEV-001`', '`Depends On`: `DEV-003`'));
  hasProblem(await check(root), /DEV-001 was DONE in the last commit but is missing now/);
}, { withGit: true }));

test('a wrong Scope pointer or a stray copy gets a single message', () => project(async (root) => {
  const { report } = await standardCycle(root);
  await write(root, 'docs/scope/old.md', '<!-- STANDARDS\nArtifact: SCOPE\nCycle: old-cycle-1\n-->\n\n- `AC-009`: Old.\n');
  await editState(root, (text) => setField(text, 'Scope', 'docs/scope/old.md'));
  const lines = messages(await check(root));
  assert.ok(lines.some((line) => /Active Work\.Scope points to docs\/scope\/old\.md, which is a SCOPE record for cycle `old-cycle-1`/.test(line)));
  assert.equal(lines.some((line) => line.includes('AC-009')), false, lines.join('\n'));
  await editState(root, (text) => setField(text, 'Scope', 'NONE'));
  await write(root, 'archive/copy.md', await read(root, report));
  assert.deepEqual(messages(await check(root)).filter((line) => line.startsWith('archive/copy.md:')).length, 1);
}));

test('bare references to a record\'s own entries and to plan steps must resolve', () => project(async (root) => {
  const { id } = await standardCycle(root);
  const review = `.standards/docs/reviews/${id}/implementation.md`;
  await init(root, 'REVIEW', '--kind', 'IMPLEMENTATION');
  await fillHeader(root, review, { Status: 'IN_PROGRESS' });
  await write(root, review, `${await read(root, review)}\n### F-001 — Missing escape\n\nF-001 is fixed by DEV-001. AC-001.\n`);
  assert.deepEqual(messages(await check(root)), []);
  await write(root, review, `${await read(root, review)}\nF-004 is fixed by DEV-009.\n`);
  const result = await check(root);
  hasProblem(result, /implementation\.md: mentions F-004, but it has no `### F-004` entry/);
  hasProblem(result, /implementation\.md: mentions DEV-009, which is not a step in the development plan/);
}));

test('conflict markers anywhere in .standards/ stop the check', () => project(async (root) => {
  await write(root, '.standards/CONTEXT.md', '# Context\n<<<<<<< ours\nA\n=======\nB\n>>>>>>> theirs\n');
  hasProblem(await check(root), /\.standards\/CONTEXT\.md: has an unresolved merge conflict/);
}));

test('records under .standards/docs/ are scanned, but other runtime files are not', async () => {
  for (const withGit of [false, true]) {
    await project(async (root) => {
      await startCycle(root, { state: 'TESTING' });
      await write(root, '.standards/docs/stray/broken.md', '<!-- STANDARDS\nArtifact: NOPE\nCycle: x-1\n-->\n');
      await write(root, '.standards/NOTES.md', '<!-- STANDARDS\nArtifact: NOPE\nCycle: x-1\n-->\n');
      const result = await check(root);
      hasProblem(result, /^\.standards\/docs\/stray\/broken\.md: has a malformed provenance block/);
      assert.equal(messages(result).some((line) => line.startsWith('.standards/NOTES.md:')), false);
    }, { withGit });
  }
});

test('the development plan must be at its fixed path', () => project(async (root) => {
  const { id, plan } = await standardCycle(root);
  const moved = `docs/plans/${id}.md`;
  await write(root, moved, await read(root, plan));
  await rm(path.join(root, plan));
  await editState(root, (text) => setField(text, 'Development', moved));
  const result = await check(root);
  hasProblem(result, new RegExp(`^docs/plans/${id}\\.md: is this cycle's DEVELOPMENT record, but it must be at \\.standards/docs/development/${id}\\.md`));
  hasProblem(result, new RegExp(`^\\.standards/STATE\\.md: Active Work\\.Development points to docs/plans/${id}\\.md, but this cycle's DEVELOPMENT record must be at`));
}));

test('a merge conflict in a cycle record stops the check with its own message', () => project(async (root) => {
  const { report } = await standardCycle(root);
  await commit(root);
  await git(root, 'checkout', '-q', '-b', 'other');
  await write(root, report, `${await read(root, report)}\nOther branch.\n`);
  await commit(root);
  await git(root, 'checkout', '-q', 'main');
  await write(root, report, `${await read(root, report)}\nMain branch.\n`);
  await commit(root);
  await git(root, 'merge', '-q', 'other');
  assert.deepEqual(messages(await check(root)), [`${report}: has an unresolved merge conflict. Stop and ask the user to resolve it.`]);
}, { withGit: true }));

test('completion policy, verification scheduling, and assessment fields are required, unique, and concrete', () => project(async (root) => {
  const { plan, report } = await standardCycle(root);
  for (const [file, name] of [[plan, 'Verification Cadence'], [plan, 'Current Increment'],
    [report, 'Assessment Purpose'], [report, 'Assessment Target'], ['.standards/STATE.md', 'PendingVerificationCadence'],
    ['.standards/STATE.md', 'CompletionPolicy']]) {
    const original = await read(root, file);
    const field = new RegExp('`' + name + '`:\\s*`[^`]*`');
    await write(root, file, original.replace(field, ''));
    hasProblem(await check(root), new RegExp(name));
    await write(root, file, original.replace(field, (value) => `${value}\n${value}`));
    hasProblem(await check(root), new RegExp(name));
    await write(root, file, setField(original, name, 'invalid'));
    hasProblem(await check(root), new RegExp(name));
    await write(root, file, original);
  }
  assert.deepEqual(messages(await check(root)), []);
}));

test('Developer checkpoints require an approved, self-checked outcome and completed dependencies', () => project(async (root) => {
  const { plan } = await incrementalCycle(root);
  for (const mode of ['AUTONOMOUS', 'STEPWISE', 'CODE_WITH_ME']) {
    await fillHeader(root, plan, { Mode: mode });
    assert.deepEqual(messages(await check(root)), []);
  }
  const original = await read(root, plan);
  for (const [changed, expected] of [
    [setField(original, 'Status', 'PROPOSED'), /checkpoint requires an approved plan/],
    [setField(original, 'User Style Locked', 'false'), /checkpoint requires an approved plan/],
    [original.replace('`Status`: `DONE`', '`Status`: `PENDING`'), /requires DEV-001.*DONE/],
    [original.replace('**Self-Check**', '**Notes**'), /DEV-001 needs persisted.*Self-Check/],
    [original.replace('`Depends On`: `NONE`', '`Depends On`: `DEV-002`'), /requires DEV-002.*DONE/],
    [setField(original, 'Current Increment', '9'), /Current Increment 9 has no definition/],
    [original.replace('`Development Steps`: `DEV-001`', '`Development Steps`: `DEV-009`'), /DEV-009 is not a step/],
    [original.replace('### Increment 2', '### Increment 3'), /entries must be numbered/],
  ]) {
    await write(root, plan, changed);
    hasProblem(await check(root), expected);
  }
  await write(root, plan, original);
  // Execution evidence may be expressed as fenced commands and results.
  await write(root, plan, original.replace('`node --test test/search.test.js` in project root; dirty endpoint content; exit 0.',
    '```text\nnode --test test/search.test.js\nproject root; dirty endpoint content; exit 0\n```'));
  assert.deepEqual(messages(await check(root)), []);
}));

test('checkpoint routes are checked without changing pending cadence intent', () => project(async (root) => {
  await incrementalCycle(root);
  const original = await read(root, '.standards/STATE.md');
  for (const [changed, expected] of [
    [setField(original, 'Development', 'NONE'), /Active Work.Development is NONE/],
    [setField(original, 'From', 'ARCHITECTING'), /CHECKPOINT requires a STANDARD Developer\/Tester exchange/],
    [setField(original, 'FailureType', 'VERIFICATION'), /CHECKPOINT requires.*FailureType NONE/],
    [setField(original, 'Reason', 'Ready.'), /Reason must identify exactly one/],
    [setField(original, 'Reason', 'Increment 1 and Increment 2 ready.'), /Reason must identify exactly one/],
    [withFrame(original, { From: 'DEVELOPING', Owner: 'TESTING', FailureType: 'VERIFICATION', ResumeAt: 'DEVELOPING' }),
      /CHECKPOINT requires.*no active recovery/],
  ]) {
    await write(root, '.standards/STATE.md', changed);
    hasProblem(await check(root), expected);
  }
  const pending = setField(original, 'PendingVerificationCadence', 'AFTER_IMPLEMENTATION');
  await write(root, '.standards/STATE.md', pending);
  assert.deepEqual(messages(await check(root)), []);
  assert.equal(await read(root, '.standards/STATE.md'), pending);
}));

test('Tester checkpoints require current assessment evidence while allowing historical handoffs after a switch', () => project(async (root) => {
  const { plan, report } = await incrementalCycle(root);
  await editState(root, (text) => setField(setField(setField(text, 'WorkflowState', 'DEVELOPING'), 'From', 'TESTING'),
    'Reason', 'Increment 1 verified.'));
  assert.deepEqual(messages(await check(root)), []);
  const original = await read(root, report);
  await write(root, report, original.replace('| VERIFIED |', '| BLOCKED |'));
  hasProblem(await check(root), /Increment 1 assessment recorded as VERIFIED/);
  await write(root, report, original.replace(/## Execution Evidence[\s\S]*/, '## Execution Evidence\n'));
  hasProblem(await check(root), /checkpoint needs persisted Execution Evidence/);
  await write(root, report, original);
  await fillHeader(root, plan, { 'Current Increment': '2' });
  assert.deepEqual(messages(await check(root)), []);
  await fillHeader(root, plan, { 'Verification Cadence': 'AFTER_IMPLEMENTATION', 'Current Increment': 'NONE' });
  // The Developer may reopen previously tested work without rewriting the historical handoff.
  await write(root, plan, (await read(root, plan)).replace('`Status`: `DONE`', '`Status`: `IN_PROGRESS`'));
  assert.deepEqual(messages(await check(root)), []);
  await fillHeader(root, plan, { 'Verification Cadence': 'INCREMENTAL', 'Current Increment': '2' });
  assert.deepEqual(messages(await check(root)), []);
  // A new user question belongs to the receiving role, not the historical gate.
  await editState(root, (text) => setField(text, 'BlockedOn', 'Awaiting implementation detail.'));
  assert.deepEqual(messages(await check(root)), []);
}));

test('partial Tester assignments retain the full acceptance inventory and stop holds the handing-off role', () => project(async (root) => {
  const { report } = await incrementalCycle(root);
  const original = await read(root, report);
  await write(root, report, original.replace('| AC-004 | DEV-002 | AWAITING_IMPLEMENTATION |\n', ''));
  hasProblem(await check(root), /partial assessment does not account for AC-004/);
  await write(root, report, `${await read(root, report)}\n## Assessed Inputs\n\nThe current contract includes AC-004.\n`);
  hasProblem(await check(root), /partial assessment does not account for AC-004/);
  // Developer has handed off, but the receiving Tester has yet to reconcile its old report.
  await fillHeader(root, report, { 'Assessment Target': 'Increment 2' });
  const stop = () => hook(root, 'stop', claudeStop(root, randomUUID(), false));
  assert.equal((await stop()).code, 0);
  hasProblem(await check(root), /assigned checkpoint requires.*Increment 1/);
  await write(root, report, original);
  await editState(root, (text) => setField(setField(text, 'WorkflowState', 'DEVELOPING'), 'From', 'TESTING'));
  await write(root, report, original.replace('| VERIFIED |', '| BLOCKED |'));
  const failed = await stop();
  assert.equal(failed.code, 2);
  assert.match(failed.stderr, /assessment recorded as VERIFIED/);
}));

test('scoped verification corrections and nested returns do not depend on the effective cadence', () => project(async (root) => {
  const { plan, report } = await incrementalCycle(root);
  await fillHeader(root, plan, { 'Verification Cadence': 'AFTER_IMPLEMENTATION', 'Current Increment': 'NONE' });
  await write(root, plan, `${await read(root, plan)}\n## Plan Notes\n\n`
    + suspendedAssignment({ purpose: 'DEVELOPMENT', target: 'NONE' }));
  await fillHeader(root, report, { Mode: 'REVERIFY', 'Assessment Purpose': 'CORRECTION', 'Assessment Target': 'Repair endpoint assertion' });
  await editState(root, (text) => withFrame([['Kind', 'FAILURE'], ['From', 'DEVELOPING'], ['FailureType', 'VERIFICATION'],
    ['PendingVerificationCadence', 'INCREMENTAL']].reduce((current, [name, value]) => setField(current, name, value), text),
  { From: 'DEVELOPING', Owner: 'TESTING', FailureType: 'VERIFICATION', ResumeAt: 'DEVELOPING' }));
  assert.deepEqual(messages(await check(root)), []);
  const outer = await read(root, '.standards/STATE.md');
  const outerReport = await read(root, report);
  await fillHeader(root, report, { 'Assessment Purpose': 'FULL', 'Assessment Target': 'NONE' });
  hasProblem(await check(root), /scoped Tester correction requires Assessment Purpose CORRECTION/);
  await fillHeader(root, report, { Status: 'COMPLETE', 'Assessment Purpose': 'FULL', 'Assessment Target': 'NONE' });
  hasProblem(await check(root), /scoped recovery cannot certify unfinished implementation/);
  await write(root, report, outerReport);
  const saved = suspendedAssignment({ frame: 2, purpose: 'CORRECTION', target: 'Repair endpoint assertion' });
  await write(root, report, `${outerReport}\n## Resume or Handoff\n\n${saved}`);
  await write(root, '.standards/STATE.md', [['WorkflowState', 'DEVELOPING'], ['From', 'TESTING'], ['FailureType', 'IMPLEMENTATION']]
    .reduce((current, [name, value]) => setField(current, name, value), outer)
    .replace('## Outstanding Obligations', `${frameText({ From: 'TESTING', Owner: 'DEVELOPING',
      FailureType: 'IMPLEMENTATION', ResumeAt: 'TESTING' }).replace('### Frame 1', '### Frame 2')}\n## Outstanding Obligations`));
  assert.deepEqual(messages(await check(root)), []);
  await write(root, report, outerReport);
  hasProblem(await check(root), /Scoped recovery needs a suspended assignment for Frame 2/);
  await write(root, report, `${outerReport}\n## Resume or Handoff\n\n${saved.replace('`Recovery Reason`: `A defect.`',
    '`Recovery Reason`: `Another defect.`')}`);
  hasProblem(await check(root), /Scoped recovery needs a suspended assignment for Frame 2/);
  await write(root, report, `${outerReport}\n## Resume or Handoff\n\n${saved}`);
  // Pop the nested repair, resume Tester's correction, then pop the outer repair back to Developer.
  await write(root, '.standards/STATE.md', [['Kind', 'RESUME'], ['From', 'DEVELOPING'], ['FailureType', 'NONE']]
    .reduce((current, [name, value]) => setField(current, name, value), outer));
  assert.deepEqual(messages(await check(root)), []);
  await editState(root, (text) => [['WorkflowState', 'DEVELOPING'], ['From', 'TESTING']]
    .reduce((current, [name, value]) => setField(current, name, value), text)
    .replace(/## Recovery[\s\S]*?(?=## Outstanding)/, '## Recovery\n\n`Active`: `false`\n\n'));
  assert.deepEqual(messages(await check(root)), []);
}));

test('full Tester assignment requires full metadata after implementation, without blaming its previous increment at handoff', () => project(async (root) => {
  const { plan, report } = await incrementalCycle(root);
  await fillHeader(root, plan, { Status: 'COMPLETE', 'Current Increment': 'NONE' });
  await write(root, plan, (await read(root, plan)).replace('`Status`: `PENDING`', '`Status`: `DONE`'));
  await editState(root, (text) => setField(text, 'Kind', 'FORWARD'));
  hasProblem(await check(root), /Full verification requires Assessment Purpose FULL/);
  assert.equal((await hook(root, 'stop', claudeStop(root, randomUUID(), false))).code, 0);
  await fillHeader(root, report, { 'Assessment Purpose': 'FULL', 'Assessment Target': 'NONE' });
  assert.deepEqual(messages(await check(root)), []);
}));

test('a resumed increment and a same-state test correction can retain unfinished future implementation', () => project(async (root) => {
  const { report } = await incrementalCycle(root);
  await write(root, report, `${await read(root, report)}\n## Resume or Handoff\n\n`
    + suspendedAssignment({ purpose: 'INCREMENT', target: 'Increment 1' }));
  await editState(root, (text) => setField(text, 'Kind', 'RESUME'));
  assert.deepEqual(messages(await check(root)), []);
  await fillHeader(root, report, { 'Assessment Purpose': 'CORRECTION', 'Assessment Target': 'Repair assertion' });
  hasProblem(await check(root), /Restore the suspended INCREMENT assessment/);
  await fillHeader(root, report, { 'Assessment Purpose': 'INCREMENT', 'Assessment Target': 'Increment 1' });
  await editState(root, (text) => [['Kind', 'FAILURE'], ['From', 'TESTING'], ['FailureType', 'VERIFICATION']]
    .reduce((current, [name, value]) => setField(current, name, value), text));
  assert.deepEqual(messages(await check(root)), []);
}));

test('a nested Tester correction resumes without restoring the older interrupted increment', () => project(async (root) => {
  const { plan, report } = await incrementalCycle(root);
  await write(root, plan, (await read(root, plan)).replace('`Status`: `DONE`', '`Status`: `IN_PROGRESS`')
    + '\n## Plan Notes\n\n' + suspendedAssignment({ frame: 2, purpose: 'CORRECTION', target: 'Repair endpoint' }));
  await fillHeader(root, report, { 'Assessment Purpose': 'CORRECTION', 'Assessment Target': 'Repair assertion' });
  await write(root, report, `${await read(root, report)}\n## Resume or Handoff\n\n`
    + suspendedAssignment({ purpose: 'CORRECTION', target: 'Earlier resolved correction' })
    + '\n' + suspendedAssignment({ number: 2, purpose: 'INCREMENT', target: 'Increment 1' })
    + '\n' + suspendedAssignment({ number: 3, frame: 3, purpose: 'CORRECTION', target: 'Repair assertion' }));
  const frames = [
    frameText({ From: 'TESTING', Owner: 'DEVELOPING', FailureType: 'IMPLEMENTATION', ResumeAt: 'TESTING' }),
    frameText({ From: 'DEVELOPING', Owner: 'TESTING', FailureType: 'VERIFICATION', ResumeAt: 'DEVELOPING' })
      .replace('### Frame 1', '### Frame 2'),
  ];
  await editState(root, (text) => setField(text, 'Kind', 'RESUME')
    .replace(/## Recovery[\s\S]*?(?=## Outstanding)/, `## Recovery\n\n\`Active\`: \`true\`\n\n${frames.join('\n')}\n`));
  assert.deepEqual(messages(await check(root)), []);
  const stop = await hook(root, 'stop', claudeStop(root, randomUUID(), false));
  assert.equal(stop.code, 0, stop.stderr);
  // Finish the nested test correction and return to the original Developer repair.
  await editState(root, (text) => [['WorkflowState', 'DEVELOPING'], ['From', 'TESTING']]
    .reduce((current, [name, value]) => setField(current, name, value), text)
    .replace(/## Recovery[\s\S]*?(?=## Outstanding)/, `## Recovery\n\n\`Active\`: \`true\`\n\n${frames[0]}\n`));
  assert.deepEqual(messages(await check(root)), []);
  // After the last frame is popped, restore the latest Frame 1 assignment;
  // the older Frame 1 record and newer nested Frame 3 record are both history.
  await write(root, plan, (await read(root, plan)).replace('`Status`: `IN_PROGRESS` `Depends On`', '`Status`: `DONE` `Depends On`'));
  await editState(root, (text) => [['WorkflowState', 'TESTING'], ['From', 'DEVELOPING']]
    .reduce((current, [name, value]) => setField(current, name, value), text)
    .replace(/## Recovery[\s\S]*?(?=## Outstanding)/, '## Recovery\n\n`Active`: `false`\n\n'));
  hasProblem(await check(root), /Restore the suspended INCREMENT assessment/);
  await fillHeader(root, report, { 'Assessment Purpose': 'INCREMENT', 'Assessment Target': 'Increment 1' });
  assert.deepEqual(messages(await check(root)), []);
}));

test('stop checks partial Tester coverage after the final corrective frame has been popped', () => project(async (root) => {
  const { plan, report } = await incrementalCycle(root);
  await fillHeader(root, plan, { 'Verification Cadence': 'AFTER_IMPLEMENTATION', 'Current Increment': 'NONE' });
  await write(root, plan, `${await read(root, plan)}\n## Plan Notes\n\n`
    + suspendedAssignment({ purpose: 'DEVELOPMENT', target: 'NONE' }));
  await fillHeader(root, report, { 'Assessment Purpose': 'CORRECTION', 'Assessment Target': 'Repair assertion' });
  await editState(root, (text) => [['WorkflowState', 'DEVELOPING'], ['Kind', 'RESUME'], ['From', 'TESTING']]
    .reduce((current, [name, value]) => setField(current, name, value), text));
  const stop = () => hook(root, 'stop', claudeStop(root, randomUUID(), false));
  assert.equal((await stop()).code, 0);
  await write(root, report, (await read(root, report)).replace('| AC-004 | DEV-002 | AWAITING_IMPLEMENTATION |\n', ''));
  const incomplete = await stop();
  assert.equal(incomplete.code, 2, incomplete.stderr);
  assert.match(incomplete.stderr, /partial assessment does not account for AC-004/);
}));

test('Reviewer entry enforces full completion even with an outer recovery frame', () => project(async (root) => {
  const { spec, plan, report } = await incrementalCycle(root);
  await write(root, report, `${await read(root, report)}\n## Resume or Handoff\n\n`
    + suspendedAssignment({ purpose: 'INCREMENT', target: 'Increment 1' }));
  const original = await read(root, '.standards/STATE.md');
  for (const kind of ['FORWARD', 'RESUME']) {
    await write(root, '.standards/STATE.md', withFrame([['WorkflowState', 'REVIEWING_IMPLEMENTATION'], ['Kind', kind],
      ['From', 'TESTING'], ['PendingVerificationCadence', 'AFTER_IMPLEMENTATION']]
      .reduce((current, [name, value]) => setField(current, name, value), original),
    { From: 'TESTING', Owner: 'SCOPING', FailureType: 'SCOPING', ResumeAt: 'TESTING', RerunThrough: 'REVIEWING_IMPLEMENTATION' }));
    const result = await check(root);
    hasProblem(result, /plan must be COMPLETE/);
    hasProblem(result, /Reviewer entry requires Assessment Purpose FULL/);
    hasProblem(result, /must be COMPLETE once the cycle has passed TESTING/);
    hasProblem(result, /Clear pending cadence intent/);
  }
  await fillHeader(root, plan, { Status: 'COMPLETE', 'Current Increment': 'NONE' });
  await write(root, plan, (await read(root, plan)).replace('`Status`: `PENDING`', '`Status`: `DONE`'));
  await fillHeader(root, report, { Status: 'COMPLETE', 'Assessment Purpose': 'FULL', 'Assessment Target': 'NONE' });
  hasProblem(await check(root), /COMPLETE report cannot retain AWAITING_IMPLEMENTATION/);
  await write(root, report, (await read(root, report)).replace('AWAITING_IMPLEMENTATION', 'passed'));
  await editState(root, (text) => setField(text, 'PendingVerificationCadence', 'NONE'));
  assert.deepEqual(messages(await check(root)), []);
  // Scope and design cannot be omitted at this boundary, even in recovery.
  await write(root, spec, (await read(root, spec)).replace('- `AC-004`: Search-results component.\n', ''));
  hasProblem(await check(root), /does not account for AC-004.*design coverage/);
  await editState(root, (text) => setField(text, 'Scope', 'NONE'));
  hasProblem(await check(root), /Active Work.Scope is NONE/);
}));

test('full verification cannot count historical increment evidence as current acceptance coverage', () => project(async (root) => {
  const { plan, report } = await incrementalCycle(root);
  await fillHeader(root, plan, { Status: 'COMPLETE', 'Current Increment': 'NONE' });
  await write(root, plan, (await read(root, plan)).replace('`Status`: `PENDING`', '`Status`: `DONE`'));
  await fillHeader(root, report, { Status: 'COMPLETE', 'Assessment Purpose': 'FULL', 'Assessment Target': 'NONE' });
  await write(root, report, (await read(root, report))
    .replace('| AC-004 | DEV-002 | AWAITING_IMPLEMENTATION |\n', '')
    .replace('## Execution Evidence', '| 2 | Search results / AC-004 | Earlier source and results | SUPERSEDED |\n\n## Execution Evidence'));
  await editState(root, (text) => [['WorkflowState', 'REVIEWING_IMPLEMENTATION'], ['Kind', 'FORWARD'], ['From', 'TESTING']]
    .reduce((current, [name, value]) => setField(current, name, value), text));
  hasProblem(await check(root), /is COMPLETE but does not account for AC-004/);
  const stop = await hook(root, 'stop', claudeStop(root, randomUUID(), false));
  assert.equal(stop.code, 2, stop.stderr);
  assert.match(stop.stderr, /is COMPLETE but does not account for AC-004/);
  await write(root, report, (await read(root, report)).replace('## Increment Assessments',
    '| AC-004 | Search-results tests on final content | passed |\n\n## Increment Assessments'));
  assert.deepEqual(messages(await check(root)), []);
}));

test('expedited and inactive cycles cannot carry incremental scheduling intent', () => project(async (root) => {
  const original = await read(root, '.standards/STATE.md');
  await editState(root, (text) => setField(text, 'PendingVerificationCadence', 'INCREMENTAL'));
  hasProblem(await check(root), /Inactive cycles require PendingVerificationCadence NONE/);
  await write(root, '.standards/STATE.md', original);
  await startCycle(root, { state: 'DEVELOPING', mode: 'EXPEDITED' });
  const plan = await init(root, 'DEVELOPMENT');
  await fillHeader(root, plan, { Mode: 'AUTONOMOUS', 'User Style Locked': 'true', Status: 'APPROVED',
    'Verification Cadence': 'INCREMENTAL' });
  await editState(root, (text) => setField(setField(text, 'Development', plan), 'PendingVerificationCadence', 'INCREMENTAL'));
  const result = await check(root);
  hasProblem(result, /EXPEDITED cycle requires AFTER_IMPLEMENTATION/);
  hasProblem(result, /INCREMENTAL request requires expedited promotion/);
  for (const state of ['CANCELLED', 'SIGNED_OFF']) {
    await editState(root, (text) => setField(setField(text, 'WorkflowState', state), 'CycleMode', 'UNSET'));
    hasProblem(await check(root), /Inactive cycles require PendingVerificationCadence NONE/);
  }
}));

for (const mode of ['AUTONOMOUS', 'STEPWISE', 'CODE_WITH_ME']) {
  test(`${mode} supports grouped, revisited increments followed by full verification`, () => project(async (root) => {
    const { plan, report } = await incrementalCycle(root);
    await fillHeader(root, plan, { Mode: mode });
    await write(root, plan, (await read(root, plan)).replace('## Verification Increments',
      '### DEV-003 — Result ordering\n\n`Status`: `PENDING` `Depends On`: `DEV-002`\n`Acceptance`: `AC-004`\n\n## Verification Increments')
      .replace('`Development Steps`: `DEV-002` `Acceptance`: `AC-004`',
        '`Development Steps`: `DEV-001, DEV-002` `Acceptance`: `AC-001, AC-004`'));
    assert.deepEqual(messages(await check(root)), []);
    await editState(root, (text) => [['WorkflowState', 'DEVELOPING'], ['From', 'TESTING'], ['Reason', 'Increment 1 verified.']]
      .reduce((current, [name, value]) => setField(current, name, value), text));
    await fillHeader(root, plan, { 'Current Increment': '2' });
    assert.deepEqual(messages(await check(root)), []);

    await editState(root, (text) => [['WorkflowState', 'TESTING'], ['From', 'DEVELOPING'], ['Reason', 'Increment 2 ready.']]
      .reduce((current, [name, value]) => setField(current, name, value), text));
    await fillHeader(root, report, { Mode: 'REVERIFY', 'Assessment Target': 'Increment 2' });
    hasProblem(await check(root), /Increment 2 requires DEV-002.*DONE/);
    await write(root, plan, (await read(root, plan))
      .replace('`Status`: `PENDING` `Depends On`: `DEV-001`', '`Status`: `DONE` `Depends On`: `DEV-001`')
      .replace('### DEV-003', '**Self-Check**\n\nSearch-box checks passed on the updated endpoint and UI.\n\n### DEV-003'));
    assert.deepEqual(messages(await check(root)), []);
    await write(root, report, (await read(root, report)).replace('AWAITING_IMPLEMENTATION', 'passed on updated endpoint and UI')
      .replace('## Execution Evidence', '| 2 | Endpoint and results / AC-001, AC-004 | Updated endpoint and UI checks passed | VERIFIED |\n\n## Execution Evidence'));
    await editState(root, (text) => [['WorkflowState', 'DEVELOPING'], ['From', 'TESTING'], ['Reason', 'Increment 2 verified.']]
      .reduce((current, [name, value]) => setField(current, name, value), text));
    assert.deepEqual(messages(await check(root)), []);
    assert.match(await read(root, report), /\| 1 \| Endpoint \/ AC-001/);

    await write(root, plan, (await read(root, plan)).replace('`Status`: `PENDING`', '`Status`: `DONE`')
      .replace('## Verification Increments', '**Self-Check**\n\nResult-ordering checks passed on final content.\n\n## Verification Increments'));
    await fillHeader(root, plan, { Status: 'COMPLETE', 'Current Increment': 'NONE' });
    await editState(root, (text) => [['WorkflowState', 'TESTING'], ['Kind', 'FORWARD'], ['From', 'DEVELOPING']]
      .reduce((current, [name, value]) => setField(current, name, value), text));
    await fillHeader(root, report, { 'Assessment Purpose': 'FULL', 'Assessment Target': 'NONE' });
    assert.deepEqual(messages(await check(root)), []);
    await editState(root, (text) => setField(setField(text, 'WorkflowState', 'REVIEWING_IMPLEMENTATION'), 'From', 'TESTING'));
    hasProblem(await check(root), /must be COMPLETE once the cycle has passed TESTING/);
    await fillHeader(root, report, { Status: 'COMPLETE' });
    assert.deepEqual(messages(await check(root)), []);
    assert.match(await read(root, plan), new RegExp('`Mode`: `' + mode + '`'));
    const stop = await hook(root, 'stop', claudeStop(root, randomUUID(), false));
    assert.equal(stop.code, 0, stop.stderr);
  }));
}

test('a cadence request made before a plan exists survives reinstall', () => project(async (root) => {
  await startCycle(root);
  await editState(root, (text) => setField(text, 'PendingVerificationCadence', 'INCREMENTAL'));
  const saved = await read(root, '.standards/STATE.md');
  assert.deepEqual(messages(await check(root)), []);
  await installProject({ projectRoot: root, clients: ['claude'] });
  assert.equal(await read(root, '.standards/STATE.md'), saved);
  assert.deepEqual(messages(await check(root)), []);
}));

test('both cadence switches preserve historical assessments through save-before-clear and reinstall', () => project(async (root) => {
  const { plan, report } = await incrementalCycle(root);
  await editState(root, (text) => [['WorkflowState', 'DEVELOPING'], ['From', 'TESTING'], ['Reason', 'Increment 1 verified.']]
    .reduce((current, [name, value]) => setField(current, name, value), text));
  const assessment = await read(root, report);
  for (const cadence of ['AFTER_IMPLEMENTATION', 'INCREMENTAL']) {
    await editState(root, (text) => setField(text, 'PendingVerificationCadence', cadence));
    await fillHeader(root, plan, { 'Verification Cadence': cadence, 'Current Increment': cadence === 'INCREMENTAL' ? '2' : 'NONE' });
    const savedState = await read(root, '.standards/STATE.md');
    const savedPlan = await read(root, plan);
    assert.deepEqual(messages(await check(root)), []);
    await installProject({ projectRoot: root, clients: ['claude'] });
    assert.equal(await read(root, '.standards/STATE.md'), savedState);
    assert.equal(await read(root, plan), savedPlan);
    assert.equal(await read(root, report), assessment);
    await editState(root, (text) => setField(text, 'PendingVerificationCadence', 'NONE'));
    assert.deepEqual(messages(await check(root)), []);
  }
}));

test('a reused recovery frame with a latest FULL assignment cannot use an older increment to bypass completion', () => project(async (root) => {
  const { plan, report } = await incrementalCycle(root);
  await fillHeader(root, plan, { 'Verification Cadence': 'AFTER_IMPLEMENTATION', 'Current Increment': 'NONE' });
  await fillHeader(root, report, { 'Assessment Purpose': 'FULL', 'Assessment Target': 'NONE' });
  await write(root, report, `${await read(root, report)}\n## Resume or Handoff\n\n`
    + suspendedAssignment({ purpose: 'INCREMENT', target: 'Increment 1' })
    + '\n' + suspendedAssignment({ number: 2, purpose: 'FULL', target: 'NONE' }));
  await editState(root, (text) => withFrame(setField(text, 'Kind', 'RESUME'),
    { From: 'TESTING', Owner: 'ARCHITECTING', FailureType: 'ARCHITECTURE', ResumeAt: 'TESTING', RerunThrough: 'TESTING' }));
  hasProblem(await check(root), /plan must be COMPLETE/);
  await fillHeader(root, plan, { Status: 'COMPLETE' });
  await write(root, plan, (await read(root, plan)).replace('`Status`: `PENDING`', '`Status`: `DONE`'));
  assert.deepEqual(messages(await check(root)), []);
}));
