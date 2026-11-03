<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: invoice-extraction-20260924T090000Z-3a8f0d5e
-->

# Technical Design

## Context

The scope asks for invoice extraction from streamed `record_invoice` tool calls
with three outcomes (stored, retryable, nothing stored for unusable input). The
project already has `GatewayClient.stream_message`, which yields each streamed
event's data as a dict in the Anthropic Messages streaming format, and
`InvoiceStore.save_invoice`. The gateway is not reachable from development
environments. No project references apply.

## Decision

Add one module, `app/extract/stream.py`, with a function that consumes the
event stream in order and decides the outcome only when the stream finishes.
The client and the store are parameters, not module globals, so the function
works with any objects that honour their contracts. Nothing is saved until a
`message_stop` event arrives with usable tool input, which keeps every failure
path free of writes.

## Acceptance Coverage

- `AC-001`: At `message_stop`, with a stop reason other than `max_tokens`, the
  joined tool input is parsed with `json.loads`, saved once with
  `store.save_invoice(document_id, record)`, and returned as
  `ExtractResult("stored", record)`.
- `AC-002`: An `error` event returns `ExtractResult("retryable", None)` at
  once; a stream that is exhausted without `message_stop` returns
  `ExtractResult("retryable", None)`. The store is not called on either path.
- `AC-003`: A `max_tokens` stop reason at `message_stop` returns
  `ExtractResult("invalid", None)`; a `json.JSONDecodeError` while parsing the
  joined tool input returns `ExtractResult("invalid", None)`. The store is not
  called on either path.

## Components

- `app/extract/stream.py` — the `record_invoice` tool definition, the prompt,
  `ExtractResult`, and `extract_invoice`.

## Interfaces and Contracts

- `extract_invoice(document_id: str, text: str, *, client, store) ->
  ExtractResult`.
- `client`: any object with `stream_message(*, messages, tools, max_tokens)`
  returning an iterable of event dicts, as `GatewayClient` does. `max_tokens`
  comes from `settings.extract_max_tokens`.
- `store`: any object with `save_invoice(document_id, record)`, as
  `InvoiceStore` does.
- `ExtractResult`: frozen dataclass with `status` (`"stored"`, `"retryable"`,
  or `"invalid"`) and `record` (the parsed dict when stored, otherwise `None`).
- Tool: `record_invoice` with an object input schema (`invoice_number`,
  `vendor`, `issue_date`, `currency`, `total`; the first, second, and last
  required).

## Data and Control Flow

1. Build one user message from the prompt and the document text; call
   `client.stream_message` with the `record_invoice` tool.
2. `content_block_start` with a `tool_use` block named `record_invoice`
   remembers that block's index.
3. `content_block_delta` events for that index whose delta type is
   `input_json_delta` append `partial_json` to a list of pieces, in order.
4. `message_delta` records `delta.stop_reason`.
5. `error` ends the extraction as retryable.
6. `message_stop` decides: `max_tokens` gives invalid; otherwise the joined
   pieces are parsed, an unparseable input gives invalid, and a parsed record
   is saved and returned as stored.
7. If the iteration ends without `message_stop`, the result is retryable.

Other event types (`message_start`, `content_block_stop`, text deltas, ping)
are ignored.

## Technical Acceptance Criteria

- `AC-001`: `save_invoice` is called exactly once, with the caller's document ID
  and the parsed tool input, and only after `message_stop`.
- `AC-002`: `save_invoice` is never called after an `error` event or when the
  stream ends without `message_stop`; the status is `"retryable"`.
- `AC-003`: `save_invoice` is never called when the stop reason is
  `max_tokens` or the joined input is not valid JSON; the status is
  `"invalid"`.

## Build Plan

1. CREATE `app/extract/stream.py` with the tool definition, `ExtractResult`,
   and `extract_invoice` as above.

## Risks and Follow-up

- Exceptions raised by the client itself (connection or HTTP errors) propagate
  to the caller unchanged; handling them is outside this scope.
- Field-level validation of the parsed record is a non-goal; any valid JSON
  input is saved as given.

## Alternatives

- A non-streaming request: rejected because the gateway client in this project
  only streams, and the scope is defined in terms of stream outcomes.
