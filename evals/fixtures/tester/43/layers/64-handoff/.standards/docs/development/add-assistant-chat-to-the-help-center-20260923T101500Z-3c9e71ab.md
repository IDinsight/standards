<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-assistant-chat-to-the-help-center-20260923T101500Z-3c9e71ab
-->

# Development Plan

`Cycle`: `add-assistant-chat-to-the-help-center-20260923T101500Z-3c9e71ab`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/add-assistant-chat-to-the-help-center-20260923T101500Z-3c9e71ab.md`
- `Architecture`:
  `.standards/docs/specs/add-assistant-chat-to-the-help-center-20260923T101500Z-3c9e71ab.md`
- `Request`:
  `Add assistant chat to the help center, streaming replies from the LLM provider.`

## Build Steps

### DEV-001 — Provider client streams reply events

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Read a streamed Chat Completions response and expose it as reply events.

**Affected Area**

`lib/llm/sse.ts`, `lib/llm/client.ts`.

**Expected Outcome**

`streamReply(messages, { signal })` yields one `text` event per content delta
and one `stop` event mapped from `finish_reason` (`stop`, `length`, and
`content_filter` to `complete`, `truncated`, and `filtered`). A missing key
throws before any request; a non-2xx response throws `ProviderError` with the
status.

**Self-Check**

Repository root, revision `${COMMIT:Add streaming assistant chat}`. Fed a
hand-written SSE body (three events split mid-event across two chunks, ending
with `[DONE]`) through `readServerSentEvents` in a `node --input-type=module -e`
script; it printed the three data payloads in order. Ran `npm test`, exit 0, 7
passed (existing suites; no chat tests yet).

### DEV-002 — Chat events and safe message

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Turn reply events into the chat events the browser renders, with the fixed
safe message for filtered replies, and build the system prompt.

**Affected Area**

`lib/chat/reply.ts`, `lib/chat/prompt.ts`.

**Expected Outcome**

`chatEvents` yields `delta` events, then exactly one `end` (preceded by
`replace` with `SAFE_MESSAGE` when filtered) or one `error`.
`encodeChatEvents` writes one JSON object per line and closes the stream after
the last event. The system prompt lists the help articles.

**Self-Check**

Same revision. Ran `npm test`, exit 0, 7 passed. Inspected `chatEvents` for each
stop reason, a stream that ends without a stop, and a thrown provider error.

### DEV-003 — Chat route, panel, and navigation

`Status`: `DONE` `Depends On`: `DEV-002` `Acceptance`: `AC-001, AC-002`

**Goal**

Serve chat events from `POST /api/chat` and render them on a new `/chat` page.

**Affected Area**

`app/api/chat/route.ts`, `components/chat/chat-panel.tsx`,
`app/chat/page.tsx`, `app/layout.tsx`, `app/globals.css`, `.env.example`.

**Expected Outcome**

Invalid conversations get 400. Valid ones stream newline-delimited chat events;
the panel appends deltas, replaces partial text on `replace`, shows a note for
truncated replies, and re-enables input when the reply ends.

**Self-Check**

Same revision, on the developer workstation with dependencies installed: ran
`npm run dev` with `OPENAI_API_KEY` from the local `.env` and asked two
questions at `/chat`. Both replies streamed in and the input re-enabled when
each finished. A POST with an empty `messages` list returned 400. The
content-filter path was not reproduced against the provider; the `replace`
handling in the panel was inspected.

## Plan Notes

- Project references loaded: `NONE`.
