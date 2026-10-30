#!/usr/bin/env node
// Record the owner's decision on a flagged spec (gate 4). Every decision is
// kept in the spec (`decision`, with the owner's words) and in
// fixtures/decisions.jsonl.
//
//   node decide.mjs <target> run [--note "..."]              run as is -> reviewed
//   node decide.mjs <target> na --assertions 2,5 [--note]    mark assertions N/A -> reviewed
//   node decide.mjs <target> defer [--note]                  -> rejected (listed as NOT_RUN)
//   node decide.mjs <target> fixed --note "what changed"     after a named file fix: gates 1-2 must
//                                                            pass again, then -> reviewed; -> gated
//                                                            (review-fixture.mjs next) when gate 3 never
//                                                            reviewed it or a base under it changed
//   node decide.mjs <target> exempt --fact git:staged --note "why"   gate 2 misread a fact the
//                                                            prompt does not state; skip it (status unchanged)
//   node decide.mjs <target> regenerate [--note]             -> flagged until regenerated with the
//                                                            reviewer's notes (writes fixtures/regenerate-notes.json
//                                                            for generate-fixture.mjs --notes); earlier
//                                                            na and exempt decisions carry over
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { resolveSpec, staleBases } from './build-fixture.mjs';
import { DEFAULT_COMMIT, FIXTURES_ROOT } from './lib/cases.mjs';
import { dockerAvailable } from './lib/selfcheck.mjs';
import { targetDir } from './generate-fixture.mjs';
import { validate } from './validate-fixture.mjs';

const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };
const [target, action] = argv;
if (!target || !['run', 'na', 'defer', 'fixed', 'regenerate', 'exempt'].includes(action)) throw new Error('usage: decide.mjs <target> run|na|defer|fixed|regenerate|exempt [--assertions i,j] [--fact <id>] [--note "..."] [--commit <sha>]');
const dir = targetDir(target);
const specFile = path.join(dir, 'spec.json');
const spec = readJson(specFile);
const note = opt('note') ?? '';
const decision = { action, note, at: new Date().toISOString() };

if (action === 'run') spec.status = 'reviewed';
if (action === 'exempt') {
  const fact = opt('fact');
  if (!fact || !note) throw new Error('exempt needs --fact <id> and --note');
  spec.factExemptions = [...new Set([...(spec.factExemptions ?? []), fact])];
  decision.fact = fact;
}
if (action === 'defer') spec.status = 'rejected';
if (action === 'na') {
  const list = (opt('assertions') ?? '').split(',').filter(Boolean).map(Number);
  if (!list.length) throw new Error('na needs --assertions');
  spec.checks = spec.checks.map((ch) => (list.includes(ch.assertion) ? { assertion: ch.assertion, na: true, na_reason: `owner decision: ${note || 'not gradeable in this fixture'}` } : ch));
  decision.assertions = list;
  spec.status = 'reviewed';
}
if (action === 'fixed') {
  writeFileSync(specFile, `${JSON.stringify(spec, null, 2)}\n`);
  // A named fix needs gates 1 and 2, selfChecks included, to pass again.
  if ((spec.selfChecks ?? []).length && !dockerAvailable()) { console.log('the spec has selfChecks and Docker or the runner image is not available'); process.exit(1); }
  // The release under test, not the one the spec was first written for.
  const commit = opt('commit') ?? DEFAULT_COMMIT;
  const v = await validate(dir, { commit, selfChecks: true, allowStaleBases: true });
  if (v.problems.length || !v.build) { console.log(`still failing gates:\n- ${v.problems.join('\n- ')}`); process.exit(1); }
  delete spec.gateProblems;
  decision.fixtureHash = v.build.fixtureHash;
  // Only fixtures gate 3 reviewed, or that you decided on after its review,
  // run. A spec gate 3 never reviewed (it failed to build), or
  // whose bases changed since its review, goes back to gate 3 instead.
  const reviewed = existsSync(path.join(dir, 'review.json')) && spec.reviewedBy?.at;
  const bases = resolveSpec(dir).bases;
  const basesChanged = staleBases(dir).length > 0 || bases.some((b) => (spec.baseHashes ?? {})[b.name] !== b.hash);
  if (!reviewed || basesChanged) {
    spec.status = 'gated';
    decision.reviewDue = !reviewed ? 'gate 3 never reviewed this spec' : 'a base under it changed since its review';
  } else {
    spec.status = 'reviewed';
    // run.mjs runs only this exact build.
    spec.reviewedBy = { ...spec.reviewedBy, fixtureHash: v.build.fixtureHash, commit: v.build.framework, fixedBy: 'owner decision' };
  }
}
if (action === 'regenerate') {
  const review = existsSync(path.join(dir, 'review.json')) ? readJson(path.join(dir, 'review.json')) : { issues: [] };
  const notesFile = path.join(FIXTURES_ROOT, 'regenerate-notes.json');
  const notes = existsSync(notesFile) ? readJson(notesFile) : {};
  // Only what the generator can fix: gate problems, and blocking issues the
  // reviewer would fix in the files (an N/A, a deferral, or run-as-is is the
  // owner's decision, recorded separately and carried over).
  notes[target] = [...(spec.gateProblems ?? []).map((g) => `Gate problem: ${g}`),
    ...review.issues.filter((i) => i.severity === 'blocking' && ['regenerate', 'fix_file'].includes(i.recommendation)).map((i) => `${i.kind}${i.assertion >= 0 ? ` (assertion ${i.assertion})` : ''}: ${i.detail} Fix: ${i.fix}`),
    ...(review.conditions ?? []).filter((c) => c.status !== 'realized').map((c) => `Condition ${c.status}: ${c.condition}${c.where ? ` (${c.where})` : ''}`),
    ...(note ? [`Owner: ${note}`] : [])].join('\n');
  writeFileSync(notesFile, JSON.stringify(notes, null, 2));
  // Not runnable until it is regenerated and reviewed again.
  spec.status = 'flagged';
}
// Any decision but regenerate settles a fixture a migration set aside: it no
// longer waits to be written again (`fixtures generate --needed`).
if (action !== 'regenerate' && action !== 'exempt') delete spec.needsRegeneration;
spec.decision = decision;
writeFileSync(specFile, `${JSON.stringify(spec, null, 2)}\n`);
appendFileSync(path.join(FIXTURES_ROOT, 'decisions.jsonl'), `${JSON.stringify({ target, ...decision })}\n`);
console.log(`${target}: ${action} -> ${spec.status}${decision.reviewDue ? ` (${decision.reviewDue}; run review-fixture.mjs ${target})` : ''}`);
