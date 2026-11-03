// A fake Claude API for the reference evals' self-test (selftest/references.mjs):
// never touches the network. A judge item or assertion holding [[TOKEN]]
// PASSes when the request's evidence holds TOKEN, and FAILs otherwise.
// EVAL_FAKE_SECOND=flip: the second judge gives the opposite verdict. Each
// call is appended to $EVAL_FAKE_DIR/calls.jsonl with its model, token, and
// evidence text.
import { appendFileSync } from 'node:fs';
import path from 'node:path';

import { SECOND_JUDGE_MODEL } from '../lib/config.mjs';

function answer(params) {
  const blocks = params.messages[0].content;
  const evidence = blocks[0].text;
  const token = (blocks.at(-1).text.match(/\[\[(\w+)\]\]/) ?? [])[1] ?? null;
  appendFileSync(path.join(process.env.EVAL_FAKE_DIR, 'calls.jsonl'), `${JSON.stringify({ model: params.model, token, evidence })}\n`);
  let pass = token !== null && evidence.includes(token);
  if (params.model === SECOND_JUDGE_MODEL && process.env.EVAL_FAKE_SECOND === 'flip') pass = !pass;
  return {
    model: params.model, type: 'message', role: 'assistant', stop_reason: 'end_turn',
    content: [{ type: 'text', text: JSON.stringify({ verdict: pass ? 'PASS' : 'FAIL', evidence: [], rationale: 'fake' }) }],
    usage: { input_tokens: 100, output_tokens: 50, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
  };
}

export default { createMessage: async (params) => answer(params) };
