#!/usr/bin/env node
// Automatic checks on the judge (no person labels verdicts):
//
//   1. Known wrong answers: per role, 3 judge requests rebuilt from real runs
//      with the run replaced by (a) nothing (no reply, no changes), (b) another
//      role's reply, no changes, (c) a confident reply to a different
//      question, no changes. Every one must be FAIL.
//   2. Stability: re-judge a sample of real verdicts with the same request.
//      At most 5% may change.
//   3. Second judge: a different model (EVAL_SECOND_JUDGE_MODEL, by default
//      Claude Fable 5.1 at medium effort) re-grades 10% of the judge's
//      verdicts, half of them FAILs, from the same evidence. Agreement must
//      be at least 90%. EVAL_SECOND_JUDGE_MODEL=none skips this check.
//
//   node judge-checks.mjs --label <name> [--stability 20] [--share 0.1]
//        [--min-pairs 10] [--mode sync|batch] [--dry] <run-dir> [<run-dir> ...]
//
// Sample sizes: 20 re-judges per batch and at least 10 second-judge pairs, so
// one changed verdict or one disagreement still meets the 5% and 90% targets.
// Use --stability 60 for a batch that mixes several roles.
//
// Writes evals/judge-checks/<label>/ (requests, verdicts,
// summary.json, summary.md). Exits 0 when every check meets its target, 2
// when one misses (stop and look at the misses before trusting the run), 3 when grader
// errors (API errors, refusals, cut-off verdicts) left a check incomplete: a
// rerun with the same label resends only those, and errors that persist are
// infrastructure errors to report, never a missed target. 1 on error.
// Sampling is seeded by the label, so a rerun picks the same verdicts.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { batchId } from './lib/anthropic.mjs';
import { EVALS_ROOT } from './lib/cases.mjs';
import { RUNS_ROOT, SECOND_JUDGE_EFFORT, SECOND_JUDGE_MODEL } from './lib/config.mjs';
import { JUDGE_MODEL, buildJudgeRequest, secondJudgeEnabled, secondJudgeRequest } from './judge.mjs';
import { sendAll } from './judge-run.mjs';

const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const omit = (o, key) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== key));
export const TARGETS = { knownNegativesAllFail: true, maxStabilityChange: 0.05, minSecondJudgeAgreement: 0.9 };

// A confident, polished reply to a question nobody asked.
export const WRONG_QUESTION_REPLY = 'Done. The configuration loader reads settings from config.yaml at startup, merges environment-variable overrides on top, and validates the result against the schema before the server starts. I checked every code path involved and there are no problems: the behavior is correct, fully covered by tests, and ready to ship.';

// Assertions a do-nothing run could satisfy ("does not edit", "the step
// remains pending", "neither ... nor ...", "no files are staged") make useless
// known negatives: an honest judge PASSes them on an empty run. So negatives
// use assertions that require something to be done: ones whose spec has a
// check an empty run cannot meet (a file that must exist or change, a record
// field, a reply pattern), or whose wording has no do-nothing clause. The
// wording filter errs toward leaving an assertion out.
const DO_NOTHING = new RegExp([
  String.raw`^\s*(?:no|not|only|never|neither|nothing|none)\b`,
  // Conditional: vacuously true when the thing never happens ("Any handoff ...", "If a test fails ...").
  String.raw`^\s*(?:any|if|when|whenever|each|every|once|after|before|unless)\b`,
  String.raw`\b(?:remain\w*|stay\w*|still|intact|preserv\w*|retain\w*|keeps?|kept|continu\w*|neither|nor|never|nothing|none|cannot|can't)\b`,
  String.raw`\b(?:is|are|was|were|does|do|did|has|have) not\b|\b(?:doesn't|don't|isn't|aren't|wasn't|hasn't|haven't)\b`,
  String.raw`\b(?:is|are|stays?|remains?|left|leaves?|keeps?)\b[^.;]{0,40}\bunchanged\b`,
  String.raw`\bno \w+(?: \w+)? (?:is|are|was|were)\b`,
  String.raw`\bwithout (?:chang|edit|modif|creat|alter|touch|writ|commit)\w*`,
  // Passive restriction: "commands are recorded only when supported" holds when nothing is recorded.
  String.raw`\b(?:is|are|was|were|be|been)\s+(?:\w+\s+){1,2}only\b`,
].join('|'), 'i');
// Usable: its wording has no do-nothing or conditional clause. The wording
// alone decides, because a known-negative request carries no deterministic
// checks: the judge sees only the assertion and the corrupted evidence, so an
// assertion that reads as satisfied by doing nothing would be honestly passed
// even if its own checks would have failed. (grade.mjs's doNothing label is
// kept in verdicts.json for analysis.)
export const isPositiveAssertion = (text) => !DO_NOTHING.test(text);

