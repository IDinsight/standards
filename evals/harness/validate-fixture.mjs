#!/usr/bin/env node
// Gate 2: compare the facts a prompt states explicitly with the built fixture.
// No model. A mismatch means the fixture contradicts its prompt.
//
//   node validate-fixture.mjs <spec-dir> [<spec-dir> ...]
//
// Checks: ProjectMode, CycleMode, PendingCycleMode, WorkflowState, Active Work
// fields, recovery on/off; every AC/DEV/F/D/DOC identifier the prompt names
// appears as a defined entry in the fixture's records; stated statuses of
// identifiers; and stated git conditions (staged, unstaged, untracked, deleted,
// clean diff, conflict). Facts a prompt does not state are not checked here;
// gate 3 (semantic audit) covers them.
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { buildFixture, frameworkAt, resolveSpec } from './build-fixture.mjs';
import { DEFAULT_COMMIT, findCase } from './lib/cases.mjs';
import { runSelfChecks } from './lib/selfcheck.mjs';
import { readSpec, specProblems, undefinedVars } from './lib/spec.mjs';
import { git, snapshot } from './lib/snapshot.mjs';
import { extractFacts } from './extract-facts.mjs';

// All Markdown under .standards/docs plus any unmarked scope/design document
// the state points to.
// SelfCheck commands with the spec's ${VAR}s filled in (an unknown one is left as written).
export const selfCheckCommands = (checks = [], vars = {}) => checks.map((c) => ({ ...c, cmd: c.cmd.replace(/\$\{(\w+)\}/g, (m, k) => vars[k] ?? m) }));

export function recordsText(root, state) {
  const files = [];
  // lstat, not stat: a symlink (a case may point a records folder outside the
  // project, and the target may exist only at run time) is skipped, never
  // followed, so one dangling link cannot hide every other record.
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = lstatSync(p);
      if (st.isDirectory()) walk(p);
      else if (st.isFile() && name.endsWith('.md')) files.push(p);
    }
  };
  try { walk(path.join(root, '.standards/docs')); } catch { /* no records yet */ }
  for (const k of ['ActiveWork.Scope', 'ActiveWork.Architecture']) {
    const v = state?.[k];
    if (v && v !== 'NONE' && !v.startsWith('.standards/')) files.push(path.join(root, v));
  }
  return files.map((f) => { try { return readFileSync(f, 'utf8'); } catch { return ''; } }).join('\n');
}

// Gates 1 and 2 on a spec dir: the spec's structure, the build, check.mjs as
// expected, selfChecks in the runner image (when Docker is reachable and
// asked for), and the prompt's stated facts. A shared base gets gate 1 only.
export async function validate(specDir, { commit = DEFAULT_COMMIT, selfChecks = false, out = null, allowStaleBases = false } = {}) {
  const spec = readSpec(specDir);
  const isBase = !spec.case;
  const kase = isBase ? null : findCase(spec.case);
  let structure;
  try {
    structure = specProblems(spec, { kase, specDir, isBase });
    // Every ${VAR} must resolve against the case's and its bases' vars.
    const missing = undefinedVars(spec, resolveSpec(specDir).vars);
    if (missing.length) structure.push(`undefined vars used in checks, invariants, or runtime: ${missing.map((v) => `\${${v}}`).join(', ')}`);
  } catch (error) {
    structure = [`spec structure check failed: ${error.message}`];
  }
  const dest = out ?? path.join(os.tmpdir(), 'standards-eval-validate', spec.case ?? `base-${path.basename(specDir)}`);
  let build;
  try {
    build = buildFixture({ specDir, out: dest, commit, allowStaleBases });
  } catch (error) {
    return { case: spec.case ?? null, base: isBase ? path.basename(specDir) : null, factsChecked: 0, problems: [...structure, `build failed: ${error.message}`], out: dest };
  }
  // Revision placeholders outside layer files: ${COMMIT:<subject>} must name a
  // commit of this build (grading resolves it); ${BLOB:...} works only in layer files.
  {
    const vars = resolveSpec(specDir).vars;
    const text = JSON.stringify([spec.checks ?? null, spec.invariants ?? null, spec.runtime ?? null, vars]);
    for (const m of text.matchAll(/\$\{COMMIT:([^}]+)\}/g)) if (!(m[1] in (build.revisions?.commits ?? {}))) structure.push(`\${COMMIT:${m[1]}} in a check, invariant, or var names no commit of this build`);
    if (/\$\{BLOB:/.test(text)) structure.push('${BLOB:...} works only in layer files, not in checks, invariants, vars, or runtime');
  }
  const snap = await snapshot(dest, { commit });
  const { factsChecked, problems } = isBase ? { factsChecked: 0, problems: [] } : checkFacts(kase, dest, snap, spec.factExemptions);
  // SelfCheck commands may use the spec's ${VAR}s, as checks do (an undefined
  // one stays as written, and the shell sees an empty variable).
  const withVars = selfCheckCommands(spec.selfChecks, resolveSpec(specDir).vars);
  const sc = selfChecks ? runSelfChecks(dest, withVars, { runtime: resolveSpec(specDir).runtime, specDir, framework: frameworkAt(commit) }) : { ran: false, problems: [], note: 'not requested' };
  return { case: spec.case ?? null, base: isBase ? path.basename(specDir) : null, factsChecked, problems: [...structure, ...build.problems, ...problems, ...sc.problems], selfChecks: sc, build, out: dest };
}

