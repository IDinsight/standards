<!-- STANDARDS
Artifact: SCOPE
Cycle: retry-failed-webhook-deliveries-20260921T140500Z-3c9e71a4
-->

# Webhook Delivery Retries

## Goal

Stop losing webhook events when a subscriber is briefly unavailable or
rate-limits hookrelay, by retrying failed deliveries a bounded number of times
without hammering the subscriber.

## Constraints

- Every attempt sends the same body and signature as the first.
- A delivery of one event to one endpoint makes at most 3 attempts.

## Non-goals

- Persistent retry queues or retries that survive a process restart.
- Dead-letter storage or alerting for exhausted deliveries.

## Work

### 1. Bounded retries

**Intent:** Transient subscriber failures should not drop events, and retries
must respect subscribers that ask hookrelay to slow down.

**Done when:**

- `AC-001`: A delivery that fails with a 5xx response or a network error is attempted again, up to 3 attempts in total, with the same body and signature.
- `AC-002`: A delivery rejected with status 429 is retried; when the response carries a `Retry-After` value in seconds, the next attempt waits at least that long, and if that wait would exceed 30 seconds the delivery is not retried.
- `AC-003`: Consecutive attempts are separated by a delay that grows with each retry and never exceeds 30 seconds.
- `AC-004`: Responses with any other 4xx status are not retried, and every delivery result reports how many attempts were made.

**Depends on:** None
