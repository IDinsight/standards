// LLM judge for assertions that deterministic checks cannot fully decide.
// judgeRequest() only builds the request; sendJudge() refuses to call the API
// unless EVAL_ALLOW_MODEL=1 is set (cli.mjs sets it for --execute).
//
// Design:
//   - one call per assertion, so each verdict is atomic;
//   - the evidence bundle comes first and is cached, the assertion comes last,
//     so the per-assertion calls for one run reuse the same cached prefix;
//   - structured output makes the verdict parse deterministic;
//   - the judge model differs from the model under test (self-preference);
//   - no server-side `fallbacks`: a fallback would silently swap the judge
//     model mid-suite, so a refusal is recorded as a grader ERROR instead.
// Defaults (lib/config.mjs): Claude Opus 5.5 at high effort judges, and Claude
// Fable 5.1 at medium effort is the second judge in judge-checks.mjs. Org
// checks for Fable 5.1: it needs 30-day retention (not zero data retention),
// and Fable models lose structured outputs in a CMEK organization
// (judge-preflight.mjs checks both with one call).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createMessage, parseStructured } from './lib/anthropic.mjs';
import { JUDGE_EFFORT, JUDGE_MODEL, SECOND_JUDGE_EFFORT, SECOND_JUDGE_MODEL } from './lib/config.mjs';

export { JUDGE_MODEL, SECOND_JUDGE_MODEL };
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SYSTEM = readFileSync(path.join(HERE, 'judge-prompt.md'), 'utf8');

export const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['verdict', 'evidence', 'rationale'],
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'FAIL', 'UNCLEAR'] },
    evidence: { type: 'array', items: { type: 'string' }, description: 'Exact quotes with their source, e.g. "reply: ...", "STATE.md after: ...", "event 12: Read ..."' },
    rationale: { type: 'string', description: 'At most 80 words.' },
  },
};

// Text of changed files after the run (framework files never change, so this
// stays small). Nothing is truncated: a large diff is reported, not cut.
function changedFiles(c) {
  const parts = [];
  for (const f of [...c.diff.added, ...c.diff.changed]) parts.push(`--- ${f} (${c.diff.added.includes(f) ? 'added' : 'changed'})\n${c.read(f) ?? '(binary or unreadable)'}`);
  for (const f of c.diff.removed) parts.push(`--- ${f} (deleted)`);
  return parts.join('\n\n') || '(no files changed)';
}

// Tool outputs and hook events longer than OUTPUT_LIMIT characters (long test
// logs, large file reads, long hook messages) keep their start and end with an
// explicit marker saying how much was cut. Agent text and tool inputs are never cut.
const OUTPUT_LIMIT = 20000;
function clip(text) {
  if (text.length <= OUTPUT_LIMIT) return text;
  const half = OUTPUT_LIMIT / 2;
  return `${text.slice(0, half)}\n[... ${text.length - OUTPUT_LIMIT} characters cut by the harness ...]\n${text.slice(-half)}`;
}
// One chronological record of the run: the agent's text, each tool call with
// its input and output, and stop-hook events, in the order they happened.
// Subagent entries are labeled: the user never saw a subagent's text.
function timeline(c) {
  const entries = [
    ...c.trace.texts.map((t) => ({ seq: t.seq, text: `[${t.subagent ? 'subagent text (not shown to the user)' : 'agent text'}]\n${t.text}` })),
    ...c.trace.hooks.map((h) => ({ seq: h.seq, text: `[hook event]\n${clip(JSON.stringify(h))}` })),
    ...c.trace.events.map((e) => {
      const input = e.tool === 'Bash' ? e.command : JSON.stringify(e.input);
      const output = e.output === undefined ? '(no output recorded)' : clip(e.output);
      return { seq: e.seq, text: `[${e.subagent ? 'subagent ' : ''}tool call ${e.i}] ${e.tool}${e.isError ? ' (error)' : ''}: ${input}\n--- output ---\n${output}` };
    }),
  ].sort((a, b) => a.seq - b.seq);
  return entries.map((x) => x.text).join('\n\n') || '(nothing recorded)';
}

// The evidence of one run, as named parts. Stored once per run
// (judge-evidence.json) so the judge checks can rebuild a request with some
// parts replaced (known wrong answers) without re-grading the run.
export function evidenceParts({ kase, spec, c }) {
  return {
    scenario: kase.prompt,
    authorSummary: kase.expected,
    groundTruth: (spec.graderOnly ?? []).map((f) => `- ${f}`).join('\n'),
    // History cases: the earlier turns the run resumed, as the role saw them.
    priorTurns: (spec.history?.turns ?? []).map((t) => `[${t.role}]\n${t.text}`).join('\n\n'),
    userMessage: `/${spec.prompt.skill} ${spec.prompt.utterance}`,
    stateBefore: c.before.stateText ?? JSON.stringify(c.before.state, null, 2),
    stateAfter: c.after.stateText ?? JSON.stringify(c.after.state, null, 2),
    changedFiles: changedFiles(c),
    timeline: timeline(c),
    finalReply: c.trace.reply || '(empty)',
  };
}

