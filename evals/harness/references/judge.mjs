// The reference evals' judge (evals/README.md, "How runs are graded").
//
// The blinded judge grades the task items code cannot, from the finished work
// alone: the task statement grader.json gives it, the fixture's grader-only
// facts, and the full text of every project file the run added or changed,
// with the names of those it deleted. Files under .claude/, .agents/, and
// .standards/ are left out, except changed ones that grader.json's
// judge.include names (a design record); framework files never count. It
// never sees the transcript, the reply, the state file, or the run id. Names
// and paths of framework files in the run's evidence become "[framework
// file]", and a request that still names one anywhere (a rubric item that
// names a reference, say) is blocked: an ERROR, never sent. The runs of both
// versions are judged in one queue, in an order seeded by the run id, one call
// per item.
//
// documenter-38 runs in both versions with its suite assertions, which need
// the run's timeline. Its requests keep the suite's evidence with the same
// masking and the same block, and its timeline leaves out each tool call aimed
// at framework files (its command, outside text it writes, or its path names a
// framework location) or that read detection ties to them (it printed a
// framework file's lines, looked for a references/ path, or ran a command in a
// skills folder). The calls left are renumbered,
// and lines of their output that hold a framework path are dropped, so a
// whole-project search or listing shows the same project lines in both
// versions.
//
// Judge checks on the runs' verdicts, as in the suite: a re-judged sample may
// change by at most 5%, and the second judge must agree on at least 90%. The
// known wrong answers are the starting projects and the known bad solutions,
// which check-graders.mjs has the judge grade before the first run.
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FRAMEWORK_PATH } from '../build-fixture.mjs';
import { globRe } from '../grade.mjs';
import { batchId } from '../lib/anthropic.mjs';
import { ROLES } from '../lib/cases.mjs';
import { JUDGE_EFFORT, JUDGE_MODEL, SECOND_JUDGE_EFFORT, SECOND_JUDGE_MODEL } from '../lib/config.mjs';
import { diffManifests } from '../lib/snapshot.mjs';
import { parseTranscript } from '../lib/trace.mjs';
import { VERDICT_SCHEMA, buildJudgeRequest, secondJudgeEnabled, secondJudgeRequest, timeline } from '../judge.mjs';
import { TARGETS, collectJudged, evaluateChecks, secondJudgeSample, seeded, shortHash, stabilitySample } from '../judge-checks.mjs';
import { mergeResults, pendingJudgeCalls, sendAll } from '../judge-run.mjs';
import { baseReferences, detectReads, frameworkFiles, withoutWrittenHeredocs } from './reads.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SYSTEM = readFileSync(path.join(HERE, 'judge-prompt.md'), 'utf8');
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const sha = (value) => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const PLACEHOLDER = '[framework file]';

// The same verdicts as the suite's judge; the quotes name files, not events.
const SCHEMA = { ...VERDICT_SCHEMA, properties: { ...VERDICT_SCHEMA.properties, evidence: { type: 'array', items: { type: 'string' }, description: 'Exact quotes with the file they come from, e.g. "app/security.py: ..."' } } };
// The blinded judge as configured: a judged check-graders pass holds only for it.
export const BLIND_JUDGE = { system: SYSTEM, schema: SCHEMA, model: JUDGE_MODEL, effort: JUDGE_EFFORT };

// What marks a framework file in text: the skills folders, a role's skill
// path anywhere (the CLI's copy, the repository), any references/ path (not
// .standards/project-references/), the protocol, a SKILL.md, and each shipped
// reference's name: with a hyphen, with or without ".md"; otherwise only with
// it (so "postgres" stays, "postgres.md" goes; README.md is not readme.md).
// Each match is widened to the whole path around it.
// The paths alone (LOCATION) mark where framework files live; documenter-38's
// timeline drops calls aimed at them and output lines that hold them.
const LOCATIONS = [
  String.raw`(?:\.claude|\.agents)\/skills\b`,
  String.raw`(?<![\w-])skills\/(?:${ROLES.map(escape).join('|')})\/`,
  String.raw`(?<![\w-])references\/`,
  String.raw`\.standards\/protocol\b`,
  String.raw`(?<![\w-])(?:PROTOCOL|SKILL)\.md(?![\w-])`,
  String.raw`\/opt\/standards\b`,
];
const LOCATION = new RegExp(LOCATIONS.join('|'));
let cores = null;
function frameworkCores() {
  if (cores) return cores;
  const names = [...new Set(baseReferences().map((k) => path.posix.basename(k, '.md')))].sort((a, b) => b.length - a.length);
  const stems = names.filter((n) => n.includes('-')).map(escape);
  const plain = names.filter((n) => !n.includes('-')).map(escape);
  cores = new RegExp([
    ...LOCATIONS,
    String.raw`(?<![\w-])(?:${stems.join('|')})(?:\.md)?(?![\w-])`,
    String.raw`(?<![\w-])(?:${plain.join('|')})\.md(?![\w-])`,
  ].join('|'), 'g');
  return cores;
}
const PATH_CHAR = /[\w.~/-]/;

