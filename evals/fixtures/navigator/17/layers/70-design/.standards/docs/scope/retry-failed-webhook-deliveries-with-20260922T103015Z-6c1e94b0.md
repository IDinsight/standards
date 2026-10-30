<!-- STANDARDS
Artifact: SCOPE
Cycle: retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0
-->

# Webhook Delivery Retries

## Goal

Customer endpoints that are briefly unavailable miss events, because relay
makes a single delivery attempt. Deliveries that fail for transient reasons
should be retried, without causing receivers to act on the same event twice.

## Constraints

- Existing callers of `deliver()` keep working without changes.
- Receivers that do not read any new request information keep working
  unchanged.

## Non-goals

- Persisting failed deliveries for later replay.
- Per-endpoint retry settings.

## Work

### 1. Retry transient failures

**Intent:** A short endpoint outage should not lose an event.

**Done when:**

- `AC-001`: A delivery that fails with a network error or a 5xx response is
  retried, with increasing waits, up to three times.
- `AC-002`: A delivery that receives a 4xx response is not retried.
- `AC-003`: The delivery result reports how many attempts were made.

**Depends on:** None.

### 2. Let receivers recognize repeated attempts

**Intent:** A retry after a lost response must not look like a new event.

**Done when:**

- `AC-004`: Every attempt of the same delivery carries the same delivery
  identifier, so a receiver can discard repeated attempts.

**Depends on:** 1.

## Assumptions

- Three retries over roughly ten seconds cover typical brief endpoint outages.
