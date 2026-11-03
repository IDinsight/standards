#!/usr/bin/env node
// Measured spend from evals/spend.jsonl (every API call the harness
// makes) plus role runs' own cost (usage.json in each run), for the report at
// each stop.
//
//   node spend.mjs [--since <ISO time>] [<run-dir> ...]
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { SPEND_LOG } from './lib/anthropic.mjs';
import { SECOND_JUDGE_MODEL } from './lib/config.mjs';

const argv = process.argv.slice(2);
const si = argv.indexOf('--since');
const since = si >= 0 ? argv[si + 1] : null;
const runDirs = argv.filter((a, i) => !a.startsWith('--') && (si < 0 || i !== si + 1));
const byPurpose = {};
if (existsSync(SPEND_LOG)) {
  for (const line of readFileSync(SPEND_LOG, 'utf8').split('\n').filter(Boolean)) {
    const e = JSON.parse(line);
    if (since && e.ts < since) continue;
    // Judge checks: the second judge is its own line.
    const label = /^judge-check/.test(e.purpose ?? '') && e.model === SECOND_JUDGE_MODEL ? `${e.purpose} (second judge)` : e.purpose;
    if (e.submitted) continue; // a batch submission; its requests are logged as results arrive
    const p = (byPurpose[label] ??= { calls: 0, usd: 0, unknown: 0 });
    p.calls += 1;
    if (e.costUsd === null || e.costUsd === undefined) p.unknown += 1; else p.usd += e.costUsd;
  }
}
let runs = 0; let runUsd = 0; let unknown = 0;
for (const d of runDirs) {
  const cases = path.join(d, 'cases');
  if (!existsSync(cases)) continue;
  for (const k of readdirSync(cases, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)) for (const r of readdirSync(path.join(cases, k))) {
    const u = path.join(cases, k, r, 'usage.json');
    if (!existsSync(u)) continue;
    const x = JSON.parse(readFileSync(u, 'utf8'));
    runs += 1;
    if (x.costUsd === null || x.costUsd === undefined) unknown += 1; else runUsd += x.costUsd;
  }
}
const total = Object.values(byPurpose).reduce((s, p) => s + p.usd, 0) + runUsd;
console.log('| Item | Calls or runs | USD |\n| --- | ---: | ---: |');
for (const [k, p] of Object.entries(byPurpose).sort()) console.log(`| ${k} | ${p.calls}${p.unknown ? ` (${p.unknown} unknown)` : ''} | ${p.usd.toFixed(2)} |`);
if (runDirs.length) console.log(`| role runs (Claude Code's reported cost) | ${runs}${unknown ? ` (${unknown} unknown)` : ''} | ${runUsd.toFixed(2)} |`);
console.log(`| **total** | | **${total.toFixed(2)}** |`);
