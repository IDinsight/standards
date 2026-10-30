#!/usr/bin/env node
// Generate fixture specs with Claude Opus 5.5 (one API call per fixture, not
// an agent session), then apply gates 1 and 2, with one automatic repair call
// when a gate fails. Gate 3, the model review, is
// review-fixture.mjs.
//
//   node generate-fixture.mjs <target> [<target> ...] [--commit <ref>] [--concurrency 3]
//        [--notes <file>] [--dry] [--no-self-checks]
//   target: a case key (tester-1) or base:<name> (base:export-testing)
//
// A case spec goes to fixtures/<role>/<id>/, a shared base to
// fixtures/_bases/<name>/ (its description is base.json there). Each target
// keeps its requests, raw responses, gate reports, and cost in gen/.
// --dry writes the first request to gen/ and calls nothing.
// --notes <file>: JSON {"<target>": "reviewer notes to address"} for a
//   regeneration the owner approved (a target with notes is regenerated).
// --force regenerates targets that already have a gated, flagged, reviewed,
//   or rejected spec; otherwise they are skipped, so re-running after an
//   interruption pays only for what is unfinished.
// Refuses to call a model unless EVAL_ALLOW_MODEL=1.
import { createHash } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BASES_DIR, frameworkAt, resolveSpec, staleBases } from './build-fixture.mjs';
import { createMessage, parseStructured } from './lib/anthropic.mjs';
import { DEFAULT_COMMIT, EVALS_ROOT, FIXTURES_ROOT, REPO_ROOT, findCase, loadRole } from './lib/cases.mjs';
import { FIXTURE_EFFORT, GEN_MODEL, userGitEnv } from './lib/config.mjs';
import { roleText, samplesText, sharedFrameworkText, specDirText } from './lib/context.mjs';
import { uncommittableFixtureFiles } from './lib/readiness.mjs';
import { dockerAvailable } from './lib/selfcheck.mjs';
import { LISTED_NA, NA_ASSERTIONS, judgeRoutedAssertions } from './lib/spec.mjs';
import { validate } from './validate-fixture.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export { GEN_MODEL };
const SYSTEM = readFileSync(path.join(HERE, 'prompts/generator.md'), 'utf8');

export const GEN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['spec_json', 'files', 'notes_for_reviewer'],
  properties: {
    spec_json: { type: 'string', description: 'The complete spec.json, as a JSON string.' },
    files: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['path', 'content', 'executable', 'symlink_target'],
        properties: {
          path: { type: 'string', description: 'Relative to the spec directory: layers/<NN-name>/... or runtime/...' },
          content: { type: 'string' },
          executable: { type: 'boolean' },
          symlink_target: { type: 'string', description: 'Empty for a regular file.' },
        },
      },
    },
    notes_for_reviewer: { type: 'string' },
  },
};

const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const catalogEntry = (role, id) => readJson(path.join(EVALS_ROOT, 'catalog', `${role}.json`)).cases.find((c) => c.id === id);
// Cases added after the catalog was written have no entry.
export const NO_CATALOG_ENTRY = 'none: this case was added after the catalog review; work out the utterance, the grader-only facts, the fixture needs, and which assertions need the judge from the case itself';

export function targetDir(target) {
  if (target.startsWith('base:')) return path.join(BASES_DIR, target.slice(5));
  const k = findCase(target);
  return path.join(FIXTURES_ROOT, k.role, String(k.id));
}

// Bases with a generated spec, and the one suggested for a case.
function basesInfo() {
  if (!existsSync(BASES_DIR)) return [];
  return readdirSync(BASES_DIR).filter((n) => existsSync(path.join(BASES_DIR, n, 'base.json'))).map((n) => {
    const d = path.join(BASES_DIR, n);
    const spec = existsSync(path.join(d, 'spec.json')) ? readJson(path.join(d, 'spec.json')) : null;
    // A case is generated only on a reviewed base whose own parents have not
    // changed since (a flagged base is the owner's to decide first).
    const stale = spec ? staleBases(d) : [];
    return { name: n, dir: d, ...readJson(path.join(d, 'base.json')), spec, stale, usable: spec?.status === 'reviewed' && !stale.length };
  });
}
// A base serves a role's cases, and only those whose prompt names its
// scenario (useFor.match, e.g. the export cycle id), so a Tester case about
// another project never gets the export base's files.
// A case the base cannot serve (its history contradicts the case) is listed
// in useFor.exclude. A base that serves the case but has not passed its gates
// stops generation rather than silently falling back to a standalone fixture.
export function suggestedBase(kase) {
  const fits = basesInfo().find((b) => b.useFor?.roles?.includes(kase.role) && (!b.useFor.match || kase.prompt.includes(b.useFor.match)) && !(b.useFor.exclude ?? []).includes(kase.key));
  if (fits && !fits.usable) throw new Error(`${kase.key}: its base ${fits.name} is ${fits.stale?.length ? `stale (${fits.stale.map((x) => `${x.spec}'s parent ${x.parent} changed`).join('; ')})` : fits.spec?.status ?? 'not generated'}; ${fits.spec?.status === 'flagged' ? 'decide it first' : 'generate, review, or fix the base first'}`);
  return fits ?? null;
}

