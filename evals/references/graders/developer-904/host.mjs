// developer-904 (D4, dependency audit and CI failure notification). Runs on
// the host (graders.mjs): it reads the workflow files with the yaml package,
// which runs nothing, and pyproject.toml as text.
//
// The audit checks the locked dependencies when pip-audit runs in the synced
// project environment (`uv run pip-audit` with pip-audit in a development
// dependency group, `uv run --with pip-audit pip-audit`, or the environment's
// own .venv/bin/pip-audit), or reads requirements that `uv export` wrote
// earlier in the job, or the PyPA action is pointed at either. Run any other
// way (`uvx pip-audit`, `pip install pip-audit && pip-audit`), it audits an
// environment without the project's packages. uv.lock is not graded: no run
// can regenerate it offline, so a form that needs `uv lock` after pip-audit
// joins the dev group (uv sync --locked, uv run --frozen) still passes.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import YAML from 'yaml';

const CI_JOBS = ['lint', 'type-check', 'test', 'build'];
const SECRET = /secrets\.SLACK_WEBHOOK_URL/;
// A flag's value, quotes stripped: one word, or a whole ${{ ... }} expression,
// which may hold spaces.
const VALUE = String.raw`["']?(\$\{\{[^}]*\}\}|[^\s"']+)["']?`;

