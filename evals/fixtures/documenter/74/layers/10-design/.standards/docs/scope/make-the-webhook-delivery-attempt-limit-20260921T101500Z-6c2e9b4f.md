<!-- STANDARDS
Artifact: SCOPE
Cycle: make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f
-->

# Configurable Webhook Attempt Limit

## Goal

Operators need to choose how many times the worker attempts each webhook event.
The limit is currently fixed at 5 in code, which retries some failing endpoints
for longer than the platform team wants.

## Constraints

- Configuration continues to come from environment variables read when the
  worker is created.
- Backoff timing (`WEBHOOK_BACKOFF_MS`, doubling after each failure) stays
  unchanged.

## Non-goals

- Per-endpoint or per-event attempt limits.
- Changes to backoff timing or the delivery result shape.

## Work

### 1. Configurable attempt limit

**Intent:** Let operators set the maximum number of delivery attempts per event
without changing code, with a lower default than today.

**Done when:**

- `AC-001`: With `WEBHOOK_MAX_ATTEMPTS` unset or empty, each event is attempted
  at most 3 times.
- `AC-002`: Setting `WEBHOOK_MAX_ATTEMPTS` to a whole number from 1 to 10 sets
  the maximum number of attempts per event.
- `AC-003`: Any other value of `WEBHOOK_MAX_ATTEMPTS` makes worker creation fail
  with an error that names the variable.

**Depends on:** None
