#!/usr/bin/env node
// Send one run's judge requests one at a time and merge the verdicts into
// verdicts.json. For a whole run, judge-run.mjs does the same through a
// worker pool or the Batch API.
//
//   node apply-judge.mjs <run-case-dir> [--responses <dir>]
//
// With --responses, reads <dir>/<n>.json instead of calling the API: that is
// how the merge logic is tested without a model. Without it, the call refuses
// unless EVAL_ALLOW_MODEL=1 (after sign-off).
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { mergeJudge, sendJudge } from './judge.mjs';

const [runDir, flag, responsesDir] = process.argv.slice(2);
const verdictsFile = path.join(runDir, 'verdicts.json');
const verdicts = JSON.parse(readFileSync(verdictsFile, 'utf8'));
const reqDir = path.join(runDir, 'judge-requests');
const pending = existsSync(reqDir) ? readdirSync(reqDir).filter((f) => f.endsWith('.json')) : [];

for (const file of pending) {
  const i = Number(path.basename(file, '.json'));
  const a = verdicts.assertions.find((x) => x.i === i);
  if (!a || a.verdict !== 'NEEDS_JUDGE') continue; // deterministic result stands
  const request = JSON.parse(readFileSync(path.join(reqDir, file), 'utf8'));
  let result;
  try {
    result = flag === '--responses'
      ? JSON.parse(readFileSync(path.join(responsesDir, file), 'utf8'))
      : await sendJudge(request, { ref: `${verdicts.case}#${i}` });
  } catch (error) {
    // Before sign-off nothing is sent and nothing is recorded.
    if (/Model calls are disabled/.test(error.message)) { console.error(error.message); process.exit(1); }
    result = { verdict: 'ERROR', evidence: [], rationale: error.message }; // grader error, not a model failure
  }
  mergeJudge(a, result, request);
}
writeFileSync(verdictsFile, JSON.stringify(verdicts, null, 2));
const left = verdicts.assertions.filter((x) => x.verdict === 'NEEDS_JUDGE').length;
console.log(`${verdicts.case}: ${pending.length} judge requests; ${left} assertions still need a judge`);