const asList = (v) => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v]);
const uses = (step, action) => String(step?.uses ?? '').toLowerCase().startsWith(action);
const squash = (s) => String(s ?? '').replace(/\s+/g, ' ').replace(/"/g, "'");

function workflows(projectDir) {
  const dir = path.join(projectDir, '.github', 'workflows');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort().map((file) => {
    const text = readFileSync(path.join(dir, file), 'utf8');
    try {
      const wf = YAML.parse(text);
      return { file, text, wf: wf && typeof wf === 'object' ? wf : null };
    } catch {
      return { file, text, wf: null };
    }
  });
}

// Each command a job runs: one per line and per && or ;.
function commands(job) {
  const out = [];
  asList(job.steps).forEach((step, index) => {
    if (typeof step?.run !== 'string') return;
    for (const line of step.run.replace(/\\\n/g, ' ').split('\n')) {
      for (const part of line.split(/&&|;/)) {
        const cmd = part.trim();
        if (cmd && !cmd.startsWith('#')) out.push({ cmd, step, index, order: out.length });
      }
    }
  });
  return out;
}

function triggers(wf) {
  const on = wf.on ?? wf[true];
  if (typeof on === 'string') return { [on]: {} };
  if (Array.isArray(on)) return Object.fromEntries(on.map((e) => [e, {}]));
  return on && typeof on === 'object' ? on : {};
}

// Whether a development dependency group in pyproject.toml lists pip-audit.
function devGroupHasPipAudit(projectDir) {
  const f = path.join(projectDir, 'pyproject.toml');
  if (!existsSync(f)) return false;
  const text = readFileSync(f, 'utf8').replace(/#.*$/gm, '');
  const section = (name) => (text.split(/^\[/m).find((s) => s.startsWith(`${name}]`)) ?? '');
  return /["']pip-audit\b/.test(section('dependency-groups')) || /dev-dependencies[\s\S]*["']pip-audit\b/.test(section('tool.uv'));
}

// How an audit job checks the locked dependencies, or null.
function auditForm(job, inDevGroup) {
  const cmds = commands(job);
  const exported = new Set();
  for (const c of cmds) {
    if (/\buv\s+export\b/.test(c.cmd)) {
      const out = c.cmd.match(new RegExp(String.raw`(?:-o|--output-file)[ =]${VALUE}|>\s*(\S+)`));
      if (out) exported.add(out[1] ?? out[2]);
    }
    const audit = c.cmd.match(/\bpip-audit\b(.*)$/);
    if (!audit || /\bpip\s+install\b|\buv\s+(?:tool|pip)\s+install\b/.test(c.cmd)) continue;
    const before = c.cmd.slice(0, audit.index);
    const req = audit[1].match(new RegExp(String.raw`(?:-r|--requirement)[ =]${VALUE}`));
    if (req && exported.has(req[1])) return `pip-audit -r ${req[1]}, exported by uv export`;
    // uv export piped straight in, or given by process substitution.
    if ((req && /^(?:\/dev\/stdin|-)$/.test(req[1]) && /\buv\s+export\b[^|]*\|/.test(before)) || /(?:-r|--requirement)[ =]?<\(\s*uv\s+export\b/.test(audit[1])) return 'pip-audit on requirements uv export writes from the lock';
    const synced = cmds.some((s) => s.order < c.order && /\buv\s+sync\b/.test(s.cmd));
    if (/--path[ =]\S*\.venv\b/.test(audit[1]) && synced) return 'pip-audit --path on the synced environment';
    if (inDevGroup && synced && !before.trim() && cmds.some((s) => s.index === c.index && s.order < c.order && /\.venv\/bin\/activate\b/.test(s.cmd))) return 'pip-audit in the activated synced environment';
    if (/\buv\s+run\b/.test(before) && !/--no-project|--isolated|--no-dev|--no-default-groups|--only-dev|--only-group/.test(before)) {
      if (/--with[ =]['"]?pip-audit/.test(before)) return 'uv run --with pip-audit pip-audit in the project environment';
      if (inDevGroup) return 'uv run pip-audit, with pip-audit in a development group';
    }
    if (/\.venv\/bin\/pip-audit/.test(c.cmd) && inDevGroup && cmds.some((s) => s.order < c.order && /\buv\s+sync\b/.test(s.cmd))) return "the synced environment's own pip-audit";
  }
  for (const step of asList(job.steps).filter((s) => uses(s, 'pypa/gh-action-pip-audit'))) {
    const inputs = String(step.with?.inputs ?? '');
    if (inputs && inputs.split(/\s+/).some((f) => exported.has(f))) return 'the PyPA action on requirements exported by uv export';
    if (step.with?.['virtual-environment'] && cmds.some((c) => /\buv\s+sync\b/.test(c.cmd))) return 'the PyPA action on the synced environment';
  }
  return null;
}

const FAILED = /failure\(\)|\.result\s*==\s*'failure'|contains\(\s*needs\.\*\.result\s*,\s*'failure'\s*\)|workflow_run\.conclusion\s*==\s*'failure'/;
const ON_MAIN = /github\.ref\s*==\s*'refs\/heads\/main'|github\.ref_name\s*==\s*'main'|workflow_run\.head_branch\s*==\s*'main'/;
const PUSH_ONLY = /github\.event_name\s*==\s*'push'|github\.event_name\s*!=\s*'pull_request'/;
const RUN_FROM_PUSH = /workflow_run\.event\s*==\s*'push'|workflow_run\.event\s*!=\s*'pull_request'/;

export async function grade({ projectDir }) {
  const wfs = workflows(projectDir).filter((w) => w.wf);
  const jobs = wfs.flatMap((w) => Object.entries(w.wf.jobs ?? {}).filter(([, job]) => job && typeof job === 'object').map(([id, job]) => ({ ...w, id, job })));
  const checks = [];
  const add = (id, ok, detail) => checks.push({ id, verdict: ok ? 'PASS' : 'FAIL', detail });
  const ciFile = jobs.find((j) => j.id === 'test' && commands(j.job).some((c) => /\bpytest\b/.test(c.cmd)))?.file ?? 'ci.yml';
  const ciName = wfs.find((w) => w.file === ciFile)?.wf.name ?? 'CI';

  // The audit.
  const inDevGroup = devGroupHasPipAudit(projectDir);
  const audits = jobs.filter((j) => commands(j.job).some((c) => /\bpip-audit\b/.test(c.cmd)) || asList(j.job.steps).some((s) => uses(s, 'pypa/gh-action-pip-audit')));
  const forms = audits.map((j) => ({ j, form: auditForm(j.job, inDevGroup) }));
  add('audit-locked-deps', forms.some((f) => f.form), forms.length
    ? forms.map((f) => `${f.j.file}/${f.j.id}: ${f.form ?? `not the project's locked dependencies (${commands(f.j.job).filter((c) => /pip-audit/.test(c.cmd)).map((c) => c.cmd).join(' | ') || 'the PyPA action'}; pip-audit in a dev group: ${inDevGroup})`}`).join('; ')
    : 'no job runs pip-audit');

  // The CI failure notification: a job in the CI workflow, a workflow_run
  // workflow on CI, or a failure step in each CI job, that sends to the
  // webhook. The secret may be read in the job, its steps, or its workflow's
  // env (then the steps use $SLACK_WEBHOOK_URL). A unit's condition is the
  // job's if together with the if of each step that sends. Slack alerts for
  // anything else (the audit, say) are not this notification.
  const sends = (w, x) => SECRET.test(JSON.stringify(x ?? {})) || (SECRET.test(JSON.stringify(w.wf.env ?? {})) && /\bSLACK_WEBHOOK_URL\b/.test(JSON.stringify(x ?? {})));
  // The steps of a job that send, and each one's own condition ('' when it has none).
  const stepConds = (w, job) => asList(job.steps).filter((s) => sends(w, s) || (SECRET.test(JSON.stringify(job.env ?? {})) && /\bSLACK_WEBHOOK_URL\b/.test(JSON.stringify(s ?? {})))).map((s) => s.if ?? '');
  const units = [];
  for (const j of jobs) {
    const t = triggers(j.wf);
    if (CI_JOBS.includes(j.id) && j.file === ciFile) continue;
    if (!sends(j, j.job)) continue;
    const cond = [j.job.if, ...stepConds(j, j.job)].filter(Boolean).map(squash).join(' && ');
    if (t.workflow_run && asList(t.workflow_run.workflows).includes(ciName)) units.push({ kind: 'workflow_run', j, cond, t });
    else if (j.file === ciFile) units.push({ kind: 'job', j, cond, t });
  }
  const ciJobs = CI_JOBS.map((id) => jobs.find((j) => j.file === ciFile && j.id === id));
  const ciSteps = ciJobs.map((j) => (j && sends(j, j.job) ? stepConds(j, j.job).map((c) => [j.job.if, c].filter(Boolean).map(squash).join(' && ')) : []));
  if (ciSteps.some((s) => s.length)) units.push({ kind: 'steps', conds: ciSteps.flat(), all: ciSteps.every((s) => s.length), t: triggers(wfs.find((w) => w.file === ciFile)?.wf ?? {}) });
  const covers = (u) => (u.kind === 'job' ? CI_JOBS.every((n) => asList(u.j.job.needs).includes(n)) : u.kind === 'workflow_run' ? true : u.all);
  const show = (u) => (u.kind === 'steps' ? `failure steps in the CI jobs (if: ${u.conds.join(' / ') || 'none'})` : `${u.j.file}/${u.j.id} (${u.kind}; needs: ${JSON.stringify(u.j.job.needs ?? null)}; if: ${u.cond || 'none'})`);
  add('notify-needs-all', units.some(covers), units.map(show).join('; ') || 'no Slack notification');

  const condsOf = (u) => (u.kind === 'steps' ? u.conds : [u.cond]);
  const pushOnlyToMain = (t) => t.push !== undefined && asList(t.push?.branches).length === 1 && asList(t.push?.branches)[0] === 'main';
  const onMainFailure = (u) => condsOf(u).every((c) => FAILED.test(c) && (ON_MAIN.test(c) || (PUSH_ONLY.test(c) && pushOnlyToMain(u.t))
    || (u.kind === 'workflow_run' && asList(u.t.workflow_run?.branches).length === 1 && asList(u.t.workflow_run.branches)[0] === 'main')));
  add('notify-on-main-failure', units.length > 0 && units.every(onMainFailure), units.map(show).join('; ') || 'no Slack notification');
  const neverForPr = (u) => (u.kind === 'workflow_run' ? RUN_FROM_PUSH.test(u.cond)
    : u.t.pull_request === undefined && u.t.pull_request_target === undefined ? true : condsOf(u).every((c) => /github\.ref\s*==\s*'refs\/heads\/main'|github\.ref_name\s*==\s*'main'/.test(c) || PUSH_ONLY.test(c)));
  add('notify-not-on-pr', units.length > 0 && units.every(neverForPr), units.map(show).join('; ') || 'no Slack notification');

  add('audit-own-workflow', audits.length > 0 && audits.every((j) => j.file !== ciFile), audits.map((j) => `${j.file}/${j.id}`).join(', ') || 'no audit job');
  const notifyJobs = units.filter((u) => u.kind !== 'steps');
  add('notify-timeout-5', notifyJobs.length > 0 && units.length === notifyJobs.length && notifyJobs.every((u) => Number(u.j.job['timeout-minutes']) === 5),
    units.map((u) => (u.kind === 'steps' ? 'failure steps (no job of its own)' : `${u.j.id}: ${u.j.job['timeout-minutes'] ?? 'none'}`)).join('; ') || 'no Slack notification');

  // Controls.
  const auditTriggers = audits.map((j) => triggers(j.wf));
  const weekly = (s) => asList(s).some((e) => { const f = String(e?.cron ?? '').trim().split(/\s+/); return f.length === 5 && f[2] === '*' && f[3] === '*' && f[4] !== '*'; });
  add('audit-triggers', auditTriggers.length > 0 && auditTriggers.some((t) => t.pull_request !== undefined && weekly(t.schedule)), audits.map((j) => `${j.file}: ${JSON.stringify(triggers(j.wf))}`).join('; ') || 'no audit job');
  const allText = workflows(projectDir).map((w) => w.text).join('\n');
  const leaks = /hooks\.slack\.com|vars\.SLACK_WEBHOOK_URL|echo[^\n]*SLACK_WEBHOOK_URL/.test(allText);
  add('secret-context', SECRET.test(allText) && !leaks, leaks ? 'the webhook URL is written out, read from vars, or echoed' : SECRET.test(allText) ? 'read only as secrets.SLACK_WEBHOOK_URL' : 'the secret is never read');
  const newJobs = jobs.filter((j) => !(j.file === ciFile && CI_JOBS.includes(j.id)));
  add('job-timeouts', newJobs.length > 0 && newJobs.every((j) => j.job['timeout-minutes'] !== undefined), newJobs.map((j) => `${j.file}/${j.id}: ${j.job['timeout-minutes'] ?? 'none'}`).join('; ') || 'no new job');
  const readOnly = (p) => (p === undefined ? null : p === 'read-all' || (p && typeof p === 'object' && Object.values(p).every((v) => v === 'read' || v === 'none')));
  const perms = wfs.map((w) => ({ file: w.file, top: readOnly(w.wf.permissions), jobs: Object.values(w.wf.jobs ?? {}).map((j) => readOnly(j?.permissions)) }));
  add('read-only-permissions', perms.length > 0 && perms.every((p) => p.jobs.every((j) => j !== false) && (p.top === true || (p.top === null && p.jobs.length > 0 && p.jobs.every((j) => j === true)))),
    wfs.map((w) => `${w.file}: ${JSON.stringify(w.wf.permissions ?? null)}`).join('; ') || 'no workflow');
  const syncs = audits.flatMap((j) => commands(j.job).filter((c) => /\buv\s+sync\b/.test(c.cmd)).map((c) => c.cmd));
  add('frozen-sync', audits.length > 0 && syncs.every((c) => /--frozen|--locked/.test(c)), `${audits.length ? `audit syncs: ${syncs.join(' | ') || 'none'}` : 'no audit job'}`);
  return { checks };
}