// Text with every framework file's name or path replaced.
export function mask(text) {
  if (typeof text !== 'string' || !text) return text;
  let out = '';
  let last = 0;
  for (const m of text.matchAll(frameworkCores())) {
    if (m.index < last) continue;
    let s = m.index;
    let e = m.index + m[0].length;
    while (s > last && PATH_CHAR.test(text[s - 1])) s -= 1;
    while (e < text.length && PATH_CHAR.test(text[e])) e += 1;
    while (e > m.index + m[0].length && text[e - 1] === '.') e -= 1; // a full stop ends the sentence, not the path
    out += `${text.slice(last, s)}${PLACEHOLDER}`;
    last = e;
  }
  return out + text.slice(last);
}

// The framework names a request still holds, in its system prompt or any
// content block (checked as text, so a name after a line break counts).
export function auditRequest(request) {
  const texts = [request.system, ...(request.messages ?? []).flatMap((m) => (typeof m.content === 'string' ? [m.content] : (m.content ?? []).map((b) => b.text)))];
  const found = new Set();
  for (const t of texts) for (const m of String(t ?? '').matchAll(frameworkCores())) found.add(m[0]);
  return [...found].sort();
}

// A file of a project folder as the judge sees it.
const FILE_LIMIT = 100_000;
export const readProjectFile = (root) => (rel) => {
  const f = path.join(root, rel);
  try {
    if (lstatSync(f).isSymbolicLink()) return `(a link to ${readlinkSync(f)})`;
    const buf = readFileSync(f);
    if (buf.includes(0)) return '(binary file)';
    const text = buf.toString('utf8');
    if (text.length <= FILE_LIMIT) return text;
    return `${text.slice(0, FILE_LIMIT / 2)}\n[... ${text.length - FILE_LIMIT} characters cut by the harness ...]\n${text.slice(-FILE_LIMIT / 2)}`;
  } catch {
    return '(unreadable)';
  }
};

// Project files that changed between two manifests, as the judge sees them:
// outside .claude/, .agents/, and .standards/, unless `include` names them;
// never a framework file.
const HIDDEN = /^\.(?:claude|agents|standards)\//;
export function changedFilesText({ before, after, read, include = [] }) {
  const d = diffManifests(before, after);
  const res = include.map(globRe);
  const shown = (rel) => !FRAMEWORK_PATH.test(rel) && (!HIDDEN.test(rel) || res.some((r) => r.test(rel)));
  const parts = [
    ...[...d.added, ...d.changed].filter(shown).sort().map((f) => `--- ${f} (${d.added.includes(f) ? 'added' : 'changed'})\n${read(f)}`),
    ...d.removed.filter(shown).sort().map((f) => `--- ${f} (deleted)`),
  ];
  return parts.join('\n\n') || '(no files changed)';
}

// The evidence of one finished project, masked. The task statement is the
// rubric's own text: it is not masked, so naming a reference in it blocks
// every request.
export function blindEvidence({ task, facts = [], files }) {
  return [
    '<task>', task, '</task>',
    '<project_facts>', mask(facts.map((f) => `- ${f}`).join('\n')) || '- none', '</project_facts>',
    '<changed_files>', mask(files), '</changed_files>',
  ].join('\n');
}

export function blindRequest(evidence, item) {
  return {
    model: JUDGE_MODEL,
    // Opus 5.5 always thinks, and thinking counts toward max_tokens.
    max_tokens: 32000,
    system: SYSTEM,
    output_config: { effort: JUDGE_EFFORT, format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{
      role: 'user',
      content: [
        // Cached prefix shared by every item of this project.
        { type: 'text', text: `<evidence>\n${evidence}\n</evidence>`, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: `<item>${item.text}</item>` },
      ],
    }],
  };
}

