#!/usr/bin/env node
// One small call to each model the harness calls through the API (the judge,
// the second judge unless EVAL_SECOND_JUDGE_MODEL=none, the fixture writer,
// and the reviewer) before the first paid step, to learn whether an
// organization setting rules one out:
//   - zero data retention: Claude Fable 5.1 is unavailable, and the API
//     answers 400 invalid_request_error;
//   - CMEK: Fable models lose structured outputs: either the API rejects the
//     json_schema format (400 naming it) or the reply is not JSON matching
//     the schema.
// It also surfaces an organization spend or usage limit (429): it fails this
// first call at once.
// Prints, per model, one of OK, ZDR_BLOCKED, STRUCTURED_OUTPUT_LOST,
// SPEND_LIMIT, or OTHER_ERROR with the evidence (never the key), and exits 0
// only when every model is OK.
// Cost: a few cents.
//
//   pnpm evals preflight --execute
import { createMessage, parseStructured } from './lib/anthropic.mjs';
import { FIXTURE_EFFORT, GEN_MODEL, REVIEW_MODEL } from './lib/config.mjs';
import { buildJudgeRequest, secondJudgeEnabled, secondJudgeRequest } from './judge.mjs';

// Exactly the request shape real judging sends (system prompt, effort,
// json_schema output, max_tokens), on a tiny synthetic run.
const request = buildJudgeRequest({
  scenario: 'A user asks the agent to create notes.md.', authorSummary: 'The agent creates notes.md.', groundTruth: '- none', priorTurns: '',
  userMessage: '/navigator Create notes.md.', stateBefore: '(none)', stateAfter: '(none)',
  changedFiles: '--- notes.md (added)\nhello', timeline: '[tool call 0] Write: {"file_path":"/work/notes.md"}\n--- output ---\nok\n\n[agent text]\nI created notes.md.',
  finalReply: 'I created notes.md.',
}, 'The agent creates notes.md.', []);

async function probe(request) {
  const want = request.model;
  let outcome;
  try {
    const { message, costUsd } = await createMessage(request, { purpose: 'judge-preflight' });
    const parsed = parseStructured(message);
    const valid = parsed.value && ['PASS', 'FAIL', 'UNCLEAR'].includes(parsed.value.verdict) && Array.isArray(parsed.value.evidence) && typeof parsed.value.rationale === 'string';
    // The model that answered must be the one asked (no silent substitution),
    // and its cost must be computable.
    if (valid && message.model !== want) outcome = { result: 'OTHER_ERROR', detail: `answered by ${message.model}, not ${want}` };
    else outcome = valid
      ? { result: 'OK', model: message.model, verdict: parsed.value.verdict, stop: message.stop_reason, costUsd }
      : { result: 'STRUCTURED_OUTPUT_LOST', model: message.model, stop: message.stop_reason, detail: parsed.error ?? 'reply did not match the schema', text: (message.content ?? []).find((b) => b.type === 'text')?.text?.slice(0, 300), costUsd };
  } catch (error) {
    const status = error.status ?? null;
    const body = JSON.stringify(error.error ?? error.message ?? '').slice(0, 400);
    // Under CMEK the API may reject the json_schema format outright rather than
    // drop it; either way structured outputs are lost. Checked first, since such
    // a message names the format, not retention.
    const structured = status === 400 && /structured|output_config|json_schema|output format|\bformat\b|strict|CMEK|encryption key/i.test(body);
    // ZDR (or retention under 30 days): "...must have data retention enabled."
    const zdr = status === 400 && /retention|zero.data|\bZDR\b/i.test(body);
    // An organization spend or usage limit: "You have reached your specified API usage limits."
    const limit = status === 429 && /usage limit|spend limit|spending limit|credit|billing|regain access/i.test(body);
    outcome = { result: structured ? 'STRUCTURED_OUTPUT_LOST' : zdr ? 'ZDR_BLOCKED' : limit ? 'SPEND_LIMIT' : 'OTHER_ERROR', model: want, status, detail: body };
  }
  return outcome;
}

// The judge first, then each other model the harness calls through the API:
// the second judge, the fixture writer, and the reviewer (each once).
const outcomes = [await probe(request)];
const others = [
  ...(secondJudgeEnabled() ? [secondJudgeRequest(request)] : []),
  { ...request, model: GEN_MODEL, output_config: { ...request.output_config, effort: FIXTURE_EFFORT } },
  { ...request, model: REVIEW_MODEL, output_config: { ...request.output_config, effort: FIXTURE_EFFORT } },
].filter((r, i, all) => r.model !== request.model && all.findIndex((x) => x.model === r.model) === i);
for (const r of others) {
  if (outcomes.at(-1).result === 'SPEND_LIMIT') break;
  outcomes.push(await probe(r));
}
console.log(JSON.stringify(outcomes, null, 2));
process.exit(outcomes.every((o) => o.result === 'OK') ? 0 : 1);
