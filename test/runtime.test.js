import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { chmod, mkdtemp, readFile, realpath, rm, symlink, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { installProject } from '../lib/install.js';
import { slugFor } from '../runtime/cycle.mjs';
import { stopMessage } from '../runtime/hook.mjs';

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

// An installed brownfield project in a fresh temporary folder.
async function project(body, { withGit = false } = {}) {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), 'standards-runtime-test-')));
  try {
    await write(root, 'app.py', 'print("hi")\n');
    await installProject({ projectRoot: root, clients: ['claude'] });
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

const setField = (text, name, value) => text.replace(new RegExp('`' + name + '`:(\\s*)`[^`]*`'), `\`${name}\`:$1\`${value}\``);

// Generate an ID with the tool and record it as the active cycle.
async function startCycle(root, { state = 'SCOPING', mode = 'STANDARD' } = {}) {
  const { stdout, code } = await tool(root, 'cycle', 'new', '--request', 'Add user search');
  assert.equal(code, 0);
  const id = stdout.trim();
  await editState(root, (text) => [['Id', id], ['Request', 'Add user search'], ['CycleMode', mode], ['WorkflowState', state]]
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
  await editState(root, (text) => [['Id', id], ['Request', 'Add user search by name'], ['CycleMode', 'STANDARD']]
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
  hasProblem(result, new RegExp(`refers to ${review.replace(/\//g, '\\/')}#F-007, but that file has no F-007`));
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
    [report], [review, spec]);
  expectSentBack(await after({ state: 'REVIEWING_IMPLEMENTATION', kind: 'RESUME', from: 'TESTING', frames: [rework] }),
    [report], [review, spec]);
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
  hasProblem(result, new RegExp(`Active Work\\.Architecture points to ${report.replace(/\//g, '\\/')}, which is a VERIFICATION record for cycle \`${id}\``));
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
  await editState(root, (text) => `﻿${text
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