// The chain of spec dirs a case or base builds on, oldest first. A case needs
// every base in it reviewed; a child base needs its parents to
// have passed gates 1 and 2 (gated or reviewed: a flagged parent is the
// owner's to decide first). None may be stale. Building on anything else
// wastes calls on layers the target does not own.
function chain(baseName, { forCase = false } = {}) {
  const out = [];
  const ok = forCase ? ['reviewed'] : ['gated', 'reviewed'];
  let n = baseName;
  while (n) {
    const d = path.join(BASES_DIR, n);
    const sf = path.join(d, 'spec.json');
    const status = existsSync(sf) ? readJson(sf).status : 'not generated';
    if (!ok.includes(status)) throw new Error(`base ${n} is ${status}; ${status === 'flagged' ? 'decide it first' : 'generate, review, or fix it first'}`);
    const stale = staleBases(d);
    if (stale.length) throw new Error(`base ${n} is stale (${stale.map((x) => `${x.spec}'s parent ${x.parent} changed`).join('; ')}); review it again first`);
    out.unshift(d);
    n = readJson(sf).base;
  }
  return out;
}

// The part of the request that differs per target.
function targetText(target, notes) {
  const parts = [];
  if (target.startsWith('base:')) {
    const name = target.slice(5);
    const b = readJson(path.join(BASES_DIR, name, 'base.json'));
    parts.push(`<base_request name="${name}" extends="${b.extends ?? 'none'}">\n<description>\n${b.description}\n</description>\n</base_request>`);
    if (b.extends) for (const d of chain(b.extends)) parts.push(`<parent_base name="${path.basename(d)}" note="applied before this base; do not repeat its layers">\n${specDirText(d, `_bases/${path.basename(d)}`)}\n</parent_base>`);
    for (const r of b.reference ?? []) {
      const d = path.join(BASES_DIR, r);
      if (existsSync(path.join(d, 'spec.json'))) parts.push(`<reference_base name="${r}" note="a sibling base; reuse its code where the description says so">\n${specDirText(d, `_bases/${r}`)}\n</reference_base>`);
    }
    // The cases this base will serve, so it fits them.
    // Exactly the cases suggestedBase() will give this base (its roles, its
    // useFor.match, minus useFor.exclude), all of them.
    const users = (b.useFor?.roles ?? []).flatMap((role) => loadRole(role))
      .filter((c) => !(b.useFor?.exclude ?? []).includes(c.key))
      .filter((c) => !b.useFor?.match || c.prompt.includes(b.useFor.match));
    if (users.length) parts.push(`<cases_that_will_use_this_base note="each case adds its own overlay; the base should be the common ground">\n${users.map((c) => `- ${c.key}: ${c.prompt}`).join('\n')}\n</cases_that_will_use_this_base>`);
    parts.push(`<task>Write the shared base "${name}". Return spec_json with base ${b.extends ? `"${b.extends}"` : 'null'}, install, layers, expectCheck, vars, notes, baseFacts, and selfChecks; and every layer file.</task>`);
  } else {
    const kase = findCase(target);
    const cat = catalogEntry(kase.role, kase.id);
    const na = kase.assertions.map((_, i) => i).filter((i) => NA_ASSERTIONS.has(`${kase.key}.${i}`));
    parts.push(`<case key="${kase.key}" role="${kase.role}">\n<prompt>\n${kase.prompt}\n</prompt>\n<expected_output note="the author's summary of intended behavior; context for you, ground truth for the grader">\n${kase.expected}\n</expected_output>\n<assertions>\n${kase.assertions.map((a, i) => `${i}. ${a}`).join('\n')}\n</assertions>\n</case>`);
    parts.push(`<catalog_entry note="from an earlier read-only review of this case: a suggested utterance and grader-only facts, fixture needs, grader tags per assertion, and known issues with the case">\n${cat ? JSON.stringify(cat, null, 2) : NO_CATALOG_ENTRY}\n</catalog_entry>`);
    if (na.length) parts.push(`<na_assertions note="mark these \\"na\\": true (the owner's decision: counterfactual, future, or optional behavior)">${na.join(', ')}</na_assertions>`);
    const base = suggestedBase(kase);
    if (base) {
      for (const d of chain(base.name, { forCase: true })) parts.push(`<base name="${path.basename(d)}"${path.basename(d) === base.name ? ' suggested="true"' : ' note="parent of the suggested base"'}>\n${specDirText(d, `_bases/${path.basename(d)}`)}\n</base>`);
      parts.push(`<base_choice>Suggested base: "${base.name}". Use it ("base": "${base.name}") and add only the case's overlay, unless it does not fit this case; then set "base": null and write a standalone fixture.</base_choice>`);
    } else {
      parts.push('<base_choice>No shared base fits this case; write a standalone fixture ("base": null).</base_choice>');
    }
    if (kase.role === 'navigator') parts.push('<note>Navigator never changes files or git state; its fixtures need no workflow change unless the case describes one.</note>');
    parts.push(`<task>Write the fixture spec for ${kase.key}.</task>`);
  }
  if (notes) parts.push(`<reviewer_notes note="a reviewer found these problems in an earlier version; the owner asked for a regeneration that fixes them">\n${notes}\n</reviewer_notes>`);
  return parts.join('\n\n');
}

export function generationRequest(target, { sha, notes = null }) {
  const role = target.startsWith('base:') ? null : findCase(target).role;
  const content = [
    // Cached across every fixture at this commit.
    { type: 'text', text: `<framework commit="${sha}">\n${sharedFrameworkText(sha)}\n</framework>\n\n<sample_specs note="hand-written samples of the spec format; drafts, not reviewed">\n${samplesText()}\n</sample_specs>`, cache_control: { type: 'ephemeral' } },
  ];
  // Cached across fixtures of one role.
  if (role) content.push({ type: 'text', text: `<role_under_test name="${role}">\n${roleText(sha, role)}\n</role_under_test>`, cache_control: { type: 'ephemeral' } });
  content.push({ type: 'text', text: targetText(target, notes) });
  return {
    model: GEN_MODEL,
    max_tokens: 96000,
    system: SYSTEM,
    output_config: { effort: FIXTURE_EFFORT, format: { type: 'json_schema', schema: GEN_SCHEMA } },
    messages: [{ role: 'user', content }],
  };
}

// Write a generated result into a staging spec dir. Returns problems with
// the output itself (paths, JSON); gates run afterwards.
export function materialize(target, value, stagingDir, { sha, model, owner = {} }) {
  const problems = [];
  let spec;
  try { spec = JSON.parse(value.spec_json); } catch (e) { return { problems: [`spec_json is not valid JSON: ${e.message}`] }; }
  rmSync(stagingDir, { recursive: true, force: true });
  mkdirSync(stagingDir, { recursive: true });
  const links = new Set((value.files ?? []).filter((f) => f.symlink_target).map((f) => path.normalize(f.path)));
  for (const f of value.files ?? []) {
    const rel = path.normalize(f.path);
    if (path.isAbsolute(rel) || rel.split(path.sep).includes('..') || !/^(layers\/[\w.-]+|runtime)\/./.test(rel)) { problems.push(`file path must be under layers/<name>/ or runtime/: ${f.path}`); continue; }
    // Never write through a symlink this output creates (it could point anywhere).
    const through = rel.split(path.sep).slice(0, -1).map((_, k, a) => a.slice(0, k + 1).join(path.sep)).find((p) => links.has(p));
    if (through) { problems.push(`file ${f.path} lies under the symlink ${through}`); continue; }
    const dest = path.join(stagingDir, rel);
    mkdirSync(path.dirname(dest), { recursive: true });
    if (f.symlink_target) symlinkSync(f.symlink_target, dest);
    else { writeFileSync(dest, f.content); if (f.executable) chmodSync(dest, 0o755); }
  }
  // Fields the harness owns, never the model: whatever the output says about
  // them is dropped and set here.
  for (const k of ['status', 'reviewedBy', 'generatedBy', 'baseHashes', 'decision', 'gateProblems', 'selfChecksPending', 'case', 'caseHash', 'factExemptions']) delete spec[k];
  const isBase = target.startsWith('base:');
  const out = isBase ? { ...spec } : (() => {
    const kase = findCase(target);
    // N/A is the owner's call (lib/spec.mjs lists them): those assertions are set N/A
    // here, and any other N/A the model wrote goes back as a gate problem.
    // The owner's own N/A marks on this target (decide.mjs na) survive a regeneration.
    const ownerNA = new Map((owner.na ?? []).map((c) => [c.assertion, c]));
    const checks = (spec.checks ?? []).map((ch) => {
      if (NA_ASSERTIONS.has(`${kase.key}.${ch.assertion}`)) return { assertion: ch.assertion, na: true, na_reason: `${LISTED_NA} counterfactual, future, or optional behavior` };
      if (ownerNA.has(ch.assertion)) return ownerNA.get(ch.assertion);
      if (ch.na) problems.push(`assertion ${ch.assertion} is marked N/A; only the owner marks N/A (lib/spec.mjs lists ${[...NA_ASSERTIONS].filter((k) => k.startsWith(`${kase.key}.`)).join(', ') || 'none'} for this case). Grade it, or explain in notes_for_reviewer why it cannot be graded.`);
      return ch;
    });
    // Assertions the catalog routes to the judge (what the role read or ran,
    // or judgment) are never decided by code alone: complete true becomes false,
    // and their checks stay as preconditions.
    const routed = judgeRoutedAssertions(kase);
    for (const ch of checks) if (ch.complete && routed.has(ch.assertion)) ch.complete = false;
    // Decision 8 assertions the model left out still get their N/A entry.
    for (let i = 0; i < kase.assertions.length; i += 1) {
      if (NA_ASSERTIONS.has(`${kase.key}.${i}`) && !checks.some((ch) => ch.assertion === i)) checks.push({ assertion: i, na: true, na_reason: `${LISTED_NA} counterfactual, future, or optional behavior` });
      else if (ownerNA.has(i) && !checks.some((ch) => ch.assertion === i)) checks.push(ownerNA.get(i));
    }
    return { ...spec, case: kase.key, caseHash: kase.hash, checks: checks.sort((a, b) => a.assertion - b.assertion), ...(owner.factExemptions?.length ? { factExemptions: owner.factExemptions } : {}) };
  })();
  out.status = 'draft';
  out.reviewedBy = null;
  out.generatedBy = { model, effort: FIXTURE_EFFORT, commit: sha, at: new Date().toISOString(), ...(owner.notesHash ? { notesHash: owner.notesHash } : {}) };
  writeFileSync(path.join(stagingDir, 'spec.json'), `${JSON.stringify(out, null, 2)}\n`);
  // Freeze the bases this spec builds on.
  try {
    const r = resolveSpec(stagingDir);
    if (r.bases.length) { out.baseHashes = Object.fromEntries(r.bases.map((b) => [b.name, b.hash])); writeFileSync(path.join(stagingDir, 'spec.json'), `${JSON.stringify(out, null, 2)}\n`); }
  } catch (e) { problems.push(`base: ${e.message}`); }
  return { problems, spec: out };
}

// Generate one target: call, materialize, gates 1 and 2, one repair if needed.
export async function generateOne(target, { commit = DEFAULT_COMMIT, notes = null, selfChecks = true, dry = false } = {}) {
  const fw = frameworkAt(commit);
  const dir = targetDir(target);
  const genDir = path.join(dir, 'gen', new Date().toISOString().replace(/[:.]/g, ''));
  // Built first: a target that cannot be generated yet (its base not ready) leaves nothing behind.
  const request = generationRequest(target, { sha: fw.sha, notes });
  mkdirSync(genDir, { recursive: true });
  writeFileSync(path.join(genDir, 'request-1.json'), JSON.stringify(request, null, 2));
  if (dry) return { target, dry: true, genDir, requestChars: JSON.stringify(request).length };

  const log = { target, commit: fw.sha, attempts: [], costUsd: 0 };
  const staging = `${dir}.staging`;
  // The owner's decisions on the previous spec (N/A marks, gate-2 exemptions)
  // carry over to the regenerated one; the notes it was made from are recorded.
  const prev = existsSync(path.join(dir, 'spec.json')) ? readJson(path.join(dir, 'spec.json')) : null;
  const owner = {
    na: (prev?.checks ?? []).filter((c) => c.na && /^owner decision:/.test(c.na_reason ?? '')),
    factExemptions: prev?.factExemptions ?? [],
    notesHash: notes ? createHash('sha256').update(notes).digest('hex').slice(0, 16) : null,
  };
  let messages = request.messages;
  let result = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const req = { ...request, messages };
    let call;
    try {
      call = await createMessage(req, { purpose: attempt === 1 ? 'generate' : 'generate-repair', ref: target });
    } catch (error) {
      // A failed call (after the SDK's retries, or a stream that broke) ends
      // the target: a first attempt's staged files and cost are kept, so the
      // spec lands as draft with the error, never silently lost.
      if (/Model calls are disabled/.test(error.message)) throw error;
      log.attempts.push({ attempt, costUsd: null, problems: [`API call failed: ${error.message}`], staged: false, callFailed: true });
      break;
    }
    const { message, costUsd, ms } = call;
    log.costUsd += costUsd ?? 0;
    writeFileSync(path.join(genDir, `response-${attempt}.json`), JSON.stringify(message, null, 2));
    const parsed = parseStructured(message);
    let problems;
    let staged = false; // whether this attempt's files are in the staging dir
    if (parsed.error) problems = [`generator output: ${parsed.error}`];
    else {
      // Output that cannot be written (a path both file and directory, a
      // duplicate link, checks of the wrong shape) is a problem for the repair call.
      let m;
      try { m = materialize(target, parsed.value, staging, { sha: fw.sha, model: GEN_MODEL, owner }); } catch (error) { m = { problems: [`generator output could not be written: ${error.message}`] }; }
      problems = m.problems;
      staged = Boolean(m.spec);
      if (!problems.length) {
        let v;
        // A crash in the gates (an unexpected spec shape) is a gate problem, so it gets the repair call.
        try { v = await validate(staging, { commit: fw.sha, selfChecks: selfChecks && dockerAvailable() }); } catch (error) { v = { problems: [`gate check crashed: ${error.message}`] }; }
        problems = v.problems;
        writeFileSync(path.join(genDir, `gates-${attempt}.json`), JSON.stringify({ problems: v.problems, factsChecked: v.factsChecked, selfChecks: v.selfChecks, check: v.build?.check }, null, 2));
        result = { value: parsed.value, selfChecksRan: v.selfChecks?.ran ?? false };
      }
    }
    log.attempts.push({ attempt, ms, costUsd, stop: message.stop_reason, usage: message.usage, problems, staged });
    if (!problems.length) break;
    // A first attempt whose files could not be staged leaves no spec; a staged dir from an earlier write is stale.
    if (!staged) rmSync(staging, { recursive: true, force: true });
    if (attempt === 2) break;
    // One repair: the problems go back in the same conversation (append-only,
    // so the cached prefix and the model's own turn are kept unchanged).
    messages = [...request.messages, { role: 'assistant', content: message.content },
      { role: 'user', content: `The fixture failed the harness's gates:\n${problems.map((p) => `- ${p}`).join('\n')}\n\nReturn the complete corrected output (the whole spec and every file, not a diff).` }];
    writeFileSync(path.join(genDir, 'request-2.json'), JSON.stringify({ ...request, messages }, null, 2));
  }
  const last = log.attempts.at(-1);
  const wrote = existsSync(path.join(staging, 'spec.json'));
  if (wrote) {
    const spec = readJson(path.join(staging, 'spec.json'));
    spec.status = last.problems.length ? 'draft' : 'gated';
    // The staged files are from the last attempt that produced output; when a
    // later attempt produced none, both attempts' problems are recorded.
    const staged = [...log.attempts].reverse().find((a) => a.staged);
    const problems = staged && staged !== last ? [...last.problems.map((p) => `attempt ${last.attempt}: ${p}`), ...staged.problems.map((p) => `attempt ${staged.attempt} (the files kept): ${p}`)] : last.problems;
    if (last.problems.length) spec.gateProblems = problems; else delete spec.gateProblems;
    if (result && !result.selfChecksRan && (spec.selfChecks ?? []).length) spec.selfChecksPending = true;
    writeFileSync(path.join(staging, 'spec.json'), `${JSON.stringify(spec, null, 2)}\n`);
    // Replace the spec dir's spec.json, layers/ and runtime/; keep gen/ and base.json.
    for (const sub of ['spec.json', 'layers', 'runtime', 'review.json']) rmSync(path.join(dir, sub), { recursive: true, force: true });
    for (const sub of ['spec.json', 'layers', 'runtime']) if (existsSync(path.join(staging, sub))) renameSync(path.join(staging, sub), path.join(dir, sub));
  }
  rmSync(staging, { recursive: true, force: true });
  writeFileSync(path.join(genDir, 'log.json'), JSON.stringify(log, null, 2));
  // A first call that failed wrote nothing: an error, whatever an earlier spec says.
  const status = !wrote && last.callFailed ? 'error' : existsSync(path.join(dir, 'spec.json')) ? readJson(path.join(dir, 'spec.json')).status : 'none';
  return { target, status, problems: last.problems, costUsd: log.costUsd, attempts: log.attempts.length, genDir };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const opt = (name, dflt) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : dflt; };
  const valued = new Set(['--commit', '--concurrency', '--notes']);
  const targets = argv.filter((a, i) => !a.startsWith('--') && !valued.has(argv[i - 1]));
  const notes = opt('notes') ? readJson(opt('notes')) : {};
  const commit = opt('commit', DEFAULT_COMMIT);
  const concurrency = Number(opt('concurrency', 3));
  // Gate 1's selfChecks need Docker; without it every selfCheck failure would
  // skip its repair call and surface only at review. Refuse instead.
  if (!argv.includes('--dry') && !argv.includes('--no-self-checks') && !dockerAvailable()) {
    console.error('Docker or the runner image is not available, so selfChecks cannot run; start Docker (or pass --no-self-checks)');
    process.exit(1);
  }
  const results = [];
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, async () => {
    while (next < targets.length) {
      const t = targets[next++];
      try {
        const sf = path.join(targetDir(t), 'spec.json');
        const have = existsSync(sf) ? readJson(sf).status : null;
        // A regeneration whose notes were already applied (an interrupted --notes run) is not paid for again.
        const applied = notes[t] && existsSync(sf) && readJson(sf).generatedBy?.notesHash === createHash('sha256').update(notes[t]).digest('hex').slice(0, 16);
        // A draft already had its one automatic repair: it waits for the owner, not another paid attempt.
        if (['draft', 'gated', 'flagged', 'reviewed', 'rejected'].includes(have) && (!notes[t] || applied) && !argv.includes('--force') && !argv.includes('--dry')) {
          results.push({ target: t, status: have, problems: [], costUsd: 0, skipped: true });
          console.log(`${t}: skipped (already ${have}; --force to regenerate)`);
          continue;
        }
        const r = await generateOne(t, { commit, notes: notes[t] ?? null, selfChecks: !argv.includes('--no-self-checks'), dry: argv.includes('--dry') });
        results.push({ target: t, ...r });
        console.log(`${t}: ${r.dry ? `dry (${r.requestChars} chars)` : `${r.status} after ${r.attempts} call(s), $${r.costUsd.toFixed(2)}${r.problems.length ? `\n  - ${r.problems.join('\n  - ')}` : ''}`}`);
      } catch (e) {
        results.push({ target: t, status: 'error', problems: [e.message], costUsd: 0 }); // thrown before any call (a base not ready, sign-off)
        console.log(`${t}: ERROR ${e.message}`);
      }
    }
  }));
  const cost = results.reduce((s, r) => s + (r.costUsd ?? 0), 0);
  console.log(`\n${results.length} targets; ${results.filter((r) => r.status === 'gated').length} gated; $${cost.toFixed(2)} spent`);
  // Files a layer's own .gitignore (or your global git config) would keep out
  // of a commit: a clone would build those fixtures without them.
  const written = results.filter((r) => !r.skipped && !r.dry && r.status !== 'error').map((r) => `${path.relative(REPO_ROOT, targetDir(r.target))}/`);
  const left = written.length ? uncommittableFixtureFiles(userGitEnv()).filter((f) => written.some((d) => f.startsWith(d))) : [];
  if (left.length) console.log(`\ngit would leave out ${left.length} fixture file(s); add them with: git add -f ${left.join(' ')}`);
  process.exit(results.some((r) => r.status === 'error') ? 1 : 0);
}
