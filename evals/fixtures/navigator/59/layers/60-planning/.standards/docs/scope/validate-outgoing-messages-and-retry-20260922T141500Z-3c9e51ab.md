<!-- STANDARDS
Artifact: SCOPE
Cycle: validate-outgoing-messages-and-retry-20260922T141500Z-3c9e51ab
-->

# Message Validation and Send Retry

## Goal

Stop malformed messages from reaching the delivery transport and keep short
transport outages from failing a send, so callers get a clear error for bad
input and fewer spurious delivery failures.

## Constraints

- `sendMessage(transport, message)` keeps its existing call shape; callers that
  pass only a transport and a message keep working.
- No new runtime dependencies.

## Non-goals

- Queuing or persisting messages for later delivery.
- Changing the transport interface.

## Work

### 1. Reject malformed messages

**Intent:** Callers learn about bad input immediately instead of from a
transport error.

**Done when:**

- `AC-001`: A message with a missing or malformed recipient address, a missing or blank subject, a subject longer than 120 characters, or a non-string body is rejected without contacting the transport.
- `AC-002`: The rejection reports every problem found in the message, not only the first.

**Depends on:** None

### 2. Retry transient send failures

**Intent:** A brief transport outage should not fail the send.

**Done when:**

- `AC-003`: When the transport answers 429, 502, 503, or 504, the send is retried with increasing delays, for at most three attempts in total, and succeeds if a later attempt succeeds.
- `AC-004`: Any other failure status is not retried, and the error a caller receives reports the final status and the number of attempts made.

**Depends on:** 1
