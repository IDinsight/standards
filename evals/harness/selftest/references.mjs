// Self-test of the reference evals' judge parts with a fake Claude API (no
// model, no network, no Docker). selftest.mjs runs this in a child process with:
//   EVAL_FAKE_TRANSPORT  ./references-fake.mjs, EVAL_FAKE_DIR a scratch folder
//   EVAL_SPEND_LOG       a scratch spend log
// Prints one JSON object: { checks: [{ name, ok, detail }] }.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { BASE_COMMIT } from '../references/build-b.mjs';
import { checkTask, judgeTasks, leaks, passedCase, report, updatePassed } from '../references/check-graders.mjs';
import { blindJobs, judgeBlind, judgeProbe, referenceJudgeChecks } from '../references/judge.mjs';
import { frameworkFiles } from '../references/reads.mjs';

const FAKE = process.env.EVAL_FAKE_DIR;
const W = path.join(FAKE, 'work');
mkdirSync(W, { recursive: true });
const checks = [];
const check = (name, ok, detail = '') => checks.push({ name, ok: Boolean(ok), detail: String(detail).slice(0, 300) });
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const write = (f, text) => { mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, typeof text === 'string' ? text : JSON.stringify(text)); };
const calls = () => (existsSync(path.join(FAKE, 'calls.jsonl')) ? readFileSync(path.join(FAKE, 'calls.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const git = (dir, ...args) => execFileSync('git', ['-c', 'user.name=selftest', '-c', 'user.email=selftest@example.invalid', ...args], { cwd: dir, encoding: 'utf8' });

// A finished task run: app/main.py and the state file changed.
function taskRun(dir, mainPy) {
  write(path.join(dir, 'after', 'app', 'main.py'), mainPy);
  write(path.join(dir, 'after', '.standards', 'STATE.md'), 'Phase: done\n');
  write(path.join(dir, 'before.json'), { files: { 'app/main.py': 'a', '.standards/STATE.md': 'a' } });
  write(path.join(dir, 'after.json'), { files: { 'app/main.py': 'b', '.standards/STATE.md': 'b' } });
  write(path.join(dir, 'run.json'), { case: 'developer-901', projectRoot: '/work' });
}

const SAVED = '/home/runner/.claude/projects/-work/s1/tool-results/t4b.txt';
const REFERENCE_LINES = frameworkFiles(BASE_COMMIT)['skills/documenter/references/readme.md'].split('\n').slice(0, 12);

// A documenter-38 run whose suite grading left one assertion for the judge.
// Version A's role read the protocol and the reference, cd'ed into its skill
// folder (where a relative read and the cd back out also count as framework
// calls); both versions ran a whole-project git log, wrote their record, and
// read a project guide.
function probeRun(root, version) {
  const d = path.join(root, `${version}-documenter-38`, 'cases', 'documenter-38', 'r1');
  const use = (id, name, input, output) => [{ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } },
    { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: id, content: output }] } }];
  const lines = [
    { type: 'system', subtype: 'init', model: 'claude-sonnet-5-5' },
    { type: 'assistant', message: { content: [{ type: 'text', text: 'I will check docs/guide.md and readme.md.' }] } },
    ...(version === 'A' ? [
      ...use('t0', 'Read', { file_path: '/work/.standards/PROTOCOL.md' }, '1\t# Protocol of A'),
      ...use('t1', 'Read', { file_path: '/work/.claude/skills/documenter/references/readme.md' }, '1\t# Read when\n2\tA README says...'),
      ...use('t2', 'Bash', { command: 'cd .claude/skills/documenter && ls references' }, 'readme.md'),
      // Only read detection ties these to the framework (the folder the cd left).
      ...use('t3', 'Bash', { command: 'head -1 modes/guided.md' }, '# Guided Mode'),
      // Leaving the skills folder first: a project command, not a framework call.
      ...use('t4', 'Bash', { command: 'cd /work && pnpm test' }, 'tests pass'),
      // An output too large for the transcript, read back later from where Claude
      // Code saved it: only the lines it prints tie the read-back to the reference.
      ...use('t4b', 'Bash', { command: 'cat .claude/skills/documenter/references/readme.md' }, `Output too large (30KB). Full output saved to: ${SAVED}\n\nPreview (first 2KB):\n# READMEs`),
      ...use('t4c', 'Read', { file_path: SAVED }, REFERENCE_LINES.map((l, n) => `${n + 1}\t${l}`).join('\n')),
    ] : []),
    // Looking for a references folder (version B's role finds none): left out in both.
    ...use('tf', 'Bash', { command: "find . -path '*/references'" }, version === 'A' ? './.claude/skills/documenter/references' : ''),
    ...use('t5', 'Bash', { command: 'git log --stat -1' }, 'abc1234 install\n .claude/skills/documenter/references/readme.md | 145 +\n docs/guide.md | 3 +'),
    ...use('t6', 'Write', { file_path: '/work/.standards/docs/documentation/record.md', content: `Checked docs/guide.md${version === 'A' ? '; readme.md agrees' : ''}.` }, 'File created'),
    // A heredoc's body is what the command writes, not where it looks: kept, masked.
    ...(version === 'A' ? use('th', 'Bash', { command: "cat > docs/notes.md <<'EOF'\nPer .claude/skills/documenter/references/readme.md, no change.\nEOF" }, '') : []),
    // A heredoc fed to a shell runs, so what it names counts: left out.
    ...(version === 'A' ? use('ts', 'Bash', { command: "bash <<'EOF'\nhead -3 .claude/skills/documenter/SKILL.md\nEOF" }, '---\nname: documenter') : []),
    // A script written and run in one call looks at what it names: left out in
    // both versions (version B's finds no file).
    ...use('tw', 'Bash', { command: "cat > /tmp/x.sh <<'EOF'\ncat .claude/skills/documenter/references/readme.md\nEOF\nbash /tmp/x.sh" },
      version === 'A' ? REFERENCE_LINES.join('\n') : 'cat: .claude/skills/documenter/references/readme.md: No such file or directory'),
    // A written file that holds a cd does not move the shell: the next call stays.
    ...(version === 'A' ? use('tc', 'Bash', { command: "cat > later.sh <<'EOF'\ncd .claude/skills/documenter\nEOF" }, '') : []),
    ...use('t7', 'Bash', { command: 'cat docs/guide.md' }, 'The guide GUIDE_OK'),
    { type: 'result', result: 'Checked the guide against readme.md.', total_cost_usd: 1, usage: {}, num_turns: 3, subtype: 'success' },
  ];
  write(path.join(d, 'transcript.jsonl'), lines.map((l) => JSON.stringify(l)).join('\n'));
  write(path.join(d, 'run.json'), { case: 'documenter-38', projectRoot: '/work' });
  write(path.join(d, 'fixture.json'), { framework: BASE_COMMIT });
  write(path.join(d, 'verdicts.json'), { assertions: [
    { i: 0, text: 'The guide was checked [[GUIDE_OK]].', verdict: 'NEEDS_JUDGE', grader: 'judge', checks: [{ predicate: 'unchanged', pass: true, evidence: 'docs/** unchanged, as skills/documenter/references/readme.md asks' }] },
    { i: 1, text: 'Exact.', verdict: 'PASS', grader: 'deterministic', checks: [] }] });
  write(path.join(d, 'judge-requests', '0.json'), {});
  write(path.join(d, 'judge-evidence.json'), { scenario: 'Docs stay as they are.', authorSummary: 'No change.', groundTruth: '- the docs are right', priorTurns: '',
    userMessage: '/documenter Continue.', startupFiles: '', stateBefore: 'a', stateAfter: 'b',
    changedFiles: '--- .standards/docs/documentation/record.md (added)\nLeft the docs alone; .claude/skills/documenter/references/readme.md agrees.', timeline: 'THE UNMASKED TIMELINE', finalReply: 'Checked the guide against readme.md.' });
  return path.join(root, `${version}-documenter-38`);
}

