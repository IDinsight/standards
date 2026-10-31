import { chatEvents, encodeChatEvents } from '../../../lib/chat/reply.ts';
import type { ChatTurn } from '../../../lib/chat/prompt.ts';

export const runtime = 'nodejs';

const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request: Request): Promise<Response> {
  let history: ChatTurn[] | null;
  try {
    history = parseHistory(await request.json());
  } catch {
    history = null;
  }
  if (!history) return Response.json({ error: 'Invalid chat request.' }, { status: 400 });

  return new Response(encodeChatEvents(chatEvents(history, request.signal)), {
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/x-ndjson; charset=utf-8',
    },
  });
}

function parseHistory(body: unknown): ChatTurn[] | null {
  const messages = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const turns: ChatTurn[] = [];
  for (const message of messages) {
    const { role, content } = (message ?? {}) as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    if (content.trim() === '' || content.length > MAX_MESSAGE_LENGTH) return null;
    turns.push({ role, content });
  }
  return turns.at(-1)?.role === 'user' ? turns : null;
}
