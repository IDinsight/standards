#!/usr/bin/env node
// Gate 3: Claude Opus 5.5 at high effort (EVAL_REVIEW_MODEL) reviews a fixture in place of a
// person. It reads the case, the catalog entry, the spec, the
// built tree, and the gate 1-2 results, and lists every stated condition with
// the file that realizes it, hint leaks, checks that could fail a correct
// run, missing invariants, and assertions that cannot be graded here.
//
//   node review-fixture.mjs <target> [<target> ...] [--commit <ref>] [--concurrency 3] [--dry] [--force]
// A target whose spec already records a review (or the owner's decision) is
// skipped unless --force, so re-running after an interruption pays only for
// what is unfinished; re-review a case after its base was fixed with --force.
//   target: a case key or base:<name>
//
// Writes review.json next to spec.json and sets the spec's status:
//   reviewed  no blocking issue (notes, if any, are kept in review.json);
//   flagged   blocking issues, which go to the owner with a recommendation
//             each (report-flags.mjs); nothing flagged runs until decided.
// A spec that has not passed gates 1 and 2 is reviewed too, and its gate
// problems are listed first, so the owner sees everything at once.
// Refuses to call a model unless EVAL_ALLOW_MODEL=1.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BASES_DIR, frameworkAt, resolveSpec, staleBases } from './build-fixture.mjs';
import { NO_CATALOG_ENTRY, targetDir } from './generate-fixture.mjs';
import { createMessage, parseStructured } from './lib/anthropic.mjs';
import { DEFAULT_COMMIT, EVALS_ROOT, findCase } from './lib/cases.mjs';
import { FIXTURE_EFFORT, REVIEW_MODEL } from './lib/config.mjs';
import { builtTreeText, roleText, sharedFrameworkText, specDirText } from './lib/context.mjs';
import { dockerAvailable } from './lib/selfcheck.mjs';
import { validate } from './validate-fixture.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export { REVIEW_MODEL };
const SYSTEM = readFileSync(path.join(HERE, 'prompts/reviewer.md'), 'utf8');
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));

export const REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['conditions', 'issues', 'verdict', 'summary'],
  properties: {
    conditions: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false, required: ['condition', 'where', 'status'],
        properties: { condition: { type: 'string' }, where: { type: 'string' }, status: { type: 'string', enum: ['realized', 'missing', 'contradicted'] } },
      },
    },
    issues: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false, required: ['severity', 'kind', 'assertion', 'detail', 'recommendation', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['blocking', 'note'] },
          kind: { type: 'string', enum: ['missing-condition', 'contradiction', 'hint-leak', 'record-format', 'check-too-strict', 'check-wrong', 'invariant', 'ungradeable-assertion', 'runtime', 'history', 'realism', 'case-defect', 'other'] },
          assertion: { type: 'integer', description: 'Assertion index, or -1 when the issue is not about one assertion.' },
          detail: { type: 'string' },
          recommendation: { type: 'string', enum: ['regenerate', 'fix_file', 'mark_na', 'defer', 'run_as_is'] },
          fix: { type: 'string', description: 'For fix_file: the exact file and change. Otherwise what the regeneration or decision should address.' },
        },
      },
    },
    verdict: { type: 'string', enum: ['pass', 'issues'] },
    summary: { type: 'string', description: 'Two or three sentences.' },
  },
};