// Gate 2 on an already built fixture: stated prompt facts versus files.
// exemptions: facts the owner ruled the regex extractor misread
// (`decide.mjs <case> exempt --fact <id>`), as ids such as "Recovery.Active",
// "git:staged", "id:AC-004", "status:F-003".
export function checkFacts(kase, out, snap, exemptions = []) {
  const facts = extractFacts(kase.prompt);
  const skip = new Set(exemptions ?? []);
  const problems = [];
  const state = snap.state ?? {};

  for (const [name, want] of Object.entries(facts.scalars)) {
    if (skip.has(name)) continue;
    const have = state[name];
    if (have !== want) problems.push(`${name}: prompt says ${want}, fixture has ${have}`);
  }
  const text = recordsText(out, state);
  for (const [prefix, ids] of Object.entries(facts.ids)) {
    for (const id of ids) {
      if (skip.has(`id:${id}`)) continue;
      // Defined = a list item (AC) or a ### heading (DEV, F, D, DOC), per PROTOCOL.md.
      const defined = prefix === 'AC'
        ? new RegExp(`^\\s*(?:[-*]|\\d+\\.)\\s+\`?${id}\`?\\s*[:—-]`, 'm').test(text)
        : new RegExp(`^###\\s+${id}\\b`, 'm').test(text);
      if (!defined) problems.push(`${id} named in the prompt but not defined in the fixture's records`);
    }
  }
  for (const [id, status] of Object.entries(facts.idStatus)) {
    if (skip.has(`status:${id}`)) continue;
    const block = text.split(/^###\s+/m).find((b) => b.startsWith(id));
    if (block && !new RegExp(`\`Status\`:\\s*\`${status}\``).test(block)) problems.push(`${id}: prompt says ${status}, record disagrees`);
  }
  const st = snap.status;
  const gitHas = {
    staged: st.some((l) => /^[MADRC]/.test(l)),
    unstaged: st.some((l) => /^.[MD]/.test(l)),
    untracked: st.some((l) => l.startsWith('??')),
    // A deletion in the working tree or index, or one already committed.
    // --no-renames: a committed move counts as deleting the old path.
    deleted: st.some((l) => /^(D.|.D)/.test(l)) || Boolean(git(out, ['log', '--no-renames', '--diff-filter=D', '--name-only', '--format='])),
    cleanDiff: st.filter((l) => !l.startsWith('??')).length === 0,
    conflict: st.some((l) => /^(UU|AA|DD|AU|UA|DU|UD)/.test(l)),
  };
  for (const cond of facts.git) {
    if (skip.has(`git:${cond}`)) continue;
    if (cond in gitHas && !gitHas[cond]) problems.push(`git: prompt implies ${cond}, fixture status is [${st.join(', ')}]`);
  }
  return { factsChecked: Object.keys(facts.scalars).length + Object.values(facts.ids).flat().length + Object.keys(facts.idStatus).length + facts.git.length, problems };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // node validate-fixture.mjs [--self-checks] [--commit <sha>] <spec-dir> [<spec-dir> ...]
  const argv = process.argv.slice(2);
  const ci = argv.indexOf('--commit');
  const commit = ci >= 0 ? argv[ci + 1] : DEFAULT_COMMIT;
  const dirs = argv.filter((a, i) => !a.startsWith('--') && (ci < 0 || i !== ci + 1));
  let failed = 0;
  for (const dir of dirs) {
    // A base that is only a description (base.json, no spec yet) has nothing to validate.
    if (!existsSync(path.join(dir, 'spec.json'))) { console.log(`skip ${dir}: no spec.json`); continue; }
    const r = await validate(dir, { commit, selfChecks: argv.includes('--self-checks') });
    failed += r.problems.length ? 1 : 0;
    console.log(`${r.problems.length ? 'FAIL' : 'ok  '} ${r.case ?? `base ${r.base}`}: ${r.factsChecked} stated facts checked${r.selfChecks?.ran ? `, ${r.selfChecks.results.length} selfChecks` : ''}${r.problems.length ? `\n  - ${r.problems.join('\n  - ')}` : ''}`);
  }
  process.exit(failed ? 1 : 0);
}
