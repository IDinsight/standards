<!-- STANDARDS
Artifact: SCOPE
Cycle: invoice-extraction-20260924T090000Z-3a8f0d5e
-->

# Streaming Invoice Extraction

## Goal

Turn invoice document text into a structured invoice record by asking the model
gateway to call a `record_invoice` tool, and save the record. A failed or
unusable response must never leave a partial or wrong record behind, and the
caller must learn whether trying again makes sense.

## Constraints

- Python standard library only; no new dependencies.
- Use the existing gateway client (`app/llm/client.py`) and the existing
  invoice store (`app/extract/store.py`) without changing their contracts.

## Non-goals

- Retrying inside the extraction; the caller decides whether to retry.
- Changes to the gateway client, the store schema, or settings.
- Measuring or tuning the accuracy of extracted fields.
- Validating individual invoice fields beyond reading the tool input.

## Work

### 1. Extract and store invoices from a streamed tool call

**Intent:** Invoices can be extracted through the gateway's streaming
responses, with a clear outcome for every way a stream can finish.

**Done when:**

- `AC-001`: A complete stream stores the invoice record.
- `AC-002`: A stream that sends an error event or ends early stores nothing,
  and the result is reported as retryable.
- `AC-003`: Tool input that is not valid JSON, or that was cut off at the token
  limit, stores nothing.

**Depends on:** None

## Assumptions

- The gateway sends events in the Anthropic Messages streaming format, as
  recorded in the project context.