// Deterministic order from a label: sha256(label + id).
const seeded = (label, list, key) => [...list].sort((a, b) => createHash('sha256').update(label + key(a)).digest('hex').localeCompare(createHash('sha256').update(label + key(b)).digest('hex')));
const shortHash = (s) => createHash('sha256').update(path.resolve(s)).digest('hex').slice(0, 6);

// Every judge-graded assertion of the runs, with its request and the run's
// evidence. Ids carry a short hash of the run directory, so the same case in
// two runs (a run and its rerun, say) never collides.
export function collectJudged(runDirs) {
  const out = [];
  for (const runDir of runDirs) {
    const casesDir = path.join(runDir, 'cases');
    if (!existsSync(casesDir)) continue;
    const h = shortHash(runDir);
    // Case folders only (Finder can leave a .DS_Store file here).
    for (const key of readdirSync(casesDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
      for (const rep of readdirSync(path.join(casesDir, key)).sort()) {
        if (/-attempt\d+$/.test(rep)) continue;
        const dir = path.join(casesDir, key, rep);
        if (!existsSync(path.join(dir, 'verdicts.json'))) continue;
        const v = readJson(path.join(dir, 'verdicts.json'));
        for (const a of v.assertions ?? []) {
          const reqFile = path.join(dir, 'judge-requests', `${a.i}.json`);
          if (a.grader !== 'judge' || !a.judge || !existsSync(reqFile)) continue;
          out.push({ id: `${h}_${key}_${rep}_a${a.i}`, key, role: key.replace(/-\d+$/, ''), rep, i: a.i, text: a.text, verdict: a.verdict, doNothing: a.doNothing, reqFile, evidenceFile: path.join(dir, 'judge-evidence.json'), checks: a.checks });
        }
      }
    }
  }
  const ids = out.map((j) => j.id);
  if (new Set(ids).size !== ids.length) throw new Error('duplicate judged ids across run directories');
  return out;
}

// Role names an assertion may expect the reply to mention ("the next-role
// Architect invocation"); another role's reply that names the same role
// could satisfy it honestly, so such donors are skipped when others exist.
const ROLE_WORDS = /\b(navigator|scoper|architect|developer|tester|reviewer|auditor|documenter|synchronizer)\b/gi;
const rolesIn = (text) => new Set((String(text).match(ROLE_WORDS) ?? []).map((w) => w.toLowerCase()));

// Three known wrong answers per role present in the runs, one of each kind:
// an empty run, another role's reply (from `donors`, which may include other
// run directories), and a confident reply to a different question. The
// scenario, the user message, and the state before stay this run's, and
// nothing changes, so the evidence is self-consistent and only the agent's
// work is wrong: an honest judge has no reason to answer UNCLEAR.
export function knownNegatives(judged, label, donors = judged) {
  const roles = [...new Set(judged.map((j) => j.role))].sort();
  const items = [];
  for (const role of roles) {
    const mine = judged.filter((j) => j.role === role && existsSync(j.evidenceFile));
    const positive = mine.filter((j) => isPositiveAssertion(j.text));
    // No positive assertion at all: the negatives are weak (an honest judge may
    // pass them); they are reported but kept out of the target.
    const weak = positive.length === 0;
    const ordered = seeded(`${label}:${role}`, weak ? mine : positive, (j) => j.id);
    const picked = [];
    for (const j of ordered) if (picked.length < 3 && !picked.some((p) => p.key === j.key)) picked.push(j);
    for (const j of ordered) if (picked.length < 3 && !picked.includes(j)) picked.push(j);
    // Fewer than 3 usable assertions: reuse them; each negative is a different kind.
    for (let k = 0; picked.length && picked.length < 3; k += 1) picked.push(picked[k]);
    // One donor per run (not per assertion), with a non-empty reply: another
    // role's run, or, when only this role has been run and judged so far
    // (the first role of a suite), another case of this role, never the
    // case itself. Either is a confident reply to a different situation, so
    // it must FAIL. With neither (one case run alone), that negative is left
    // out, and main() says so.
    const seen = new Set();
    const usable = (j) => existsSync(j.evidenceFile) && !seen.has(j.evidenceFile) && seen.add(j.evidenceFile);
    const withReply = (list) => list.map((j) => ({ ...j, reply: readJson(j.evidenceFile).finalReply })).filter((j) => j.reply && j.reply !== '(empty)');
    let others = withReply(donors.filter((j) => j.role !== role && usable(j)));
    if (!others.length) others = withReply(donors.filter((j) => j.role === role && usable(j)));
    const kinds = ['empty', 'other-role', 'wrong-question'];
    picked.forEach((j, n) => {
      const parts = readJson(j.evidenceFile);
      const nothing = { ...parts, stateAfter: parts.stateBefore, changedFiles: '(no files changed)' };
      let bad;
      let donor = null;
      if (kinds[n] === 'empty') {
        bad = { ...nothing, timeline: '(nothing recorded)', finalReply: '(empty)' };
      } else if (kinds[n] === 'other-role') {
        const pool = others.filter((d) => d.key !== j.key);
        if (!pool.length) return;
        const named = rolesIn(j.text);
        const clean = pool.filter((d) => ![...rolesIn(d.reply)].some((r) => named.has(r)));
        donor = seeded(`${label}:donor:${j.id}`, clean.length ? clean : pool, (d) => d.id)[0];
        bad = { ...nothing, timeline: `[agent text]\n${donor.reply}`, finalReply: donor.reply };
      } else {
        bad = { ...nothing, timeline: `[agent text]\n${WRONG_QUESTION_REPLY}`, finalReply: WRONG_QUESTION_REPLY };
      }
      items.push({ customId: batchId(`kn_${j.id}_${kinds[n]}`), role, source: j.id, kind: kinds[n], weak, donor: donor?.id ?? null, assertion: j.text, request: buildJudgeRequest(bad, j.text, []) });
    });
  }
  return items;
}

export function stabilitySample(judged, label, n) {
  return seeded(`${label}:stability`, judged.filter((j) => j.verdict !== 'ERROR'), (j) => j.id).slice(0, n);
}

// 10% of verdicts, half of them FAILs (as many as exist), and at least
// `minPairs` (with 10, one disagreement still meets 90%).
export function secondJudgeSample(judged, label, share, minPairs = 10) {
  const graded = judged.filter((j) => ['PASS', 'FAIL', 'UNCLEAR'].includes(j.verdict));
  const n = Math.min(graded.length, Math.max(1, minPairs, Math.round(share * graded.length)));
  const fails = seeded(`${label}:second:fail`, graded.filter((j) => j.verdict === 'FAIL'), (j) => j.id);
  const rest = seeded(`${label}:second:rest`, graded.filter((j) => j.verdict !== 'FAIL'), (j) => j.id);
  const nFail = Math.min(fails.length, Math.ceil(n / 2));
  return [...fails.slice(0, nFail), ...rest.slice(0, n - nFail)];
}

// Results against the targets. A grader ERROR (API error, refusal, cut-off
// verdict) is neither a hit nor a miss: it leaves the check incomplete, so a
// sample shrunk by errors can never meet a target, and an error never counts
// as a judge failure.
// With the second judge switched off, its check is reported as skipped and
// counts as met.
export function evaluateChecks({ negatives, stability, second, secondEnabled = true }) {
  // Weak negatives (a role with no positive assertion) are reported, not counted.
  const counted = negatives.filter((x) => !x.weak);
  const negErr = counted.filter((x) => x.got === 'ERROR');
  const negMiss = counted.filter((x) => x.got !== 'FAIL' && x.got !== 'ERROR');
  const stabErr = stability.filter((x) => x.got === 'ERROR');
  const stabCompared = stability.filter((x) => x.got !== 'ERROR');
  const changed = stabCompared.filter((x) => x.got !== x.was);
  const secErr = second.filter((x) => x.got === 'ERROR');
  const secCompared = second.filter((x) => x.got !== 'ERROR');
  const agree = secCompared.filter((x) => x.got === x.was);
  const changeRate = stabCompared.length ? changed.length / stabCompared.length : null;
  const agreement = secCompared.length ? agree.length / secCompared.length : null;
  // A target is decided only on a complete sample; with errors left it is null (incomplete).
  const decide = (complete, met) => (complete ? met : null);
  const graderErrors = negErr.length + stabErr.length + secErr.length;
  return {
    graderErrors,
    knownNegatives: { n: counted.length, failed: counted.length - negMiss.length - negErr.length, graderErrors: negErr.length, misses: negMiss.map((x) => ({ source: x.source, kind: x.kind, got: x.got })), weak: negatives.filter((x) => x.weak).map((x) => ({ source: x.source, kind: x.kind, got: x.got })),
      // A miss on a graded negative is final; errors only delay a pass.
      meetsTarget: negMiss.length ? false : decide(!negErr.length, counted.length > 0) },
    stability: { n: stability.length, compared: stabCompared.length, graderErrors: stabErr.length, changed: changed.map((x) => ({ id: x.id, was: x.was, got: x.got })), changeRate, meetsTarget: decide(!stabErr.length, changeRate !== null && changeRate <= TARGETS.maxStabilityChange) },
    secondJudge: { n: second.length, compared: secCompared.length, graderErrors: secErr.length, failsInSample: second.filter((x) => x.was === 'FAIL').length, agreement, disagreements: secCompared.filter((x) => x.got !== x.was).map((x) => ({ id: x.id, judge: x.was, second: x.got })),
      skipped: !secondEnabled, meetsTarget: secondEnabled ? decide(!secErr.length, agreement !== null && agreement >= TARGETS.minSecondJudgeAgreement) : true },
  };
}

// 0: every target met; 2: a target missed; 3: incomplete (grader errors left, no miss yet).
export function exitCodeOf(res) {
  const met = [res.knownNegatives.meetsTarget, res.stability.meetsTarget, res.secondJudge.meetsTarget];
  if (met.includes(false)) return 2;
  return met.includes(null) ? 3 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const opt = (name, dflt) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : dflt; };
  const valued = new Set(['--label', '--stability', '--share', '--min-pairs', '--mode', '--donor-runs']);
  const runDirs = argv.filter((a, i) => !a.startsWith('--') && !valued.has(argv[i - 1]));
  const label = opt('label');
  if (!label || !runDirs.length) throw new Error('usage: judge-checks.mjs --label <name> [--stability N] [--share 0.1] [--min-pairs 10] [--mode sync|batch] [--dry] <run-dir> ...');
  // A second judge that is the judge itself measures nothing.
  if (secondJudgeEnabled() && SECOND_JUDGE_MODEL === JUDGE_MODEL) throw new Error(`the second judge (${SECOND_JUDGE_MODEL}) is the judge itself; set EVAL_SECOND_JUDGE_MODEL to a different model or none`);
  const outDir = path.join(EVALS_ROOT, 'judge-checks', label);
  mkdirSync(outDir, { recursive: true });
  const judged = collectJudged(runDirs);
  // Donors for the "different case" negative: another role's run, from these
  // runs or from --donor-runs (default: every other run under evals/runs, so
  // a one-role run can draw on earlier ones).
  const runsRoot = RUNS_ROOT;
  const donorDirs = opt('donor-runs') ? opt('donor-runs').split(',')
    : (existsSync(runsRoot) ? readdirSync(runsRoot).map((d) => path.join(runsRoot, d)).filter((d) => !runDirs.map((r) => path.resolve(r)).includes(path.resolve(d))) : []);
  const donors = [...judged, ...collectJudged(donorDirs)];
  const neg = knownNegatives(judged, label, donors);
  for (const role of [...new Set(neg.map((x) => x.role))].sort()) {
    if (!neg.some((x) => x.role === role && x.kind === 'other-role')) console.log(`${role}: no other case has a reply yet, so its "different case" negative is left out`);
  }
  const stab = stabilitySample(judged, label, Number(opt('stability', 20)));
  const sec = secondJudgeEnabled() ? secondJudgeSample(judged, label, Number(opt('share', 0.1)), Number(opt('min-pairs', 10))) : [];
  const items = [
    ...neg.map((x) => ({ customId: x.customId, request: x.request })),
    ...stab.map((j) => ({ customId: batchId(`st_${j.id}`), request: readJson(j.reqFile) })),
    ...sec.map((j) => ({ customId: batchId(`sj_${j.id}`), request: secondJudgeRequest(readJson(j.reqFile)) })),
  ];
  writeFileSync(path.join(outDir, 'plan.json'), JSON.stringify({ runDirs, judged: judged.length, negatives: neg.map((x) => omit(x, 'request')), stability: stab.map((j) => j.id), second: sec.map((j) => ({ id: j.id, was: j.verdict })) }, null, 2));
  console.log(`${judged.length} judged verdicts; ${neg.length} known negatives, ${stab.length} stability re-judges, ${sec.length} second-judge re-grades`);
  if (argv.includes('--dry')) process.exit(0);
  // Verdicts are saved as they arrive and reused on a rerun with the same
  // label, so an interruption never pays twice for a check.
  // A saved verdict is reused only for the identical request: after a change
  // to the judge prompt, model, or the runs' verdicts, the request differs and
  // is sent again.
  const vFile = path.join(outDir, 'verdicts.json');
  const saved = existsSync(vFile) ? readJson(vFile) : {};
  const reqHash = new Map(items.map((it) => [it.customId, createHash('sha256').update(JSON.stringify(it.request)).digest('hex')]));
  const keep = (id) => { const r = saved[id]; return r && r.verdict && r.verdict !== 'ERROR' && r.requestHash === reqHash.get(id); };
  const todo = items.filter((it) => !keep(it.customId));
  if (todo.length < items.length) console.log(`reusing ${items.length - todo.length} saved verdicts`);
  const fresh = await sendAll(todo, { mode: opt('mode', 'sync'), stateFile: path.join(outDir, 'batch.json'), purpose: 'judge-check',
    onResult: (id, r) => { saved[id] = { ...r, requestHash: reqHash.get(id) }; writeFileSync(vFile, JSON.stringify(saved, null, 2)); } });
  for (const [id, r] of fresh) saved[id] = { ...r, requestHash: reqHash.get(id) };
  writeFileSync(vFile, JSON.stringify(saved, null, 2));
  const got = new Map(items.map((it) => [it.customId, saved[it.customId]]));
  const res = evaluateChecks({
    negatives: neg.map((x) => ({ ...x, got: got.get(x.customId)?.verdict ?? 'ERROR' })),
    stability: stab.map((j) => ({ id: j.id, was: j.verdict, got: got.get(batchId(`st_${j.id}`))?.verdict ?? 'ERROR' })),
    second: sec.map((j) => ({ id: j.id, was: j.verdict, got: got.get(batchId(`sj_${j.id}`))?.verdict ?? 'ERROR' })),
    secondEnabled: secondJudgeEnabled(),
  });
  const cost = [...got.values()].reduce((s, r) => s + (r?.costUsd ?? 0), 0);
  const summary = { label, runDirs, targets: TARGETS, ...res, costUsd: cost, at: new Date().toISOString() };
  writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
  const pct = (x) => (x === null ? '—' : `${(100 * x).toFixed(0)}%`);
  const met = (x) => (x === null ? 'incomplete (grader errors)' : x ? 'yes' : '**no**');
  const md = [`# Judge checks: ${label}`, '',
    '| Check | Result | Target | Met |', '| --- | --- | --- | --- |',
    `| Known wrong answers | ${res.knownNegatives.failed}/${res.knownNegatives.n} FAIL${res.knownNegatives.graderErrors ? `, ${res.knownNegatives.graderErrors} errors` : ''}${res.knownNegatives.weak.length ? ` (+${res.knownNegatives.weak.length} weak, not counted)` : ''} | all FAIL | ${met(res.knownNegatives.meetsTarget)} |`,
    `| Stability re-judge | ${res.stability.changed.length}/${res.stability.compared} changed (${pct(res.stability.changeRate)}), ${res.stability.graderErrors} errors | at most 5% | ${met(res.stability.meetsTarget)} |`,
    res.secondJudge.skipped ? '| Second judge | skipped (EVAL_SECOND_JUDGE_MODEL=none) | at least 90% | — |'
      : `| Second judge (${SECOND_JUDGE_MODEL}, ${SECOND_JUDGE_EFFORT}) | ${pct(res.secondJudge.agreement)} agree on ${res.secondJudge.compared} (${res.secondJudge.failsInSample} FAILs), ${res.secondJudge.graderErrors} errors | at least 90% | ${met(res.secondJudge.meetsTarget)} |`,
    '', `Cost: $${cost.toFixed(2)}`];
  if (res.graderErrors) md.push('', `${res.graderErrors} grader errors (infrastructure, not judge failures): rerun the same command to resend only those.`);
  if (res.knownNegatives.misses.length) md.push('', 'Known negatives not failed:', ...res.knownNegatives.misses.map((m) => `- ${m.source} (${m.kind}): ${m.got}`));
  if (res.stability.changed.length) md.push('', 'Changed on re-judge:', ...res.stability.changed.map((m) => `- ${m.id}: ${m.was} -> ${m.got}`));
  if (res.secondJudge.disagreements.length) md.push('', 'Second-judge disagreements:', ...res.secondJudge.disagreements.map((m) => `- ${m.id}: judge ${m.judge}, second ${m.second}`));
  writeFileSync(path.join(outDir, 'summary.md'), `${md.join('\n')}\n`);
  console.log(md.join('\n'));
  process.exit(exitCodeOf(res));
}