try {
  // 1. The blinded judge on three runs of each version.
  const grader = { judge: { task: 'Add account lockout to the login.', items: [
    { id: 'lock', tier: 'outcome', text: 'PASS when the login locks: [[LOCKOUT]].' },
    { id: 'header', tier: 'reference', text: 'PASS when it sends [[RETRY_AFTER]].' },
    { id: 'leaky', tier: 'outcome', text: 'PASS when it follows security-fastapi.md.' }] } };
  const spec = { graderOnly: ['The login lives in app/main.py; readme.md is not part of the project.'] };
  const dirs = [];
  for (const v of ['A', 'B']) {
    for (let r = 1; r <= 3; r += 1) {
      const d = path.join(W, v, 'cases', 'developer-901', `r${r}`);
      taskRun(d, `# REP_${v}${r}\n${v === 'A' ? '# see .claude/skills/developer/references/security-fastapi.md\nLOCKOUT = True\n' : ''}def login(): pass\n`);
      dirs.push(d);
    }
  }
  const jobs = () => dirs.map((dir) => ({ dir, items: blindJobs({ dir, grader, spec }) }));
  const first = await judgeBlind(jobs(), { label: 'selftest' });
  const sent = calls();
  const v = (d) => readJson(path.join(d, 'blind-verdicts.json')).items;
  const leaders = [...new Set(sent.map((c) => (c.evidence.match(/REP_(\w\d)/) ?? [])[1]))];
  check('blinded judge: each item gets a verdict (A has the lockout, B not); an item naming a reference is blocked, not sent',
    first.sent === 12 && sent.length === 12
      && dirs.slice(0, 3).every((d) => v(d).lock.verdict === 'PASS' && v(d).header.verdict === 'FAIL')
      && dirs.slice(3).every((d) => v(d).lock.verdict === 'FAIL')
      && dirs.every((d) => v(d).leaky.verdict === 'ERROR' && v(d).leaky.blocked.includes('security-fastapi.md') && existsSync(path.join(d, 'blind-requests', 'lock.json'))),
    JSON.stringify({ first, n: sent.length, a: v(dirs[0]), b: v(dirs[3]) }));
  check('blinded judge: product-only, masked evidence (no state file; facts masked); the two versions\' runs are sent mixed, not in folder order',
    sent.every((c) => !/readme\.md|security-fastapi/.test(c.evidence) && c.evidence.includes('[framework file] is not part') && !c.evidence.includes('STATE.md') && c.evidence.includes('--- app/main.py (changed)'))
      && sent.filter((c) => c.evidence.includes('# see [framework file]\nLOCKOUT')).length === 6
      && leaders.length === 6 && leaders.join() !== 'A1,A2,A3,B1,B2,B3',
    JSON.stringify({ leaders, evidence: sent[0]?.evidence.slice(0, 300) }));
  const again = await judgeBlind(jobs(), { label: 'selftest' });
  grader.judge.items[1].text = 'PASS when the response sends [[RETRY_AFTER]].';
  const changed = await judgeBlind(jobs(), { label: 'selftest' });
  check('blinded judge: a rerun keeps the verdicts of identical requests; a changed item alone is sent again',
    again.sent === 0 && changed.sent === 6 && calls().length === 18, JSON.stringify({ again, changed, calls: calls().length }));

  // 2. documenter-38: the masked suite judge, both versions.
  const before = calls().length;
  const probeDirs = [probeRun(W, 'A'), probeRun(W, 'B')];
  const probe = await judgeProbe(probeDirs, { label: 'selftest' });
  const pc = calls().slice(before);
  const pv = (dir) => readJson(path.join(dir, 'cases', 'documenter-38', 'r1', 'verdicts.json')).assertions;
  const masked = readJson(path.join(probeDirs[0], 'cases', 'documenter-38', 'r1', 'judge-masked.json'));
  const maskedB = readJson(path.join(probeDirs[1], 'cases', 'documenter-38', 'r1', 'judge-masked.json'));
  const evA = pc.map((c) => c.evidence).find((e) => e.includes('Checked docs/guide.md; [framework file] agrees')) ?? '';
  check('documenter-38: calls that read or list framework files are left out and the rest renumbered; the rest stay, without framework-path lines, names masked; verdicts merge',
    probe.sent === 2 && pc.length === 2 && JSON.stringify(masked.dropped) === '[0,1,2,3,5,6,7,11,12]' && JSON.stringify(maskedB.dropped) === '[0,3]'
      && pc.every((c) => !/readme\.md|\.claude\/skills|skills\/documenter|Guided Mode|Protocol of A|THE UNMASKED TIMELINE|Documentation Impact|tool-results/.test(c.evidence))
      && /\[tool call 0\] Bash: cd \/work && pnpm test\n--- output ---\ntests pass/.test(evA)
      && /\[tool call 1\] Bash: git log --stat -1\n--- output ---\nabc1234 install\n docs\/guide\.md \| 3 \+/.test(evA)
      && /\[tool call 2\] Write: .*record\.md.*Checked docs\/guide\.md; \[framework file\] agrees/.test(evA)
      && evA.includes("[tool call 3] Bash: cat > docs/notes.md <<'EOF'\nPer [framework file], no change.\nEOF")
      && evA.includes("[tool call 4] Bash: cat > later.sh <<'EOF'\ncd [framework file]\nEOF")
      && /\[tool call 5\] Bash: cat docs\/guide\.md/.test(evA) && !/\[tool call 6\]/.test(evA) && evA.includes('docs/guide.md and [framework file].')
      && probeDirs.every((d) => pv(d)[0].verdict === 'PASS' && pv(d)[1].verdict === 'PASS'),
    JSON.stringify({ probe, masked, evA: evA.slice(-900) }));

  // 3. Judge checks on those verdicts.
  const out1 = path.join(W, 'checks-1');
  mkdirSync(out1);
  const res1 = await referenceJudgeChecks({ outDir: out1, label: 'selftest', blindDirs: dirs, probeRunDirs: probeDirs });
  process.env.EVAL_FAKE_SECOND = 'flip';
  const out2 = path.join(W, 'checks-2');
  mkdirSync(out2);
  const res2 = await referenceJudgeChecks({ outDir: out2, label: 'selftest', blindDirs: dirs, probeRunDirs: probeDirs });
  delete process.env.EVAL_FAKE_SECOND;
  check('judge checks: a stable judge and an agreeing second judge meet both targets (blocked items left out); one that disagrees misses (exit 2)',
    res1.exit === 0 && res1.judged === 14 && res1.stability.compared === 14 && res1.secondJudge.compared === 10 && existsSync(path.join(out1, 'judge-checks.md'))
      && res2.exit === 2 && res2.secondJudge.meetsTarget === false && res2.stability.meetsTarget === true,
    JSON.stringify({ res1: [res1.exit, res1.judged, res1.stability.compared, res1.secondJudge.compared], res2: [res2.exit, res2.secondJudge.agreement] }));

  // 4. check-graders on a small git project: the starting project, a good
  // solution, a bad one, and one whose listed failures are wrong.
  const proj = path.join(W, 'project');
  write(path.join(proj, 'app', 'main.py'), 'def login(): pass\n');
  git(proj, 'init', '-q');
  git(proj, 'add', '-A');
  git(proj, 'commit', '-qm', 'start');
  const gdir = path.join(W, 'graders', 'developer-901');
  const patch = (name, edit) => {
    const tmp = path.join(W, `edit-${name}`);
    cpSync(proj, tmp, { recursive: true });
    edit(tmp);
    git(tmp, 'add', '-A');
    write(path.join(gdir, name), git(tmp, 'diff', '--cached'));
  };
  patch('good.patch', (d) => { write(path.join(d, 'ci.yml'), 'on: push\n'); write(path.join(d, 'app', 'main.py'), 'LOCKOUT = True\ndef login(): pass\n'); });
  patch('bad.patch', (d) => write(path.join(d, 'ci.yml'), 'on: push\n'));
  patch('wrong.patch', (d) => write(path.join(d, 'ci.yml'), 'on: push\n'));
  write(path.join(gdir, 'broken.patch'), 'not a patch\n');
  const manifest = { label: 'D1', reference: 'skills/developer/references/security-fastapi.md',
    checks: [{ id: 'ci', tier: 'outcome', text: 'ci.yml exists' }, { id: 'style', tier: 'control', text: 'app/main.py exists' }],
    judge: { task: 'Add lockout and CI.', items: [{ id: 'lock', tier: 'outcome', text: 'PASS when [[LOCKOUT]] is set.' }] },
    solutions: [{ patch: 'good.patch', kind: 'good' }, { patch: 'bad.patch', kind: 'bad', fails: ['lock'] }], leakGuard: ['LOCKOUT'] };
  write(path.join(gdir, 'grader.json'), manifest);
  write(path.join(gdir, 'host.mjs'), "import { existsSync } from 'node:fs';\nimport path from 'node:path';\n"
    + "export async function grade({ projectDir }) { return { checks: [{ id: 'ci', verdict: existsSync(path.join(projectDir, 'ci.yml')) ? 'PASS' : 'FAIL' }, { id: 'style', verdict: existsSync(path.join(projectDir, 'app', 'main.py')) ? 'PASS' : 'FAIL' }] }; }\n");
  const good = await checkTask({ key: 'developer-901', graderDir: gdir, startDir: proj, judge: true });
  await judgeTasks([good], { outDir: path.join(W, 'cg-1') });
  const okReport = report([good], { judged: true });
  write(path.join(gdir, 'grader.json'), { ...manifest, solutions: [...manifest.solutions, { patch: 'wrong.patch', kind: 'bad', fails: ['ci'] }, { patch: 'broken.patch', kind: 'good' }] });
  const bad = await checkTask({ key: 'developer-901', graderDir: gdir, startDir: proj, judge: true });
  await judgeTasks([bad], { outDir: path.join(W, 'cg-2') });
  const badReport = report([bad], { judged: true });
  check('check-graders: the start fails, the good solution passes, the bad one fails where it says (code checks and judge items, each graded twice the same)',
    okReport.exit === 0 && good.projects.length === 3 && good.projects.every((p) => p.repeatable && p.items.length === 1)
      && good.projects[0].checks.find((c) => c.id === 'style').want === null,
    `${okReport.md} ${JSON.stringify(good.problems)}`);
  check('check-graders: wrong listed failures are misses, and a patch that does not apply is reported (exit 2)',
    badReport.exit === 2 && badReport.misses.some((m) => /wrong\.patch: ci should FAIL, got PASS/.test(m)) && badReport.misses.some((m) => /wrong\.patch: lock should PASS, got FAIL/.test(m))
      && bad.unusable.some((p) => /broken\.patch does not apply/.test(p)) && badReport.misses.some((m) => /broken\.patch does not apply/.test(m)),
    JSON.stringify({ misses: badReport.misses, unusable: bad.unusable }));
  write(path.join(proj, 'docs', 'notes.md'), 'See references/style.md for LOCKOUT rules.\n');
  const flaky = path.join(W, 'graders', 'flaky');
  write(path.join(flaky, 'grader.json'), { reference: manifest.reference, checks: [{ id: 'ci', tier: 'outcome', text: 'ci.yml exists' }] });
  write(path.join(flaky, 'host.mjs'), "import { existsSync, readFileSync, writeFileSync } from 'node:fs';\nconst f = `${process.env.EVAL_FAKE_DIR}/flaky.count`;\n"
    + "export async function grade() { const n = (existsSync(f) ? Number(readFileSync(f, 'utf8')) : 0) + 1; writeFileSync(f, String(n)); return { checks: [{ id: 'ci', verdict: n % 2 ? 'FAIL' : 'PASS' }] }; }\n");
  const unsteady = report([await checkTask({ key: 'developer-901', graderDir: flaky, startDir: proj })], { judged: false });
  const halting = path.join(W, 'graders', 'halting');
  write(path.join(halting, 'grader.json'), { reference: manifest.reference, checks: [{ id: 'ci', tier: 'outcome', text: 'ci.yml exists' }] });
  write(path.join(halting, 'host.mjs'), "import { existsSync, readFileSync, writeFileSync } from 'node:fs';\nconst f = `${process.env.EVAL_FAKE_DIR}/halting.count`;\n"
    + "export async function grade() { const n = (existsSync(f) ? Number(readFileSync(f, 'utf8')) : 0) + 1; writeFileSync(f, String(n)); if (n % 2 === 0) throw new Error('docker went away'); return { checks: [{ id: 'ci', verdict: 'FAIL' }] }; }\n");
  const halted = await checkTask({ key: 'developer-901', graderDir: halting, startDir: proj });
  const haltedReport = report([halted], { judged: false });
  check('check-graders: a second grader run that cannot finish leaves repeatability unknown: an error, not a miss, and the pass record keeps its entry',
    halted.projects[0].repeatable === null && !haltedReport.misses.some((m) => /disagree/.test(m)) && haltedReport.errors.some((m) => /gave ERROR .*repeatability is not known/.test(m))
      && updatePassed({ 'developer-901': { judged: true } }, [{ ...halted, leaks: [], graderHash: 'g', fixtureHash: 'f', inputsHash: 'i' }], { judged: false })['developer-901']?.judged === true,
    JSON.stringify({ repeatable: halted.projects[0].repeatable, misses: haltedReport.misses, errors: haltedReport.errors }));
  const named = path.join(W, 'graders', 'named');
  write(path.join(named, 'grader.json'), { reference: manifest.reference, judge: { task: 'Add lockout.', items: [{ id: 'lock', tier: 'outcome', text: 'PASS when it follows readme.md.' }] } });
  const naming = report([await checkTask({ key: 'developer-901', graderDir: named, startDir: proj })], { judged: false });
  check('check-graders: without --execute, a rubric item that names a framework file is a miss', naming.exit === 2 && naming.misses.some((m) => /judge item lock: its request names readme\.md/.test(m)), JSON.stringify(naming.misses));
  check('check-graders: a grader whose two runs disagree is a miss', unsteady.exit === 2 && unsteady.misses.some((m) => /start: the two grader runs disagree/.test(m)), JSON.stringify(unsteady.misses));
  // The pass record: a pass is kept (an earlier judged pass of the same grader
  // and fixture stays judged), a failure is removed, and a task that could not
  // be graded (Docker down) keeps what it had.
  const record = { 'developer-901': { graderHash: 'g1', fixtureHash: 'f1', inputsHash: 'i1', judged: true }, 'developer-902': { graderHash: 'g2', fixtureHash: 'f2', inputsHash: 'i2', judged: true },
    'developer-903': { graderHash: 'g3', fixtureHash: 'f3', inputsHash: 'i3', judged: true }, 'developer-904': { graderHash: 'g4', fixtureHash: 'f4', inputsHash: 'i4', judged: true } };
  const notGraded = { key: 'developer-903', graderHash: 'g3', fixtureHash: 'f3', inputsHash: 'i3', leaks: [], blocked: [], unusable: [], problems: [],
    projects: [{ name: 'start', kind: 'start', repeatable: null, problems: ['container: Docker not available'], checks: [{ id: 'ci', outcome: 'error' }] }] };
  const after = updatePassed(record, [{ ...good, key: 'developer-901', graderHash: 'g1', fixtureHash: 'f1', inputsHash: 'i1' }, { ...bad, key: 'developer-902', graderHash: 'g2', fixtureHash: 'f2', inputsHash: 'i2' },
    notGraded, { ...good, key: 'developer-904', graderHash: 'g4', fixtureHash: 'f4', inputsHash: 'new-facts' }], { judged: false, at: 'T' });
  check('check-graders: the pass record keeps a judged pass, removes a failure, leaves a task that could not be graded as it was, and needs the judge again after its inputs change',
    after['developer-901']?.judged === true && after['developer-901'].at === 'T' && !after['developer-902'] && JSON.stringify(after['developer-903']) === JSON.stringify(record['developer-903'])
      && after['developer-904']?.judged === false && after['developer-904'].inputsHash === 'new-facts',
    JSON.stringify(after));
  check('check-graders: a grader passes only when every project meets its expectations, with the judge\'s items when judged',
    passedCase(good, { judged: true }) && !passedCase(bad, { judged: true }) && !passedCase({ ...good, projects: good.projects.slice(0, 1) }, { judged: true })
      && !passedCase({ ...good, projects: good.projects.map((p, n) => (n === 1 ? { ...p, items: p.items.map((x) => ({ ...x, outcome: 'miss' })) } : p)) }, { judged: true })
      && passedCase({ ...good, projects: good.projects.map((p) => ({ ...p, items: undefined })) }, { judged: false }), '');
  // The installer's block in AGENTS.md names the protocol; the project's own text must not.
  write(path.join(proj, 'AGENTS.md'), '<!-- standards:start -->\nRead .standards/PROTOCOL.md and .standards/protocol/.\n<!-- standards:end -->\n');
  const found = leaks(proj, { leakGuard: ['LOCKOUT', 'absent'] });
  write(path.join(proj, 'AGENTS.md'), '# Agents\nSee skills/developer/references/fastapi.md.\n<!-- standards:start -->\nRead .standards/PROTOCOL.md.\n<!-- standards:end -->\n');
  const own = leaks(proj, { leakGuard: [] });
  check('check-graders: the leak guard finds a listed string and a file the judge\'s masking would change, but not the installer\'s block in AGENTS.md',
    found.length === 2 && found.some((l) => /"LOCKOUT" is in docs\/notes\.md/.test(l)) && found.some((l) => /docs\/notes\.md: the judge's masking would change it/.test(l))
      && own.some((l) => /^AGENTS\.md: the judge's masking would change it/.test(l)),
    JSON.stringify({ found, own }));
} catch (error) {
  check('reference evals self-test ran', false, error.stack);
}

console.log(JSON.stringify({ checks }));
