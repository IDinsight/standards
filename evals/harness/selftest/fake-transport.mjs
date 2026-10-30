// A fake Claude API for the self-test: never touches the network. Loaded by
// lib/anthropic.mjs when EVAL_FAKE_TRANSPORT points here. It answers by the
// request's structured-output schema:
//   generator  -> the next file from $EVAL_FAKE_DIR/gen-<n>.json (n counts calls)
//   reviewer   -> $EVAL_FAKE_DIR/review-<target>.json, or a pass
//   judge      -> FAIL when the evidence shows an empty run, a confident reply
//                 to the wrong question, or another role's run; PASS otherwise
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { SECOND_JUDGE_MODEL } from '../lib/config.mjs';

const DIR = process.env.EVAL_FAKE_DIR;
const counter = (name) => {
  const f = path.join(DIR, `${name}.count`);
  const n = (existsSync(f) ? Number(readFileSync(f, 'utf8')) : 0) + 1;
  writeFileSync(f, String(n));
  return n;
};
const msg = (model, value) => ({
  model, type: 'message', role: 'assistant', stop_reason: 'end_turn',
  content: [{ type: 'thinking', thinking: '', signature: 'x' }, { type: 'text', text: JSON.stringify(value) }],
  usage: { input_tokens: 1000, output_tokens: 500, cache_read_input_tokens: 20000, cache_creation_input_tokens: 0 },
});

function answer(params) {
  const props = params.output_config?.format?.schema?.properties ?? {};
  const text = JSON.stringify(params.messages);
  if (props.spec_json) {
    const n = counter('gen');
    const v = JSON.parse(readFileSync(path.join(DIR, `gen-${n}.json`), 'utf8'));
    // {"__throw": "..."}: the call fails (after retries); with __partial, mid-stream (billed, usage so far).
    if (v.__throw) {
      const e = new Error(v.__throw); e.status = 529;
      if (v.__partial) e.partialMessage = { model: params.model, usage: { input_tokens: 90000, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } };
      throw e;
    }
    return msg(params.model, v);
  }
  if (props.conditions) {
    const target = (text.match(/<case key=\\"([\w-]+)\\"/) ?? text.match(/<base name=\\"([\w-]+)\\"/) ?? [])[1];
    const f = path.join(DIR, `review-${target}.json`);
    return msg(params.model, existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : { conditions: [], issues: [], verdict: 'pass', summary: 'fine' });
  }
  if (props.verdict) {
    // PASS only when the timeline shows the simulated run of the role the
    // message invoked; an empty run, a wrong-question reply, or another
    // role's run FAILs.
    const skill = (text.match(/<user_message_sent_to_agent>\\n\/(\w+)/) ?? [])[1];
    const marker = { developer: 'init DEVELOPMENT', navigator: 'fetchlite', reviewer: 'init REVIEW' }[skill];
    const timeline = text.slice(text.indexOf('<run_timeline'), text.indexOf('</run_timeline>'));
    // EVAL_FAKE_JUDGE=pass: a judge that passes everything (known negatives must catch it).
    // EVAL_FAKE_JUDGE=refuse-second: the second judge refuses every request (grader errors).
    if (process.env.EVAL_FAKE_JUDGE === 'refuse-second' && params.model === SECOND_JUDGE_MODEL) return { ...msg(params.model, {}), stop_reason: 'refusal', content: [] };
    const pass = process.env.EVAL_FAKE_JUDGE === 'pass' || (marker && timeline.includes(marker));
    return msg(params.model, { verdict: pass ? 'PASS' : 'FAIL', evidence: ['final_reply: ...'], rationale: 'fake' });
  }
  throw new Error('fake transport: unknown request');
}

const batches = new Map();
export default {
  createMessage: async (params) => answer(params),
  batches: {
    create: async (requests) => { const id = `msgbatch_fake_${batches.size + 1}`; batches.set(id, requests); return { id, processing_status: 'in_progress' }; },
    retrieve: async (id) => ({ id, processing_status: 'ended', request_counts: { succeeded: batches.get(id).length, errored: 0 } }),
    results: async (id) => (async function* gen() {
      for (const r of batches.get(id)) yield { custom_id: r.custom_id, result: { type: 'succeeded', message: answer(r.params) } };
    }()),
  },
};
