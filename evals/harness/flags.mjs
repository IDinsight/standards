#!/usr/bin/env node
// Collect what needs the owner's decision (gate 4): every flagged spec's
// blocking issues with the reviewer's recommendation, and any spec that still
// fails gates 1 and 2 after its repair call. Notes (non-blocking) are counted,
// not listed.
//
//   node flags.mjs [<target> ...]        (default: every spec and base)
//   node flags.mjs --json [...]
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { BASES_DIR, staleBases } from './build-fixture.mjs';
import { FIXTURES_ROOT } from './lib/cases.mjs';
import { targetDir } from './generate-fixture.mjs';

const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));

export function allTargets() {
  const out = [];
  if (existsSync(BASES_DIR)) for (const n of readdirSync(BASES_DIR).sort()) if (existsSync(path.join(BASES_DIR, n, 'spec.json'))) out.push(`base:${n}`);
  const fx = FIXTURES_ROOT;
  for (const role of readdirSync(fx, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('_')).map((e) => e.name).sort()) {
    for (const id of readdirSync(path.join(fx, role)).filter((n) => /^\d+$/.test(n)).sort((a, b) => a - b)) if (existsSync(path.join(fx, role, id, 'spec.json'))) out.push(`${role}-${id}`);
  }
  return out;
}

export function flagsFor(target) {
  const dir = targetDir(target);
  const spec = readJson(path.join(dir, 'spec.json'));
  const review = existsSync(path.join(dir, 'review.json')) ? readJson(path.join(dir, 'review.json')) : null;
  const blocking = (review?.issues ?? []).filter((i) => i.severity === 'blocking');
  const notes = (review?.issues ?? []).filter((i) => i.severity === 'note');
  return {
    target, status: spec.status, decided: spec.decision ?? null,
    gateProblems: spec.gateProblems ?? review?.gateProblems ?? [],
    blocking,
    // What flagged it when no blocking issue did: a condition the reviewer
    // found missing or contradicted, or a verdict of "issues" with only notes.
    unmet: (review?.conditions ?? []).filter((c) => c.status !== 'realized'),
    flaggingNotes: spec.status === 'flagged' && !blocking.length && review?.verdict !== 'pass' ? notes : [],
    notes: notes.length,
    summary: review?.summary ?? null,
    // A base under it changed since it was reviewed: it must be reviewed again.
    stale: (() => { try { return staleBases(dir); } catch { return []; } })(),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const targets = argv.filter((a) => !a.startsWith('--'));
  const rows = (targets.length ? targets : allTargets()).map(flagsFor);
  // Anything not yet runnable stays listed, even after a decision that does
  // not by itself make it reviewed (exempt, regenerate): the follow-up step
  // (run or fixed after exempt; generate then review after regenerate) is due.
  // A gated spec with a decision is due for gate 3 (after decide.mjs fixed); a stale one for a re-review.
  const open = rows.filter((r) => ['flagged', 'draft'].includes(r.status) || (r.status === 'gated' && r.decided) || r.stale.length);
  if (argv.includes('--json')) { console.log(JSON.stringify(open, null, 2)); process.exit(0); }
  const counts = rows.reduce((m, r) => ({ ...m, [r.status]: (m[r.status] ?? 0) + 1 }), {});
  console.log(`${rows.length} specs: ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ')}; ${open.length} need a decision`);
  for (const r of open) {
    console.log(`\n## ${r.target} (${r.status}${r.decided ? `; decided ${r.decided.action}${r.decided.fact ? ` ${r.decided.fact}` : ''}, follow-up due` : ''})${r.summary ? `\n${r.summary}` : ''}`);
    for (const g of r.gateProblems) console.log(`- gate: ${g}`);
    for (const i of r.blocking) console.log(`- [${i.kind}${i.assertion >= 0 ? `, assertion ${i.assertion}` : ''}] ${i.detail}\n  recommend ${i.recommendation}: ${i.fix}`);
    for (const c of r.unmet) console.log(`- [condition ${c.status}] ${c.condition}${c.where ? ` (${c.where})` : ''}`);
    for (const i of r.flaggingNotes) console.log(`- [note, verdict issues: ${i.kind}${i.assertion >= 0 ? `, assertion ${i.assertion}` : ''}] ${i.detail}\n  recommend ${i.recommendation}: ${i.fix}`);
    for (const x of r.stale) console.log(`- stale: ${x.spec}'s parent ${x.parent} changed since it was reviewed; review again (review-fixture.mjs --force)`);
    if (r.status === 'gated' && r.decided) console.log(`- gate 3 due: review-fixture.mjs ${r.target}`);
  }
}