// The judge's requests for one run of a task: one per item in grader.json,
// each with the framework names it still holds (none, or it is blocked).
export function blindJobs({ dir, grader, spec }) {
  const items = grader.judge?.items ?? [];
  if (!items.length) return [];
  const files = changedFilesText({ before: readJson(path.join(dir, 'before.json')).files, after: readJson(path.join(dir, 'after.json')).files,
    read: readProjectFile(path.join(dir, 'after')), include: grader.judge.include ?? [] });
  const evidence = blindEvidence({ task: grader.judge.task, facts: spec.graderOnly ?? [], files });
  return items.map((item) => { const request = blindRequest(evidence, item); return { id: item.id, tier: item.tier, text: item.text, request, blocked: auditRequest(request) }; });
}

// Send items in one queue whose order the label seeds, so the two versions'
// requests mix. Verdicts saved for an identical request are kept; a blocked
// request is an ERROR and is not sent. jobs: [{ dir, items: blindJobs(...) }].
// Each run's requests go to <dir>/blind-requests/<id>.json and its verdicts
// to <dir>/blind-verdicts.json, saved as each one arrives.
export async function judgeBlind(jobs, { label, concurrency = 4, purpose = 'references-judge' }) {
  const saved = new Map();
  const queue = [];
  for (const { dir, items } of jobs) {
    const file = path.join(dir, 'blind-verdicts.json');
    const before = existsSync(file) ? readJson(file).items ?? {} : {};
    const now = {};
    mkdirSync(path.join(dir, 'blind-requests'), { recursive: true });
    for (const it of items) {
      writeFileSync(path.join(dir, 'blind-requests', `${it.id}.json`), JSON.stringify(it.request, null, 2));
      const requestHash = sha(it.request);
      const base = { tier: it.tier, text: it.text, requestHash };
      if (it.blocked.length) { now[it.id] = { ...base, verdict: 'ERROR', evidence: [], rationale: `blocked: the request names ${it.blocked.join(', ')}`, blocked: it.blocked }; continue; }
      const prev = before[it.id];
      if (prev && prev.requestHash === requestHash && prev.verdict !== 'ERROR') { now[it.id] = { ...prev, ...base }; continue; }
      queue.push({ customId: batchId(shortHash(dir), it.id), request: it.request, dir, id: it.id, base });
    }
    saved.set(dir, now);
    writeFileSync(file, JSON.stringify({ items: now }, null, 2));
  }
  if (new Set(queue.map((q) => q.customId)).size !== queue.length) throw new Error('two judge items share a request id; shorten the item ids');
  const byId = new Map(queue.map((q) => [q.customId, q]));
  const ordered = seeded(label, queue, (q) => q.customId);
  await sendAll(ordered.map((q) => ({ customId: q.customId, request: q.request })), { concurrency, purpose,
    onResult: (id, r) => {
      const q = byId.get(id);
      saved.get(q.dir)[q.id] = { ...q.base, ...r };
      writeFileSync(path.join(q.dir, 'blind-verdicts.json'), JSON.stringify({ items: saved.get(q.dir) }, null, 2));
    } });
  return { sent: queue.length, kept: jobs.reduce((n, j) => n + j.items.length, 0) - queue.length };
}

// documenter-38: rebuild a run's suite judge evidence and requests without the
// calls that read or list framework files, masked. Done from the transcript
// each time, so it can run again; returns the events it left out.
// What a call aims at: its command (without the text a heredoc writes to a
// file, reads.mjs) or its path fields, never content it writes.
const aimedAt = (e) => (e.tool === 'Bash' ? withoutWrittenHeredocs(e.command ?? '') : [e.input?.file_path, e.input?.path, e.input?.notebook_path, e.input?.pattern, e.input?.glob].filter((x) => typeof x === 'string').join('\n'));
export function maskProbe(dir) {
  const run = readJson(path.join(dir, 'run.json'));
  const trace = parseTranscript(path.join(dir, 'transcript.jsonl'), run.projectRoot ?? '/work');
  const framework = readJson(path.join(dir, 'fixture.json')).framework;
  const seen = detectReads(trace, frameworkFiles(framework), { references: baseReferences(), role: String(run.case).replace(/-\d+$/, '') });
  const drop = new Set(seen.frameworkCalls);
  for (const e of trace.events) if (LOCATION.test(aimedAt(e))) drop.add(e.i);
  const withoutFramework = (text) => (typeof text === 'string' ? text.split('\n').filter((l) => !LOCATION.test(l)).join('\n') : text);
  const kept = trace.events.filter((e) => !drop.has(e.i)).map((e, n) => ({ ...e, i: n, output: withoutFramework(e.output) }));
  const parts = Object.fromEntries(Object.entries(readJson(path.join(dir, 'judge-evidence.json'))).map(([k, v]) => [k, typeof v === 'string' ? mask(v) : v]));
  // The rebuilt timeline is masked whole: agent text, tool inputs and outputs, hook events.
  parts.timeline = mask(timeline({ trace: { ...trace, events: kept } }));
  writeFileSync(path.join(dir, 'judge-evidence.json'), JSON.stringify(parts, null, 2));
  const verdicts = readJson(path.join(dir, 'verdicts.json'));
  for (const a of verdicts.assertions ?? []) {
    const file = path.join(dir, 'judge-requests', `${a.i}.json`);
    if (a.grader !== 'judge' || !existsSync(file)) continue;
    const checks = (a.checks ?? []).map((c) => ({ ...c, evidence: mask(String(c.evidence ?? '')) }));
    writeFileSync(file, JSON.stringify(buildJudgeRequest(parts, mask(a.text), checks), null, 2));
  }
  const dropped = [...drop].sort((x, y) => x - y);
  writeFileSync(path.join(dir, 'judge-masked.json'), JSON.stringify({ dropped, kept: kept.length, at: new Date().toISOString() }, null, 2));
  return { dropped };
}

