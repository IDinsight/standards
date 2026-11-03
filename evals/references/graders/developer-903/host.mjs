// developer-903 (D3, CI for apps/api in a monorepo). Runs on the host
// (graders.mjs): it reads the workflow files with the yaml package, which runs
// nothing, and the service's Python settings as text.
//
// Which Python a test command runs on follows uv (checked with uv 0.7): an
// explicit --python on the command, then UV_PYTHON (on the command, exported
// earlier in the step, step, job, or workflow env, or setup-uv's
// python-version input, which sets it), then a pin for apps/api
// (`uv python pin`, or a version echoed into its .python-version), then, for
// a command that reuses the synced environment (uv run --no-sync,
// .venv/bin/..., or an activated .venv), how that sync chose; otherwise
// apps/api/.python-version (3.12) wins, even after `uv sync --python`.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import YAML from 'yaml';

const SERVICE = 'apps/api';
const VERSIONS = ['3.11', '3.12', '3.13'];
const PINNED = '3.12';
const MATRIX = /\$\{\{\s*matrix\.([\w-]+)\s*\}\}/;
// A flag's value, quotes stripped: one word, in which ${{ ... }} expressions
// (which may hold spaces) count as part of the word.
const VALUE = String.raw`["']?((?:\$\{\{[^}]*\}\}|[^\s"'])+)["']?`;
const CD = new RegExp(String.raw`^cd\s+${VALUE}$`);
// uv --directory runs the command in that folder; --project does not change it.
const DIRECTORY = new RegExp(String.raw`\buv\b.*?--directory[ =]${VALUE}`);
const PROJECT = new RegExp(String.raw`\buv\b.*?--project[ =]${VALUE}`);
// pytest as a command word (not pytest-cov or another pytest-* package).
const PYTEST = /(?:^|[\s/])pytest(?=\s|$)/;
const EXPORT = new RegExp(String.raw`^export\s+UV_PYTHON=${VALUE}$`);
const ECHO_PIN = new RegExp(String.raw`^echo\s+${VALUE}\s*>\s*${VALUE}$`);

