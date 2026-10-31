<!-- STANDARDS
Artifact: SCOPE
Cycle: delivery-retry-limit-20260924T081500Z-6b1e9d4a
-->

# Configurable Delivery Retries

## Goal

Operators need to tune how many times the relay retries a failed webhook
delivery, and a delivery that exhausts its retries must no longer be lost.
Operators work from the operations guide, so it must describe the new behavior.

## Constraints

- Deployments that set no new environment variables keep working.
- Retries keep the existing backoff that starts at 1 second and doubles.

## Non-goals

- Replaying dead-lettered deliveries, automatically or with a tool.
- Persisting pending retries across restarts.
- Changes to event intake on `POST /events`.

## Work

### 1. Configurable retries and a dead-letter file

**Intent:** Let operators choose the retry budget and keep failed deliveries
for later handling.

**Done when:**

- `AC-001`: The number of retries after a failed first attempt is set by the
  `RETRY_LIMIT` environment variable and defaults to 5; a value that is not a
  positive integer stops the relay at startup with an error naming the
  variable.
- `AC-003`: A delivery whose attempts are all exhausted is appended as one JSON
  line to the file named by `DEAD_LETTER_PATH` (default
  `data/dead-letter.jsonl`) instead of being discarded.

**Depends on:** None

### 2. Operations guide

**Intent:** Operators can configure and run the relay from the guide without
reading the code.

**Done when:**

- `AC-002`: `docs/operations.md` documents `RETRY_LIMIT` and
  `DEAD_LETTER_PATH` with their defaults, how many attempts a delivery gets and
  the waits between them, and what happens to a delivery after its last attempt
  fails.

**Depends on:** 1