export function evidenceText(p) {
  return [
    '<scenario>', p.scenario, '</scenario>',
    '<author_summary note="context only; grade the single assertion below">', p.authorSummary, '</author_summary>',
    '<ground_truth note="facts about the fixture the agent was not told">', p.groundTruth, '</ground_truth>',
    ...(p.priorTurns ? ['<prior_conversation note="earlier turns of the same conversation, seeded into the session the agent resumed">', p.priorTurns, '</prior_conversation>'] : []),
    '<user_message_sent_to_agent>', p.userMessage, '</user_message_sent_to_agent>',
    '<state_before>', p.stateBefore, '</state_before>',
    '<state_after>', p.stateAfter, '</state_after>',
    '<changed_files>', p.changedFiles, '</changed_files>',
    '<run_timeline note="agent text, tool calls with full inputs and outputs, and hook events, in order; subagent entries are labeled; tool outputs and hook events over 20,000 characters are cut with a marker; agent text and tool inputs are never cut">', p.timeline, '</run_timeline>',
    '<final_reply note="the last message only; the timeline has everything the agent wrote">', p.finalReply, '</final_reply>',
  ].join('\n');
}

// Only exact checks exist, and a failed one already decided the assertion,
// so every check listed passed.
export const checksText = (checks = []) => checks.map((r) => `- PASS ${r.predicate}: ${r.evidence}`).join('\n') || '- none';

export function buildJudgeRequest(parts, assertionText, checks = []) {
  return {
    model: JUDGE_MODEL,
    // Opus 5.5 and Fable 5.1 always think, and thinking counts toward
    // max_tokens; a verdict cut off by the limit is a grader error.
    max_tokens: 32000,
    system: SYSTEM,
    output_config: { effort: JUDGE_EFFORT, format: { type: 'json_schema', schema: VERDICT_SCHEMA } },
    messages: [{
      role: 'user',
      content: [
        // Cached prefix shared by every assertion of this run.
        { type: 'text', text: `<evidence>\n${evidenceText(parts)}\n</evidence>`, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: `<deterministic_checks note="already verified by code; necessary conditions only">\n${checksText(checks)}\n</deterministic_checks>\n\n<assertion>${assertionText}</assertion>` },
      ],
    }],
  };
}

export const judgeRequest = ({ kase, spec, c, assertion }) => buildJudgeRequest(evidenceParts({ kase, spec, c }), assertion.text, assertion.checks);

// The second judge (judge-checks.mjs): the same evidence and assertion,
// graded by a different model (EVAL_SECOND_JUDGE_MODEL; "none" skips it).
export const secondJudgeEnabled = () => SECOND_JUDGE_MODEL !== 'none';
export function secondJudgeRequest(request) {
  return { ...request, model: SECOND_JUDGE_MODEL, max_tokens: 32000, output_config: { ...request.output_config, effort: SECOND_JUDGE_EFFORT } };
}

// A judge response (sync or batch) as a verdict record. A refusal, a verdict
// cut off by the token limit, or unparseable output is a grader ERROR, not a
// model failure: it is reported separately and kept out of pass rates.
export function verdictFromMessage(message, costUsd = null) {
  const base = { usage: message.usage, model: message.model, costUsd };
  const parsed = parseStructured(message);
  if (parsed.error === 'refusal') return { ...base, verdict: 'ERROR', evidence: [], rationale: 'judge refused' };
  if (parsed.error === 'max_tokens') return { ...base, verdict: 'ERROR', evidence: [], rationale: 'judge ran out of tokens' };
  if (parsed.error) return { ...base, verdict: 'ERROR', evidence: [], rationale: parsed.error };
  return normalizeVerdict({ ...parsed.value, ...base });
}

// Anything but PASS, FAIL, UNCLEAR, or ERROR becomes ERROR.
export function normalizeVerdict(result) {
  if (!['PASS', 'FAIL', 'UNCLEAR', 'ERROR'].includes(result?.verdict)) {
    return { ...result, verdict: 'ERROR', evidence: [], rationale: `unparseable judge verdict ${JSON.stringify(result?.verdict)}` };
  }
  return result;
}

export async function sendJudge(request, { purpose = 'judge', ref } = {}) {
  try {
    const { message, costUsd } = await createMessage(request, { purpose, ref });
    return verdictFromMessage(message, costUsd);
  } catch (error) {
    if (/Model calls are disabled/.test(error.message)) throw error;
    return { verdict: 'ERROR', evidence: [], rationale: `judge call failed: ${error.message}`, model: request.model };
  }
}

// Merge one judge result into an assertion of verdicts.json. A deterministic
// result is never overwritten.
export function mergeJudge(assertion, result, request) {
  if (assertion.verdict !== 'NEEDS_JUDGE' && !assertion.judge) return false;
  const r = normalizeVerdict(result);
  // Every judge call's cost counts, including a retried grader error's.
  assertion.judgeCostUsd = (assertion.judgeCostUsd ?? assertion.judge?.costUsd ?? 0) + (r.costUsd ?? 0);
  assertion.verdict = r.verdict;
  assertion.judge = { model: r.model ?? request?.model, ...r };
  return true;
}
