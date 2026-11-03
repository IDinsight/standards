<!-- STANDARDS
Artifact: SCOPE
Cycle: retry-failed-webhook-deliveries-with-20260921T140512Z-5c81e0a4
-->

# Webhook Delivery Retries

## Goal

Receivers sometimes fail briefly (deploys, rate limits, network blips), and
today one failed request loses the event. Deliveries that may succeed later
should be retried a bounded number of times with a growing wait, operators
should be able to tune or turn off the retries, and the operations guide should
explain how.

## Constraints

- No new dependencies.
- The delivery result keeps its `ok`, `attempts`, and `status` fields.

## Non-goals

- A persistent retry queue, or retries that survive a process restart.
- Per-subscriber retry settings.
- Random jitter in the wait.

## Work

### 1. Retry deliveries that may succeed later

**Intent:** Avoid losing events to temporary receiver or network problems.

**Done when:**

- `AC-001`: A delivery that fails with a 5xx response, a 429 response, or a network error or timeout is retried until it succeeds or the configured maximum number of attempts is reached, and the result reports the number of attempts made.
- `AC-002`: A delivery that fails with any other 4xx response is not retried.
- `AC-003`: The wait before the second attempt is the configured base delay; it doubles after each further failed attempt and never exceeds the configured maximum delay.

**Depends on:** None.

### 2. Operator settings

**Intent:** Let operators tune retries per deployment without code changes.

**Done when:**

- `AC-004`: Operators can set the maximum number of attempts, the base delay, and the maximum delay through environment variables; an invalid value stops the relay with an error naming the variable.

**Depends on:** 1.

### 3. Operations guide

**Intent:** Operators need to know what is retried and how to change it.

**Done when:**

- `AC-005`: The operations guide documents which failures are retried, each retry setting with its default, and how to turn retries off.

**Depends on:** 1, 2.
