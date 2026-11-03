<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-assistant-chat-to-the-help-center-20260923T101500Z-3c9e71ab
-->

# Technical Design

## Context

The help center is a Next.js App Router app with framework-free logic in `lib/`
and web-standard route handlers in `app/api/` (see `.standards/CONTEXT.md`). The
team's provider account is with OpenAI; the key is read from `OPENAI_API_KEY` on
the server and never reaches the browser. No project references apply.

## Decision

- `lib/llm/client.ts` is the only module that talks to the provider. It calls
  the Chat Completions API with `stream: true` using `fetch`, parses the
  server-sent events with `lib/llm/sse.ts`, and exposes
  `streamReply(messages, { signal })`, an async iterable of reply events. No SDK
  is added.
- `lib/chat/reply.ts` turns reply events into chat events for the browser and
  owns the fixed safe message (`SAFE_MESSAGE`). `lib/chat/prompt.ts` builds the
  system prompt from the article titles and summaries and keeps the last 12
  turns.
- `app/api/chat/route.ts` (Node.js runtime) validates the posted conversation
  and returns the chat events as newline-delimited JSON. The browser reads that
  body incrementally in `components/chat/chat-panel.tsx` on the new `/chat`
  page.
- No retries in this cycle: a provider error, or a stream that ends without a
  finish reason, becomes an `error` event.

## Acceptance Coverage

- `AC-001`: `streamReply` text events become `delta` lines as they arrive; the
  body ends with exactly one `end` line and then closes. The panel appends
  deltas and re-enables input on `end`.
- `AC-002`: A `filtered` stop becomes a `replace` line carrying `SAFE_MESSAGE`,
  then `end` with reason `filtered`; the panel replaces any partial text with
  it.
- `AC-003`: Reply quality depends on the configured model (`OPENAI_MODEL`,
  default `gpt-4o-mini`) and the system prompt in `lib/chat/prompt.ts`. No
  further technical design applies.

## Interfaces and Contracts

- Reply events (`lib/llm/client.ts`): `{ type: 'text', text }` for each content
  delta, then one `{ type: 'stop', reason }`. Chat Completions `finish_reason`
  maps `stop` to `complete`, `length` to `truncated`, and `content_filter` to
  `filtered`. A missing key throws before any request; a non-2xx response
  throws `ProviderError`.
- Chat events (`lib/chat/reply.ts`), one JSON object per line:
  `{ type: 'delta', text }`, `{ type: 'replace', text }`,
  `{ type: 'end', reason }` with reason `complete`, `truncated`, or `filtered`,
  and `{ type: 'error', message }`.
- `POST /api/chat` takes `{ messages }`, a list of user and assistant turns
  ending with a user turn, each with 1 to 2000 characters of content; anything
  else gets 400 with `{ error }`. Success responds 200 with content type
  `application/x-ndjson`.

## Technical Acceptance Criteria

- `AC-001`: Every successful reply body is zero or more `delta` lines followed
  by exactly one terminal `end` or `error` line, after which the body closes.
- `AC-002`: For a `filtered` stop, the body contains a `replace` line whose text
  equals `SAFE_MESSAGE`, followed by `end` with reason `filtered`.

## Build Plan

1. CREATE `lib/llm/sse.ts` and `lib/llm/client.ts`.
2. CREATE `lib/chat/prompt.ts` and `lib/chat/reply.ts`.
3. CREATE `app/api/chat/route.ts`, `components/chat/chat-panel.tsx`, and
   `app/chat/page.tsx`; MODIFY `app/layout.tsx` to link to `/chat`; MODIFY
   `.env.example` to list `OPENAI_API_KEY` and `OPENAI_MODEL`.

## Risks and Follow-up

- Provider rate limits and outages surface as an `error` event; retries and
  backoff are later work.