// The repetition folders of a run directory (not failed first attempts).
export const repDirs = (runDir) => {
  const cases = path.join(runDir, 'cases');
  if (!existsSync(cases)) return [];
  return readdirSync(cases, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()
    .flatMap((k) => readdirSync(path.join(cases, k)).filter((r) => /^r\d+$/.test(r)).sort().map((r) => path.join(cases, k, r)));
};

// Judge documenter-38's open assertions in both versions, masked, in one
// seeded queue; an earlier grader error is sent again.
export async function judgeProbe(runDirs, { label, concurrency = 4, purpose = 'references-judge' }) {
  for (const d of runDirs.flatMap(repDirs)) if (existsSync(path.join(d, 'judge-evidence.json'))) maskProbe(d);
  const calls = runDirs.flatMap((d) => pendingJudgeCalls(d, { retryErrors: true })).map((c) => ({ ...c, customId: batchId(shortHash(c.dir), c.key, c.rep, `a${c.i}`) }));
  if (new Set(calls.map((c) => c.customId)).size !== calls.length) throw new Error('custom_id collision in the documenter-38 calls');
  const byId = new Map(calls.map((c) => [c.customId, c]));
  const send = [];
  for (const c of calls) {
    const request = readJson(c.reqFile);
    const blocked = auditRequest(request);
    if (blocked.length) mergeResults([c], () => ({ verdict: 'ERROR', evidence: [], rationale: `blocked: the request names ${blocked.join(', ')}`, model: request.model }));
    else send.push({ customId: c.customId, request });
  }
  await sendAll(seeded(label, send, (s) => s.customId), { concurrency, purpose, onResult: (id, r) => mergeResults([byId.get(id)], () => r) });
  return { sent: send.length, blocked: calls.length - send.length };
}

// Every blinded verdict of these runs, in the shape the judge checks sample.
export function collectBlind(dirs) {
  const out = [];
  for (const dir of dirs) {
    const file = path.join(dir, 'blind-verdicts.json');
    if (!existsSync(file)) continue;
    const run = readJson(path.join(dir, 'run.json'));
    for (const [id, v] of Object.entries(readJson(file).items ?? {})) {
      const reqFile = path.join(dir, 'blind-requests', `${id}.json`);
      if (!v.blocked && existsSync(reqFile)) out.push({ id: `${shortHash(dir)}_${run.case}_${path.basename(dir)}_${id}`, verdict: v.verdict, reqFile });
    }
  }
  return out;
}

// The judge checks on the runs (no known negatives here: check-graders.mjs
// grades those before the first run). Writes judge-checks.json and .md into
// outDir; verdicts saved for an identical request are reused. Returns the
// result and an exit code: 0 met, 2 missed, 3 incomplete (grader errors left).
export async function referenceJudgeChecks({ outDir, label, blindDirs, probeRunDirs = [], stability = 20, share = 0.1, minPairs = 10, concurrency = 4 }) {
  if (secondJudgeEnabled() && SECOND_JUDGE_MODEL === JUDGE_MODEL) throw new Error(`the second judge (${SECOND_JUDGE_MODEL}) is the judge itself; set EVAL_SECOND_JUDGE_MODEL to a different model or none`);
  const judged = [...collectBlind(blindDirs), ...collectJudged(probeRunDirs)];
  if (!judged.length) {
    const md = 'No judged verdicts yet, so no judge checks.';
    writeFileSync(path.join(outDir, 'judge-checks.md'), `${md}\n`);
    return { label, judged: 0, exit: 0, costUsd: 0, md };
  }
  const stab = stabilitySample(judged, label, stability);
  const sec = secondJudgeEnabled() ? secondJudgeSample(judged, label, share, minPairs) : [];
  const items = [
    ...stab.map((j) => ({ customId: batchId(`st_${j.id}`), request: readJson(j.reqFile) })),
    ...sec.map((j) => ({ customId: batchId(`sj_${j.id}`), request: secondJudgeRequest(readJson(j.reqFile)) })),
  ];
  if (new Set(items.map((i) => i.customId)).size !== items.length) throw new Error('judge check ids collide; shorten the item ids');
  const vFile = path.join(outDir, 'judge-checks-verdicts.json');
  const saved = existsSync(vFile) ? readJson(vFile) : {};
  const hash = new Map(items.map((it) => [it.customId, sha(it.request)]));
  const todo = items.filter((it) => !(saved[it.customId]?.verdict && saved[it.customId].verdict !== 'ERROR' && saved[it.customId].requestHash === hash.get(it.customId)));
  await sendAll(todo, { concurrency, purpose: 'judge-check-references',
    onResult: (id, r) => { saved[id] = { ...r, requestHash: hash.get(id) }; writeFileSync(vFile, JSON.stringify(saved, null, 2)); } });
  const got = (id) => saved[id]?.verdict ?? 'ERROR';
  const res = evaluateChecks({
    negatives: [],
    stability: stab.map((j) => ({ id: j.id, was: j.verdict, got: got(batchId(`st_${j.id}`)) })),
    second: sec.map((j) => ({ id: j.id, was: j.verdict, got: got(batchId(`sj_${j.id}`)) })),
    secondEnabled: secondJudgeEnabled(),
  });
  const met = [res.stability.meetsTarget, res.secondJudge.meetsTarget];
  const exit = met.includes(false) ? 2 : met.includes(null) ? 3 : 0;
  const costUsd = items.reduce((s, it) => s + (saved[it.customId]?.costUsd ?? 0), 0);
  const summary = { label, judged: judged.length, targets: { maxStabilityChange: TARGETS.maxStabilityChange, minSecondJudgeAgreement: TARGETS.minSecondJudgeAgreement }, stability: res.stability, secondJudge: res.secondJudge, graderErrors: res.stability.graderErrors + res.secondJudge.graderErrors, exit, costUsd, at: new Date().toISOString() };
  writeFileSync(path.join(outDir, 'judge-checks.json'), JSON.stringify(summary, null, 2));
  const pct = (x) => (x === null ? '—' : `${(100 * x).toFixed(0)}%`);
  const yes = (x) => (x === null ? 'incomplete (grader errors)' : x ? 'yes' : '**no**');
  const md = ['| Check | Result | Target | Met |', '| --- | --- | --- | --- |',
    `| Stability re-judge | ${res.stability.changed.length}/${res.stability.compared} changed (${pct(res.stability.changeRate)}), ${res.stability.graderErrors} errors | at most 5% | ${yes(res.stability.meetsTarget)} |`,
    res.secondJudge.skipped ? '| Second judge | skipped (EVAL_SECOND_JUDGE_MODEL=none) | at least 90% | — |'
      : `| Second judge (${SECOND_JUDGE_MODEL}, ${SECOND_JUDGE_EFFORT}) | ${pct(res.secondJudge.agreement)} agree on ${res.secondJudge.compared} (${res.secondJudge.failsInSample} FAILs), ${res.secondJudge.graderErrors} errors | at least 90% | ${yes(res.secondJudge.meetsTarget)} |`,
    '', 'Known wrong answers (the starting projects and the known bad solutions) are graded by `pnpm evals references check-graders --execute` before the first run.',
    ...(res.stability.changed.length ? ['', 'Changed on re-judge:', ...res.stability.changed.map((m) => `- ${m.id}: ${m.was} -> ${m.got}`)] : []),
    ...(res.secondJudge.disagreements.length ? ['', 'Second-judge disagreements:', ...res.secondJudge.disagreements.map((m) => `- ${m.id}: judge ${m.judge}, second ${m.second}`)] : [])];
  writeFileSync(path.join(outDir, 'judge-checks.md'), `${md.join('\n')}\n`);
  return { ...summary, md: md.join('\n') };
}
