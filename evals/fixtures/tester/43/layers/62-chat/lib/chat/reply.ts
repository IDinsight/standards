import { streamReply } from '../llm/client.ts';
import type { StopReason } from '../llm/client.ts';
import { buildMessages } from './prompt.ts';
import type { ChatTurn } from './prompt.ts';

export const SAFE_MESSAGE =
  "Sorry, I can't help with that. Try asking another way, or contact support@helpdesk.example.";

export type ChatEvent =
  | { type: 'delta'; text: string }
  | { type: 'replace'; text: string }
  | { type: 'end'; reason: StopReason }
  | { type: 'error'; message: string };

// Converts provider reply events into the events the chat panel renders.
export async function* chatEvents(history: ChatTurn[], signal?: AbortSignal): AsyncGenerator<ChatEvent> {
  try {
    for await (const event of streamReply(buildMessages(history), { signal })) {
      if (event.type === 'text') {
        yield { type: 'delta', text: event.text };
        continue;
      }
      if (event.reason === 'filtered') yield { type: 'replace', text: SAFE_MESSAGE };
      yield { type: 'end', reason: event.reason };
      return;
    }
    yield { type: 'error', message: 'The reply was interrupted. Please try again.' };
  } catch {
    if (signal?.aborted) return;
    yield { type: 'error', message: 'The assistant is unavailable right now. Please try again later.' };
  }
}

// Encodes chat events as newline-delimited JSON for a streamed response body.
export function encodeChatEvents(events: AsyncIterable<ChatEvent>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const iterator = events[Symbol.asyncIterator]();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
    },
    async cancel() {
      await iterator.return?.(undefined);
    },
  });
}
