<!-- STANDARDS
Artifact: SCOPE
Cycle: retry-webhook-deliveries-20260924T081500Z-6c1e9a42
-->

# Webhook Delivery Retries

## Goal

Transient failures lose webhook deliveries today because `deliver` gives up
after one attempt. Retry the failures that are likely to succeed later, and
space the attempts out so a struggling receiver is not flooded.

## Constraints

- The `deliver` result keeps its existing fields: `delivered`, `attempts`,
  `status`, and `error`.
- No new dependencies.

## Non-goals

- Honoring `Retry-After` headers or adding random jitter.
- Persisting or queueing undelivered payloads.
- Changes to payload signing.

## Work

### 1. Retry transient failures

**Intent:** Deliveries that fail for temporary reasons should eventually
arrive without the caller writing its own retry code.

**Done when:**

- `AC-001`: A delivery that fails with a network error or a 5xx response is
  attempted again until it succeeds or the maximum number of attempts is
  reached, and the result reports how many attempts were made.
- `AC-002`: The wait before each retry starts at the base delay, doubles for
  each further retry, and never exceeds the maximum delay.
- `AC-003`: A delivery that receives a 4xx response is not retried and is
  reported as not delivered after one attempt.

**Depends on:** None

### 2. Sensible defaults

**Intent:** Callers that pass no options get retries without configuring
anything.

**Done when:**

- `AC-004`: Without options, delivery makes at most 3 attempts with a 500 ms
  base delay and an 8000 ms maximum delay, and each setting can be overridden
  per call.

**Depends on:** 1