export function reviewRequest(target, { sha, built, gates }) {
  const dir = targetDir(target);
  const isBase = target.startsWith('base:');
  const parts = [];
  if (isBase) {
    const b = readJson(path.join(dir, 'base.json'));
    parts.push(`<base name="${b.name}" extends="${b.extends ?? 'none'}">\n<description>\n${b.description}\n</description>\n</base>`);
    // The sibling bases its description says to reuse, so "reuse verbatim" can be checked.
    for (const ref of b.reference ?? []) {
      const d = path.join(BASES_DIR, ref);
      if (existsSync(path.join(d, 'spec.json'))) parts.push(`<reference_base name="${ref}" note="a sibling base the description says to reuse from; compare the shared code and tests">\n${specDirText(d, `_bases/${ref}`)}\n</reference_base>`);
    }
  } else {
    const kase = findCase(target);
    const cat = readJson(path.join(EVALS_ROOT, 'catalog', `${kase.role}.json`)).cases.find((c) => c.id === kase.id);
    parts.push(`<case key="${kase.key}" role="${kase.role}">\n<prompt>\n${kase.prompt}\n</prompt>\n<expected_output>\n${kase.expected}\n</expected_output>\n<assertions>\n${kase.assertions.map((a, i) => `${i}. ${a}`).join('\n')}\n</assertions>\n</case>`);
    parts.push(`<catalog_entry>\n${cat ? JSON.stringify(cat, null, 2) : NO_CATALOG_ENTRY}\n</catalog_entry>`);
  }
  parts.push(`<spec>\n${specDirText(dir, isBase ? `_bases/${path.basename(dir)}` : target)}\n</spec>`);
  const r = resolveSpec(dir);
  if (r.bases.length) parts.push(`<bases_applied_first>${r.bases.map((b) => b.name).join(', ')} (their files are in the built tree below)</bases_applied_first>`);
  parts.push(`<resolved_vars note="the values \${VAR} in checks and invariants resolve to, from the bases and the case">\n${JSON.stringify(r.vars, null, 2)}\n</resolved_vars>`);
  parts.push(`<built_tree note="the repository the role will see; installed framework files that match a pristine install are listed by path only">\n${built}\n</built_tree>`);
  parts.push(`<gate_results>\n${JSON.stringify(gates, null, 2)}\n</gate_results>`);
  const notes = latestGeneratorNotes(dir);
  if (notes) parts.push(`<generator_notes_for_reviewer>\n${notes}\n</generator_notes_for_reviewer>`);
  parts.push(`<task>Review this ${isBase ? 'shared base' : 'fixture'}.</task>`);
  const role = isBase ? null : findCase(target).role;
  // The spec format, with the exact semantics of every check, invariant, and
  // runtime key (the generator's instructions, which match the grader), so the
  // reviewer can judge whether a check could fail a correct run.
  const format = readFileSync(path.join(HERE, 'prompts/generator.md'), 'utf8');
  const content = [{ type: 'text', text: `<framework commit="${sha}">\n${sharedFrameworkText(sha)}\n</framework>\n\n<spec_format note="the instructions the fixture's generator followed; they define exactly how each check, invariant, runtime key, and layer behaves in the harness">\n${format}\n</spec_format>`, cache_control: { type: 'ephemeral' } }];
  if (role) content.push({ type: 'text', text: `<role_under_test name="${role}">\n${roleText(sha, role)}\n</role_under_test>`, cache_control: { type: 'ephemeral' } });
  content.push({ type: 'text', text: parts.join('\n\n') });
  return {
    model: REVIEW_MODEL,
    max_tokens: 64000,
    system: SYSTEM,
    output_config: { effort: FIXTURE_EFFORT, format: { type: 'json_schema', schema: REVIEW_SCHEMA } },
    messages: [{ role: 'user', content }],
  };
}

// The generator's notes_for_reviewer from its last response, if any.
function latestGeneratorNotes(dir) {
  const gen = path.join(dir, 'gen');
  if (!existsSync(gen)) return null;
  const runs = readdirSync(gen).filter((r) => !r.startsWith('review-')).sort();
  for (const run of runs.reverse()) {
    for (const n of [2, 1]) {
      const f = path.join(gen, run, `response-${n}.json`);
      if (!existsSync(f)) continue;
      const parsed = parseStructured(readJson(f));
      if (parsed.value?.notes_for_reviewer) return parsed.value.notes_for_reviewer;
    }
  }
  return null;
}

// The reviewer's result as a spec status: blocking issues, a stated
// condition it found missing or contradicted, or a failed gate -> flagged.
export function statusFromReview(review, gateProblems = []) {
  const blocking = (review.issues ?? []).filter((i) => i.severity === 'blocking');
  const unmet = (review.conditions ?? []).filter((c) => c.status !== 'realized');
  return gateProblems.length || blocking.length || unmet.length || review.verdict !== 'pass' ? 'flagged' : 'reviewed';
}

