<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: invoice-extraction-20260924T090000Z-3a8f0d5e
-->

# Development Plan

`Cycle`: `invoice-extraction-20260924T090000Z-3a8f0d5e` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/invoice-extraction-20260924T090000Z-3a8f0d5e.md`
- `Architecture`: `.standards/docs/specs/invoice-extraction-20260924T090000Z-3a8f0d5e.md`
- `Request`: `Extract invoice records from streamed record_invoice tool calls and save them; report failed streams as retryable.`

## Build Steps

### DEV-001 — Streaming invoice extraction

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Add `extract_invoice` and `ExtractResult` in `app/extract/stream.py` as the
design defines: request the `record_invoice` tool through the client it
receives, assemble the tool input from the streamed events, and save the parsed
record through the store it receives only when the stream completes with usable
input.

**Affected Area**

- `app/extract/stream.py` (new).
- Reads `settings.extract_max_tokens`; relies on the existing
  `GatewayClient.stream_message` and `InvoiceStore.save_invoice` contracts,
  unchanged.

**Expected Outcome**

- A stream that reaches `message_stop` with parseable tool input saves the
  record once and returns status `stored` with the record.
- An `error` event, or a stream that ends without `message_stop`, saves nothing
  and returns status `retryable`.
- A `max_tokens` stop reason, or tool input that `json.loads` rejects, saves
  nothing and returns status `invalid`.

**Self-Check**

- `python3 -m pytest -q` in the project root, on
  `${COMMIT:Record context, scope, and design for invoice extraction}` plus the
  new `app/extract/stream.py` (uncommitted at the time): exit 0, 3 passed.
  These are the existing store tests.
- `python3 -c "import app.extract.stream"` in the project root: exit 0.
- Inspection of the event handling in `extract_invoice` against the design's
  Data and Control Flow section.
- Limitation: the gateway host is not reachable from the development
  environment, so no live stream was run.

**Implementation Notes**

The early returns do not close the client explicitly:
`GatewayClient.stream_message` closes its response when the generator is
discarded.

## Plan Notes

Single-step plan, approved as proposed. Project references loaded: `NONE`.