const asList = (v) => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v]);
// A folder or path from the repository root: quotes, a leading ./, and the
// workspace prefix (${{ github.workspace }}/ or $GITHUB_WORKSPACE/) dropped.
const WORKSPACE = /^(?:\$\{\{\s*github\.workspace\s*\}\}|\$\{?GITHUB_WORKSPACE\}?)(?:\/|$)/;
const unquote = (d) => String(d ?? '').trim().replace(/^(["'])(.*)\1$/, '$2');
const norm = (d) => (path.posix.normalize(unquote(d ?? '.').replace(WORKSPACE, '').replace(/^\.\/+/, '') || '.').replace(/\/$/, '') || '.');
// A path in the runner's own folders (${{ runner.temp }}, $RUNNER_TEMP, $HOME).
const RUNNER = /^(?:\$\{\{\s*runner\.\w+\s*\}\}|\$\{?(?:RUNNER_\w+|HOME)\}?|~)(?:\/|$)/;
// Where a cd, --directory, or report path leads from dir: a workspace, runner,
// or absolute path as it is, anything else relative to dir.
const into = (dir, to) => (WORKSPACE.test(to) || RUNNER.test(to) || to.startsWith('/') ? norm(to) : norm(path.posix.join(dir, to)));
const inService = (d) => d === SERVICE || d.endsWith(`/${SERVICE}`);
const uses = (step, action) => String(step?.uses ?? '').toLowerCase().startsWith(action);

function workflows(projectDir) {
  const dir = path.join(projectDir, '.github', 'workflows');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort().map((file) => {
    const text = readFileSync(path.join(dir, file), 'utf8');
    try {
      const wf = YAML.parse(text);
      return { file, wf: wf && typeof wf === 'object' ? wf : null, error: wf && typeof wf === 'object' ? null : 'not a mapping' };
    } catch (error) {
      return { file, wf: null, error: error.message };
    }
  });
}

// Each command a job runs: one per line and per && or ;, shell comments
// dropped, with the folder it runs in (a cd moves the commands after it) and
// its environment.
function commands(wf, job) {
  const out = [];
  const base = norm(job.defaults?.run?.['working-directory'] ?? wf.defaults?.run?.['working-directory'] ?? '.');
  asList(job.steps).forEach((step, index) => {
    if (typeof step?.run !== 'string') return;
    let dir = norm(step['working-directory'] ?? base);
    const env = { ...(wf.env ?? {}), ...(job.env ?? {}), ...(step.env ?? {}) };
    for (const line of step.run.replace(/\\\n/g, ' ').split('\n')) {
      for (const part of line.replace(/(?:^|\s)#.*$/, '').split(/&&|;/)) {
        const cmd = part.trim();
        if (!cmd) continue;
        const cd = cmd.match(CD);
        if (cd) { dir = into(dir, cd[1]); continue; }
        const flag = cmd.match(DIRECTORY);
        out.push({ cmd, dir: flag ? into(dir, flag[1]) : dir, env, step, index, order: out.length });
      }
    }
  });
  return out;
}

// The version a command pins for apps/api: `uv python pin <version>` run there
// or with --project apps/api (uv writes .python-version in the project), or
// `echo <version> > .python-version` into apps/api.
function pinOf(c) {
  if (/\buv\b.*\bpython\s+pin\b/.test(c.cmd)) {
    const project = c.cmd.match(PROJECT);
    const words = [...c.cmd.replace(/^.*?\bpin\b/, '').matchAll(new RegExp(VALUE, 'g'))].map((m) => m[1]);
    const version = words.find((w) => MATRIX.test(w) || /\b3\.\d+/.test(w));
    return version && inService(project ? into(c.dir, project[1]) : c.dir) ? version : null;
  }
  const echo = c.cmd.match(ECHO_PIN);
  return echo && path.posix.basename(echo[2]) === '.python-version' && inService(path.posix.dirname(into(c.dir, echo[2]))) ? echo[1] : null;
}

function matrixValues(job, key) {
  const m = job.strategy?.matrix;
  if (!m || typeof m !== 'object') return [];
  const vals = asList(m[key]).map(String);
  for (const inc of asList(m.include)) if (inc && typeof inc === 'object' && inc[key] !== undefined) vals.push(String(inc[key]));
  return vals;
}

// The Python versions one test command runs on, and what chose them: the
// first source that names a version, in the order uv and GitHub Actions apply
// them (a step's env beats a value an earlier step wrote to $GITHUB_ENV or
// setup-uv set, which beats the job's and workflow's env).
function testVersions(wf, job, test, cmds) {
  const resolve = (value, how) => {
    const m = String(value).match(MATRIX);
    if (m) return { versions: matrixValues(job, m[1]).map((v) => v.match(/3\.\d+/)?.[0] ?? v), how: `${how} (matrix.${m[1]})` };
    const lit = String(value).match(/(3\.\d+)/);
    return { versions: lit ? [lit[1]] : [], how };
  };
  const sources = [];
  const head = test.cmd.split(PYTEST)[0];
  const flag = head.match(new RegExp(String.raw`(?:--python|-p)[ =]${VALUE}`));
  if (flag) sources.push([flag[1], '--python on the test command']);
  const inline = head.match(new RegExp(String.raw`(?:^|\s)UV_PYTHON=${VALUE}`));
  if (inline) sources.push([inline[1], 'UV_PYTHON on the test command']);
  const exported = cmds.filter((c) => c.index === test.index && c.order < test.order).map((c) => c.cmd.match(EXPORT)).filter(Boolean).pop();
  if (exported) sources.push([exported[1], 'UV_PYTHON exported earlier in the step']);
  if (test.step.env?.UV_PYTHON !== undefined) sources.push([test.step.env.UV_PYTHON, "UV_PYTHON in the step's env"]);
  const writes = new RegExp(String.raw`UV_PYTHON=${VALUE}[^\n]*>>\s*["']?\$\{?GITHUB_ENV`);
  const setter = asList(job.steps).slice(0, test.index).map((s, i) => {
    if (uses(s, 'astral-sh/setup-uv') && s.with?.['python-version'] !== undefined) return [s.with['python-version'], "setup-uv's python-version"];
    const write = cmds.filter((c) => c.index === i).map((c) => c.cmd.match(writes)).filter(Boolean).pop();
    return write ? [write[1], 'UV_PYTHON written to $GITHUB_ENV'] : null;
  }).filter(Boolean).pop();
  if (setter) sources.push(setter);
  const env = { ...(wf.env ?? {}), ...(job.env ?? {}) };
  if (env.UV_PYTHON !== undefined) sources.push([env.UV_PYTHON, 'UV_PYTHON in the job or workflow env']);
  for (const [value, how] of sources) {
    const r = resolve(value, how);
    if (r.versions.length) return r;
  }
  const earlier = cmds.filter((c) => c.order < test.order);
  const pin = earlier.map(pinOf).filter(Boolean).pop();
  const pinned = pin && resolve(pin, 'a pin in apps/api (uv python pin or .python-version)');
  if (pinned?.versions.length) return pinned;
  // A command that reuses the synced environment: uv run --no-sync, a
  // .venv/bin/ path, or a command other than uv run after the same step
  // activates .venv.
  const activated = !/\buv\s+run\b/.test(test.cmd) && earlier.some((c) => c.index === test.index && /^(?:source|\.)\s+["']?\S*\.venv\/bin\/activate\b/.test(c.cmd));
  if (/--no-sync\b|\.venv\/bin\//.test(test.cmd) || activated) {
    const sync = earlier.filter((c) => /\buv\s+sync\b/.test(c.cmd)).pop();
    const sp = sync?.cmd.match(new RegExp(String.raw`(?:--python|-p)[ =]${VALUE}`));
    const reused = sp ? resolve(sp[1], 'the sync the test command reuses') : sync && sync.env.UV_PYTHON !== undefined ? resolve(sync.env.UV_PYTHON, 'UV_PYTHON on the sync the test command reuses') : null;
    if (reused?.versions.length) return reused;
  }
  return { versions: [PINNED], how: '.python-version (nothing selects another version)' };
}

// Where a job's test commands write coverage files, from the repository root:
// the data file, and each --cov-report file or folder.
function coverageFiles(cmds) {
  const named = { xml: 'coverage.xml', html: 'htmlcov', json: 'coverage.json', lcov: 'coverage.lcov' };
  return cmds.filter((c) => /\bpytest\b.*--cov\b/.test(c.cmd)).flatMap((c) => [
    norm(path.posix.join(c.dir, '.coverage')),
    ...[...c.cmd.matchAll(new RegExp(String.raw`--cov-report[ =]["']?(xml|html|json|lcov)(?::${VALUE})?`, 'g'))].map((m) => into(c.dir, m[2] ?? named[m[1]])),
  ]);
}

// Whether an upload's path (lines; ! excludes ignored) reaches one of the files.
// upload-artifact reads paths from the repository root, whatever defaults.run
// says, and leaves out hidden files (.coverage) unless include-hidden-files is
// true. A ${{ ... }} expression on either side, or a shell variable in a
// report path, stands for any one name.
function uploadReaches(step, files) {
  const EXPR = /\$\{\{[^}]*\}\}/g;
  const VAR = /\$\{\{[^}]*\}\}|\$\{?[A-Za-z_]\w*\}?/g;
  const glob = (g) => new RegExp(`^${g.split(/(\*\*\/|\*\*|\*)/).map((p) => (p === '**/' ? '(?:.*/)?' : p === '**' ? '.*' : p === '*' ? '[^/]*' : p.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))).join('')}$`);
  const hidden = String(step.with?.['include-hidden-files']) === 'true';
  const targets = files.filter((f) => hidden || !f.split('/').some((p) => /^\.[^.]/.test(p))).map((f) => f.replace(VAR, '\u0001'));
  const lines = String(step.with?.path ?? '').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('!')).map(norm);
  return lines.some((l) => {
    const literal = l.replace(EXPR, '\u0001');
    const pattern = glob(l.replace(EXPR, '*'));
    return targets.some((f) => f === literal || f.startsWith(`${literal}/`) || pattern.test(f));
  });
}

function triggers(wf) {
  const on = wf.on ?? wf[true];
  if (typeof on === 'string') return { [on]: {} };
  if (Array.isArray(on)) return Object.fromEntries(on.map((e) => [e, {}]));
  return on && typeof on === 'object' ? on : {};
}

const conditionHoldsOnFailure = (cond) => /always\(\)|!\s*cancelled\(\)|success\(\)\s*\|\|\s*failure\(\)|failure\(\)\s*\|\|\s*success\(\)/.test(String(cond ?? ''));
const readOnly = (p) => p === undefined ? null : p === 'read-all' || (p && typeof p === 'object' && Object.values(p).every((v) => v === 'read' || v === 'none'));

export async function grade({ projectDir }) {
  const wfs = workflows(projectDir);
  const parsed = wfs.filter((w) => w.wf);
  const jobs = parsed.flatMap(({ file, wf }) => Object.entries(wf.jobs ?? {}).filter(([, job]) => job && typeof job === 'object').map(([id, job]) => ({ file, wf, id, job, cmds: commands(wf, job) })));
  const testJobs = jobs.filter((j) => j.cmds.some((c) => /\bpytest\b/.test(c.cmd)));
  const checks = [];
  const add = (id, ok, detail) => checks.push({ id, verdict: ok ? 'PASS' : 'FAIL', detail });
  const none = wfs.length ? `${wfs.map((w) => `${w.file}${w.error ? ` (does not parse: ${w.error})` : ''}`).join(', ')}` : 'no workflow under .github/workflows';

  // matrix-python: the tests run on each of 3.11, 3.12, and 3.13.
  const runs = testJobs.flatMap((j) => j.cmds.filter((c) => /\bpytest\b/.test(c.cmd)).map((c) => ({ job: j.id, ...testVersions(j.wf, j.job, c, j.cmds) })));
  const covered = new Set(runs.flatMap((r) => r.versions));
  add('matrix-python', runs.length > 0 && VERSIONS.every((v) => covered.has(v)),
    runs.length ? runs.map((r) => `${r.job}: ${r.versions.join(', ') || 'no version'} from ${r.how}`).join('; ') : `no job runs pytest (${none})`);

  // Coverage uploads in the test jobs.
  // The uploads that really take the coverage report: their path reaches a file the tests write.
  const uploads = testJobs.map((j) => ({ j, steps: asList(j.job.steps).filter((s) => uses(s, 'actions/upload-artifact') && uploadReaches(s, coverageFiles(j.cmds))) }));
  const allUpload = uploads.length > 0 && uploads.every((u) => u.steps.length);
  add('coverage-always', allUpload && uploads.every((u) => u.steps.some((s) => conditionHoldsOnFailure(s.if))),
    uploads.length ? uploads.map((u) => `${u.j.id}: ${u.steps.length ? u.steps.map((s) => `upload if: ${s.if ?? '(none: only on success)'}`).join(', ') : `no upload reaches ${coverageFiles(u.j.cmds).join(', ') || 'a coverage file'}`}`).join('; ') : 'no test job');
  const names = uploads.flatMap((u) => u.steps.map((s) => ({ job: u.j.id, name: String(s.with?.name ?? 'artifact'), legs: Object.keys(u.j.job.strategy?.matrix ?? {}).length ? matrixLegs(u.j.job) : 1 })));
  const varying = (n) => /matrix\.|strategy\.job-index/.test(n);
  const literal = names.filter((n) => !varying(n.name)).map((n) => n.name);
  const uniqueNames = allUpload && names.every((n) => n.legs <= 1 || varying(n.name)) && new Set(literal).size === literal.length;
  add('artifact-names', uniqueNames, names.length ? names.map((n) => `${n.job}: "${n.name}" for ${n.legs} run(s)`).join('; ') : 'no coverage upload');

  // no-threshold: tests run with coverage and nothing sets a failure threshold.
  const withCov = runs.length > 0 && testJobs.some((j) => j.cmds.some((c) => /\bpytest\b.*--cov\b/.test(c.cmd)));
  const allCmds = jobs.flatMap((j) => j.cmds.map((c) => c.cmd));
  const configs = ['pyproject.toml', '.coveragerc', 'setup.cfg', 'tox.ini', 'pytest.ini'].map((f) => path.join(projectDir, SERVICE, f)).filter(existsSync);
  const thresholdIn = [...allCmds.filter((c) => /--cov-fail-under|\bcoverage\b.*--fail-under\b/.test(c)), ...configs.filter((f) => /fail_under|cov-fail-under/.test(readFileSync(f, 'utf8'))).map((f) => path.relative(projectDir, f))];
  add('no-threshold', withCov && !thresholdIn.length, `${withCov ? 'tests run with coverage' : 'no test command runs with --cov'}; threshold in: ${thresholdIn.join(', ') || 'nothing'}`);

  // setup-points-at-service: every setup action names apps/api in its inputs.
  const setups = jobs.flatMap((j) => asList(j.job.steps).filter((s) => uses(s, 'astral-sh/setup-uv') || uses(s, 'actions/setup-python')).map((s) => ({ job: j.id, s })));
  add('setup-points-at-service', setups.length > 0 && setups.every(({ s }) => Object.values(s.with ?? {}).some((v) => String(v).includes(SERVICE))),
    setups.length ? setups.map(({ job, s }) => `${job}: ${s.uses} with ${JSON.stringify(s.with ?? {})}`).join('; ') : 'no setup action');

  add('test-timeout-15', testJobs.length > 0 && testJobs.every((j) => Number(j.job['timeout-minutes']) === 15), testJobs.map((j) => `${j.id}: ${j.job['timeout-minutes'] ?? 'none'}`).join('; ') || 'no test job');

  // Controls.
  const wanted = [['ruff check', /\bruff\s+check\b/], ['ruff format --check', /\bruff\s+format\b.*--check\b/], ['mypy app', /\bmypy\b.*\bapp\b/], ['pytest --cov', /\bpytest\b.*--cov\b/], ['uv build', /\buv\s+build\b/]];
  const placed = wanted.map(([label, re]) => [label, jobs.flatMap((j) => j.cmds).filter((c) => re.test(c.cmd)).map((c) => c.dir)]);
  add('commands-in-service', placed.every(([, dirs]) => dirs.length && dirs.every(inService)), placed.map(([l, d]) => `${l}: ${d.join(', ') || 'missing'}`).join('; '));
  const trig = parsed.map((w) => ({ file: w.file, t: triggers(w.wf) }));
  const toMain = (ev) => ev !== undefined && (!ev || !ev.branches || asList(ev.branches).includes('main'));
  add('triggers-main', trig.length > 0 && trig.every(({ t }) => toMain(t.push) && toMain(t.pull_request)), trig.map(({ file, t }) => `${file}: ${Object.keys(t).join(', ')}`).join('; ') || none);
  const covers = (ev) => ev && typeof ev === 'object' && ['apps/api', 'packages/shared'].every((d) => asList(ev.paths).some((p) => String(p).startsWith(d)));
  add('paths-filters', trig.length > 0 && trig.every(({ t }) => covers(t.push) && covers(t.pull_request)), trig.map(({ file, t }) => `${file}: push ${JSON.stringify(t.push?.paths ?? null)}, pull_request ${JSON.stringify(t.pull_request?.paths ?? null)}`).join('; ') || none);
  const matrixJobs = testJobs.filter((j) => j.job.strategy?.matrix);
  add('fail-fast-false', matrixJobs.length > 0 && matrixJobs.every((j) => j.job.strategy['fail-fast'] === false), matrixJobs.map((j) => `${j.id}: fail-fast ${j.job.strategy['fail-fast'] ?? '(default true)'}`).join('; ') || 'no matrix job');
  const syncs = allCmds.filter((c) => /\buv\s+sync\b/.test(c));
  const uvRuns = allCmds.filter((c) => /\buv\s+run\b/.test(c));
  const frozen = (c) => /--frozen|--locked/.test(c);
  add('frozen-sync', (syncs.length ? syncs.every(frozen) : uvRuns.length > 0 && uvRuns.every(frozen)), `uv sync: ${syncs.join(' | ') || 'none'}`);
  const perms = parsed.map((w) => ({ file: w.file, top: readOnly(w.wf.permissions), jobs: Object.values(w.wf.jobs ?? {}).map((j) => readOnly(j?.permissions)) }));
  add('read-only-permissions', perms.length > 0 && perms.every((p) => p.jobs.every((j) => j !== false) && (p.top === true || (p.top === null && p.jobs.length && p.jobs.every((j) => j === true)))),
    parsed.map((w) => `${w.file}: ${JSON.stringify(w.wf.permissions ?? null)}`).join('; ') || none);
  add('job-timeouts', jobs.length > 0 && jobs.every((j) => j.job['timeout-minutes'] !== undefined), jobs.map((j) => `${j.id}: ${j.job['timeout-minutes'] ?? 'none'}`).join('; ') || none);
  const allUploads = jobs.flatMap((j) => asList(j.job.steps).filter((s) => uses(s, 'actions/upload-artifact')));
  add('retention-days', allUploads.length > 0 && allUploads.every((s) => s.with?.['retention-days'] !== undefined), `${allUploads.length} upload(s); retention-days: ${allUploads.map((s) => s.with?.['retention-days'] ?? 'none').join(', ') || 'n/a'}`);
  const cache = jobs.some((j) => asList(j.job.steps).some((s) => (uses(s, 'astral-sh/setup-uv') && (String(s.with?.['enable-cache']) === 'true' || (s.with?.['enable-cache'] === undefined && Number((String(s.uses).match(/@v(\d+)/) ?? [])[1]) >= 6)))
    || (uses(s, 'actions/cache') && /uv\.lock/.test(String(s.with?.key ?? '')))));
  add('dependency-cache', cache, cache ? 'uv cache enabled' : 'no uv cache keyed on the lockfile');
  return { checks };
}

// How many runs a matrix job makes (its combinations, or the include entries alone).
function matrixLegs(job) {
  const m = job.strategy?.matrix ?? {};
  const dims = Object.entries(m).filter(([k]) => k !== 'include' && k !== 'exclude').map(([, v]) => asList(v).length);
  return Math.max(dims.reduce((a, b) => a * b, dims.length ? 1 : 0), asList(m.include).length);
}
