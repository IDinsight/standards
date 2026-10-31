import { readServerSentEvents } from './sse.ts';

export type ProviderMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type StopReason = 'complete' | 'truncated' | 'filtered';

export type ReplyEvent =
  | { type: 'text'; text: string }
  | { type: 'stop'; reason: StopReason };

export class ProviderError extends Error {
  status: number;

  constructor(status: number) {
    super(`LLM provider responded with status ${status}`);
    this.name = 'ProviderError';
    this.status = status;
  }
}

const COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

const STOP_REASONS: Record<string, StopReason> = {
  stop: 'complete',
  length: 'truncated',
  content_filter: 'filtered',
};

type CompletionChunk = {
  choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[];
};

// Streams a chat completion: one text event per content delta, then one stop event.
export async function* streamReply(
  messages: ProviderMessage[],
  options: { signal?: AbortSignal } = {},
): AsyncGenerator<ReplyEvent> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const response = await fetch(COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      messages,
      stream: true,
    }),
    signal: options.signal,
  });
  if (!response.ok || !response.body) throw new ProviderError(response.status);

  for await (const data of readServerSentEvents(response.body)) {
    if (data === '[DONE]') return;
    const chunk = JSON.parse(data) as CompletionChunk;
    const choice = chunk.choices?.[0];
    if (!choice) continue;
    if (choice.delta?.content) yield { type: 'text', text: choice.delta.content };
    if (choice.finish_reason) {
      yield { type: 'stop', reason: STOP_REASONS[choice.finish_reason] ?? 'complete' };
    }
  }
}