export async function reviewOne(target, { commit = DEFAULT_COMMIT, dry = false } = {}) {
  const fw = frameworkAt(commit);
  const dir = targetDir(target);
  const spec = readJson(path.join(dir, 'spec.json'));
  // A case is reviewed only on reviewed bases that are not stale:
  // a review on a base still undecided, or whose parent changed, would be paid
  // for again. A base's own stale parent hash is what its re-review refreshes.
  if (!target.startsWith('base:')) {
    const bad = resolveSpec(dir).bases.filter((b) => readJson(path.join(BASES_DIR, b.name, 'spec.json')).status !== 'reviewed').map((b) => `base:${b.name} is not reviewed`);
    const stale = staleBases(dir).filter((x) => x.spec.startsWith('base:')).map((x) => `${x.spec}'s parent ${x.parent} changed since it was reviewed`);
    if (bad.length || stale.length) return { target, status: spec.status, error: `${[...bad, ...stale].join('; ')}; review the base first`, costUsd: 0 };
  }
  const out = path.join(os.tmpdir(), 'standards-eval-review', target.replace(':', '-'));
  // A review needs the fixture's selfChecks to have run in the image; without
  // Docker it would pass a fixture whose behavior nobody checked.
  const docker = dockerAvailable();
  if ((spec.selfChecks ?? []).length && !docker && !dry) return { target, status: spec.status, error: 'the spec has selfChecks and Docker or the runner image is not available; not reviewed' };
  // A re-review covers the bases as they are now (for example after a base
  // was fixed), and records their hashes; a changed case still needs regenerating.
  const v = await validate(dir, { commit: fw.sha, selfChecks: docker, out, allowStaleBases: true });
  // Nothing to review if it does not build: flag it with the gate problems, no model call.
  if (!v.build) {
    spec.status = 'flagged';
    spec.gateProblems = v.problems;
    writeFileSync(path.join(dir, 'spec.json'), `${JSON.stringify(spec, null, 2)}\n`);
    return { target, status: 'flagged', blocking: 0, notes: 0, costUsd: 0, error: `build failed: ${v.problems.join('; ')}` };
  }
  const gates = {
    gate1and2Problems: v.problems,
    checkMjs: v.build?.check ?? null,
    promptFactsChecked: v.factsChecked,
    selfChecks: v.selfChecks,
  };
  const built = v.build ? builtTreeText(out, { sha: fw.sha, mode: resolveSpec(dir).install.mode ?? 'brownfield', frameworkDir: fw.dir }) : '(build failed)';
  const request = reviewRequest(target, { sha: fw.sha, built, gates });
  const revDir = path.join(dir, 'gen', `review-${new Date().toISOString().replace(/[:.]/g, '')}`);
  mkdirSync(revDir, { recursive: true });
  writeFileSync(path.join(revDir, 'request.json'), JSON.stringify(request, null, 2));
  if (dry) return { target, dry: true, requestChars: JSON.stringify(request).length };
  const { message, costUsd, ms } = await createMessage(request, { purpose: 'review', ref: target });
  writeFileSync(path.join(revDir, 'response.json'), JSON.stringify(message, null, 2));
  const parsed = parseStructured(message);
  if (parsed.error) return { target, status: spec.status, error: `review output: ${parsed.error}`, costUsd };
  const review = { ...parsed.value, gateProblems: v.problems, model: REVIEW_MODEL, effort: FIXTURE_EFFORT, at: new Date().toISOString(), costUsd, ms, fixtureHash: v.build?.fixtureHash ?? null };
  writeFileSync(path.join(dir, 'review.json'), `${JSON.stringify(review, null, 2)}\n`);
  spec.status = statusFromReview(review, v.problems);
  // commit: the framework commit of the build whose hash this review covers.
  spec.reviewedBy = { model: REVIEW_MODEL, effort: FIXTURE_EFFORT, at: review.at, verdict: review.verdict, fixtureHash: review.fixtureHash, commit: fw.sha };
  // The bases as reviewed; run.mjs refuses a fixture that differs from this build.
  const bases = resolveSpec(dir).bases;
  if (bases.length) spec.baseHashes = Object.fromEntries(bases.map((b) => [b.name, b.hash]));
  if (v.problems.length) spec.gateProblems = v.problems; else delete spec.gateProblems;
  // A fixture that passes gates 1-2 and its review no longer needs writing again.
  if (!v.problems.length && spec.status === 'reviewed') delete spec.needsRegeneration;
  writeFileSync(path.join(dir, 'spec.json'), `${JSON.stringify(spec, null, 2)}\n`);
  return { target, status: spec.status, blocking: review.issues.filter((i) => i.severity === 'blocking').length, notes: review.issues.filter((i) => i.severity === 'note').length, costUsd };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const opt = (name, dflt) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : dflt; };
  const valued = new Set(['--commit', '--concurrency']);
  const targets = argv.filter((a, i) => !a.startsWith('--') && !valued.has(argv[i - 1]));
  const results = [];
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(Number(opt('concurrency', 3)), targets.length) }, async () => {
    while (next < targets.length) {
      const t = targets[next++];
      try {
        const sp = JSON.parse(readFileSync(path.join(targetDir(t), 'spec.json'), 'utf8'));
        if (sp.reviewedBy?.at && ['reviewed', 'flagged', 'rejected'].includes(sp.status) && !argv.includes('--force') && !argv.includes('--dry')) {
          results.push({ target: t, status: sp.status, costUsd: 0, skipped: true });
          console.log(`${t}: skipped (already reviewed: ${sp.status}; --force to review again)`);
          continue;
        }
        const r = await reviewOne(t, { commit: opt('commit', DEFAULT_COMMIT), dry: argv.includes('--dry') });
        results.push(r);
        console.log(r.dry ? `${t}: dry (${r.requestChars} chars)` : `${t}: ${r.status}${r.error ? ` (${r.error})` : ` (${r.blocking} blocking, ${r.notes} notes)`} $${(r.costUsd ?? 0).toFixed(2)}`);
      } catch (e) {
        results.push({ target: t, error: e.message, costUsd: 0 });
        console.log(`${t}: ERROR ${e.message}`);
      }
    }
  }));
  // Count by outcome: a target that errored (no Docker, base not reviewed, a
  // failed call) keeps its earlier status and must not be counted as reviewed.
  const n = (f) => results.filter(f).length;
  console.log(`\n${results.length} targets: ${n((r) => !r.error && !r.skipped && r.status === 'reviewed')} reviewed, ${n((r) => !r.error && !r.skipped && r.status === 'flagged')} flagged, ${n((r) => r.skipped)} skipped, ${n((r) => r.error)} not reviewed (error); $${results.reduce((s, r) => s + (r.costUsd ?? 0), 0).toFixed(2)} spent`);
  process.exit(results.some((r) => r.error) ? 1 : 0);
}
