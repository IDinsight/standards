// Claude API access for the harness: the fixture generator, the fixture
// review (gate 3), the judge, the second judge, and the Batch judge path.
//
// - Every call refuses unless EVAL_ALLOW_MODEL=1, which cli.mjs sets only for
//   a command given --execute.
// - The key comes from the root .env or the shell (lib/config.mjs); nothing
//   here prints it.
// - Calls go through the official SDK (@anthropic-ai/sdk, a dependency of
//   evals/package.json). Tests swap in a fake transport with setTransport(),
//   so the harness is testable with no SDK and no network.
// - Every call's usage and cost is appended to evals/spend.jsonl, so spend
//   is measured, not estimated.
// - No server-side `fallbacks`: a fallback would silently swap the model
//   partway through a suite (and the Batch API rejects the parameter). A
//   refusal is returned as such and the caller records a grader ERROR.
import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

import { EVALS_ROOT } from './cases.mjs';
import { PRICES } from './config.mjs';
import { readApiKey } from './credentials.mjs';

export const SPEND_LOG = process.env.EVAL_SPEND_LOG ?? path.join(EVALS_ROOT, 'spend.jsonl');

export function costOf(model, usage = {}, { batch = false } = {}) {
  const p = PRICES[model];
  if (!p) return null; // unknown model: reported as unknown, never guessed
  const cc = usage.cache_creation ?? {};
  // Split cache writes by TTL when the API reports it; otherwise assume 5 minutes.
  const w1h = cc.ephemeral_1h_input_tokens ?? 0;
  const w5 = cc.ephemeral_5m_input_tokens ?? Math.max(0, (usage.cache_creation_input_tokens ?? 0) - w1h);
  const usd = ((usage.input_tokens ?? 0) * p.in + w5 * p.in * 1.25 + w1h * p.in * 2
    + (usage.cache_read_input_tokens ?? 0) * p.read + (usage.output_tokens ?? 0) * p.out) / 1e6;
  return batch ? usd / 2 : usd;
}

export function assertModelAllowed() {
  if (process.env.EVAL_ALLOW_MODEL !== '1') throw new Error('Model calls are disabled: run the command through `pnpm eval ... --execute` (or set EVAL_ALLOW_MODEL=1).');
}

// The transport: the SDK by default, a fake in tests.
let transport = null;
export function setTransport(fake) { transport = fake; }

async function sdkTransport() {
  // Loaded lazily so the rest of the harness runs without the SDK installed.
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  // maxRetries covers 429/5xx and connection errors with backoff.
  const client = new Anthropic({ apiKey: readApiKey(), maxRetries: 4 });
  return {
    // Streaming for every call: generator outputs are long, and streaming
    // avoids HTTP timeouts at any max_tokens.
    // A stream that breaks after tokens were generated is billed: the error
    // carries the partial message (its usage so far) for the spend log.
    createMessage: async (params) => {
      const stream = client.messages.stream(params);
      try { return await stream.finalMessage(); } catch (error) { error.partialMessage = stream.currentMessage ?? null; throw error; }
    },
    batches: {
      create: (requests) => client.messages.batches.create({ requests }),
      retrieve: (id) => client.messages.batches.retrieve(id),
      results: (id) => client.messages.batches.results(id),
    },
  };
}

// A fake transport (tests only) never reaches the network, so it needs no
// sign-off: setTransport() in-process, or EVAL_FAKE_TRANSPORT=<module> for a
// child process (the module's default export is the transport).
async function getTransport() {
  if (transport) return transport;
  if (process.env.EVAL_FAKE_TRANSPORT) {
    transport = (await import(process.env.EVAL_FAKE_TRANSPORT)).default;
    return transport;
  }
  assertModelAllowed();
  transport = await sdkTransport();
  return transport;
}

export function logSpend(entry) {
  mkdirSync(path.dirname(SPEND_LOG), { recursive: true });
  appendFileSync(SPEND_LOG, `${JSON.stringify({ ts: new Date().toISOString(), ...entry })}\n`);
}

// One Messages API call. Returns the final message plus its cost; the caller
// decides what a refusal or a max_tokens stop means for its purpose.
export async function createMessage(params, { purpose, ref } = {}) {
  const t = await getTransport();
  const started = Date.now();
  let message;
  try {
    message = await t.createMessage(params);
  } catch (error) {
    // Logged as unknown cost (spend.mjs counts it apart): output tokens are
    // reported only at the end of a stream, so a broken one's cost is not known.
    if (error.partialMessage) logSpend({ purpose, ref, model: error.partialMessage.model ?? params.model, usage: error.partialMessage.usage, costUsd: null, partial: true, error: String(error.message).slice(0, 200), ms: Date.now() - started });
    throw error;
  }
  const costUsd = costOf(message.model ?? params.model, message.usage);
  logSpend({ purpose, ref, model: message.model ?? params.model, usage: message.usage, costUsd, ms: Date.now() - started, stop: message.stop_reason });
  return { message, costUsd, ms: Date.now() - started };
}

// Text of the first text block, parsed as JSON (structured outputs), or a
// typed failure: refusal, max_tokens, or unparseable.
export function parseStructured(message) {
  if (message.stop_reason === 'refusal') return { error: 'refusal', detail: message.stop_details ?? null };
  if (message.stop_reason === 'max_tokens') return { error: 'max_tokens' };
  const text = (message.content ?? []).find((b) => b.type === 'text')?.text;
  if (!text) return { error: 'no text block' };
  try { return { value: JSON.parse(text) }; } catch (e) { return { error: `unparseable JSON: ${e.message}` }; }
}

// Message Batches: submit, poll, read results (keyed by custom_id; results
// arrive in any order).
export async function submitBatch(requests, { purpose } = {}) {
  const t = await getTransport();
  const batch = await t.batches.create(requests);
  logSpend({ purpose, batchId: batch.id, submitted: requests.length, costUsd: 0 });
  return batch;
}

export async function pollBatch(id, { everyMs = 60_000, onTick } = {}) {
  const t = await getTransport();
  for (;;) {
    const b = await t.batches.retrieve(id);
    onTick?.(b);
    if (b.processing_status === 'ended') return b;
    await new Promise((r) => setTimeout(r, everyMs));
  }
}

export async function batchResults(id, { purpose } = {}) {
  const t = await getTransport();
  const out = new Map();
  for await (const r of await t.batches.results(id)) {
    const res = r.result;
    let costUsd = null;
    if (res.type === 'succeeded') {
      costUsd = costOf(res.message.model, res.message.usage, { batch: true });
      logSpend({ purpose, ref: r.custom_id, batchId: id, model: res.message.model, usage: res.message.usage, costUsd, batch: true, stop: res.message.stop_reason });
    }
    out.set(r.custom_id, { ...res, costUsd });
  }
  return out;
}

// A custom_id for the Batch API: 1-64 characters of [A-Za-z0-9_-].
export const batchId = (...parts) => parts.join('__').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 64);
