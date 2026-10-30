#!/usr/bin/env node
// Judge every pending assertion of a run: each case's judge-requests/<n>.json
// is sent, and the verdict is merged into that case's verdicts.json.
//
//   node judge-run.mjs <run-dir> [--mode sync|batch] [--concurrency 4] [--retry-errors]
//
// sync   one call per assertion through a small worker pool (fast);
//        one call per run first, so the run's other calls read its cached evidence.
// batch  one Message Batch for the whole run (half price; most
//        batches end within an hour, at most 24). The batch id is saved in
//        <run-dir>/judge-batch.json before polling, so an interrupted wait
//        resumes by running the same command again.
// --retry-errors  re-send assertions whose judge verdict is ERROR (a refusal,
//        a truncated or unparseable verdict, a failed call) once.
//
// Refuses to call a model unless EVAL_ALLOW_MODEL=1.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { batchId, batchResults, pollBatch, submitBatch } from './lib/anthropic.mjs';
import { JUDGE_MODEL, mergeJudge, sendJudge, verdictFromMessage } from './judge.mjs';

const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));

// Every (case, rep, assertion) whose verdict still needs the judge.
export function pendingJudgeCalls(runDir, { retryErrors = false } = {}) {
  const out = [];
  const casesDir = path.join(runDir, 'cases');
  if (!existsSync(casesDir)) return out;
  // Case folders only (Finder can leave a .DS_Store file here).
  for (const key of readdirSync(casesDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
    for (const rep of readdirSync(path.join(casesDir, key)).sort()) {
      if (/-attempt\d+$/.test(rep)) continue; // failed first attempts are kept, not graded
      const dir = path.join(casesDir, key, rep);
      const vf = path.join(dir, 'verdicts.json');
      if (!existsSync(vf)) continue;
      const v = readJson(vf);
      for (const a of v.assertions ?? []) {
        const want = a.verdict === 'NEEDS_JUDGE' || (retryErrors && a.verdict === 'ERROR' && a.judge);
        const reqFile = path.join(dir, 'judge-requests', `${a.i}.json`);
        if (want && existsSync(reqFile)) out.push({ key, rep, i: a.i, dir, reqFile, customId: batchId(`${key}_${rep}_a${a.i}`) });
      }
    }
  }
  const ids = new Set(out.map((c) => c.customId));
  if (ids.size !== out.length) throw new Error('custom_id collision; shorten case keys');
  return out;
}

// Merge results into each case's verdicts.json (one read and write per case).
export function mergeResults(calls, resultFor) {
  const byDir = new Map();
  for (const c of calls) (byDir.get(c.dir) ?? byDir.set(c.dir, []).get(c.dir)).push(c);
  let merged = 0;
  for (const [dir, list] of byDir) {
    const vf = path.join(dir, 'verdicts.json');
    const v = readJson(vf);
    for (const c of list) {
      const result = resultFor(c);
      if (!result) continue;
      const a = v.assertions.find((x) => x.i === c.i);
      if (a) {
        if (a.verdict === 'ERROR' && a.judge) a.verdict = 'NEEDS_JUDGE'; // a retried grader error
        if (mergeJudge(a, result, readJson(c.reqFile))) merged += 1;
      }
    }
    writeFileSync(vf, JSON.stringify(v, null, 2));
  }
  return merged;
}

// The part of a request that prompt caching keys on: model, system, and the
// content up to the last cache breakpoint.
export function cachePrefixKey(req) {
  const content = req.messages?.[0]?.content ?? [];
  const last = Array.isArray(content) ? content.map((b) => Boolean(b.cache_control)).lastIndexOf(true) : -1;
  return createHash('sha256').update(JSON.stringify([req.model, req.system, last >= 0 ? content.slice(0, last + 1) : null])).digest('hex');
}

// Send judge requests and return verdicts keyed by customId.
//   items: [{ customId, request }]
//   sync:  a pool of `concurrency` single calls;
//   batch: one Message Batch; its id is saved to `stateFile` before polling,
//          so running the same command again resumes the wait.
// onResult(customId, verdict) runs as each sync result arrives, so callers
// can save it at once and an interruption loses nothing already paid for.
export async function sendAll(items, { mode = 'sync', concurrency = 4, stateFile, purpose = 'judge', onResult } = {}) {
  const results = new Map();
  if (!items.length) return results;
  if (mode === 'sync') {
    // Requests sharing a cached prefix (one run's evidence) are sent one first,
    // the rest only after it returns: a cache entry is readable only once its
    // first response has started, so parallel calls with the same prefix would
    // each pay a full cache write. Followers go to the front of the queue, so
    // they reuse the entry while it is warm.
    const groups = new Map();
    for (const it of items) { const k = cachePrefixKey(it.request); (groups.get(k) ?? groups.set(k, []).get(k)).push(it); }
    const queue = [...groups.values()].map((g) => g[0]);
    const followers = new Map([...groups.values()].map((g) => [g[0], g.slice(1)]));
    let active = 0;
    const waiters = [];
    const wake = () => { while (waiters.length) waiters.shift()(); };
    const take = async () => {
      for (;;) {
        if (queue.length) { active += 1; return queue.shift(); }
        if (!active) return null;
        await new Promise((r) => waiters.push(r));
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      for (let it = await take(); it; it = await take()) {
        try {
          const r = await sendJudge(it.request, { purpose, ref: it.customId });
          results.set(it.customId, r);
          onResult?.(it.customId, r);
          process.stdout.write('.');
        } finally {
          active -= 1;
          queue.unshift(...(followers.get(it) ?? []));
          wake();
        }
      }
    }));
    process.stdout.write('\n');
    return results;
  }
  let state = stateFile && existsSync(stateFile) ? readJson(stateFile) : null;
  if (!state || state.collected || !items.every((c) => state.customIds.includes(c.customId))) {
    const b = await submitBatch(items.map((it) => ({ custom_id: it.customId, params: it.request })), { purpose: `${purpose}-batch` });
    state = { id: b.id, submittedAt: new Date().toISOString(), customIds: items.map((c) => c.customId) };
    if (stateFile) writeFileSync(stateFile, JSON.stringify(state, null, 2));
    console.log(`submitted batch ${b.id} with ${items.length} requests`);
  } else {
    console.log(`resuming batch ${state.id}`);
  }
  const ended = await pollBatch(state.id, { onTick: (b) => console.log(`${new Date().toISOString()} ${b.processing_status} ${JSON.stringify(b.request_counts)}`) });
  const raw = await batchResults(state.id, { purpose: `${purpose}-batch` });
  for (const [id, r] of raw) {
    // An errored or expired request is a grader ERROR; --retry-errors resends it.
    results.set(id, r.type === 'succeeded' ? verdictFromMessage(r.message, r.costUsd)
      : { verdict: 'ERROR', evidence: [], rationale: `batch request ${r.type}${r.error ? `: ${JSON.stringify(r.error)}` : ''}` });
  }
  if (stateFile) writeFileSync(stateFile, JSON.stringify({ ...state, collected: true, endedAt: ended.ended_at ?? new Date().toISOString(), counts: ended.request_counts }, null, 2));
  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const opt = (name, dflt) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : dflt; };
  // One or more run directories.
  const valued = new Set(['--mode', '--concurrency']);
  const runDirs = argv.filter((a, i) => !a.startsWith('--') && !valued.has(argv[i - 1]));
  const mode = opt('mode', 'sync');
  for (const runDir of runDirs) {
    // The judge must not be the model it grades (self-preference).
    const runModel = existsSync(path.join(runDir, 'run.json')) ? readJson(path.join(runDir, 'run.json')).model : null;
    if (runModel && runModel === JUDGE_MODEL) {
      console.error(`${runDir}: the judge (${JUDGE_MODEL}) is the model under test in this run; set EVAL_JUDGE_MODEL to a different model`);
      process.exit(1);
    }
    const calls = pendingJudgeCalls(runDir, { retryErrors: argv.includes('--retry-errors') });
    if (!calls.length) { console.log(`${runDir}: nothing to judge`); continue; }
    console.log(`${runDir}: ${calls.length} judge calls (${mode})`);
    const byId = new Map(calls.map((c) => [c.customId, c]));
    let merged = 0;
    // Sync results are merged as they arrive, so re-running after an
    // interruption sends only what is still pending.
    const results = await sendAll(calls.map((c) => ({ customId: c.customId, request: readJson(c.reqFile) })),
      { mode, concurrency: Number(opt('concurrency', 4)), stateFile: path.join(runDir, 'judge-batch.json'),
        onResult: (id, r) => { merged += mergeResults([byId.get(id)], () => r); } });
    if (mode !== 'sync') merged = mergeResults(calls, (c) => results.get(c.customId));
    const errors = [...results.values()].filter((r) => r.verdict === 'ERROR').length;
    const cost = [...results.values()].reduce((s, r) => s + (r.costUsd ?? 0), 0);
    console.log(`${runDir}: merged ${merged} verdicts; ${errors} grader errors; judge cost $${cost.toFixed(2)}`);
  }
}
