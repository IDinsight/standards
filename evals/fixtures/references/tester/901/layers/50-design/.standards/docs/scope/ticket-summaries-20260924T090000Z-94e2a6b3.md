<!-- STANDARDS
Artifact: SCOPE
Cycle: ticket-summaries-20260924T090000Z-94e2a6b3
-->

# Ticket Summary Outcomes

## Goal

Agents read the stored summary of a ticket before opening it. Today the worker
stores any text the model returns, so a summary cut off at the token limit is
shown as if it were complete, a refusal message is shown as a summary, and a
rate-limited job waits the worker's fixed retry delay instead of the delay the
provider asks for. The worker must store only finished summaries and handle the
other outcomes deliberately.

## Constraints

- The worker keeps using the existing provider client and settings; no new
  dependencies (standard library only).
- The summary store and job scheduler keep their current interfaces.

## Non-goals

- Changing the provider, the model, the prompt, or the client.
- Limiting how many times a cut-off summary is retried.
- Showing summaries anywhere new.

## Work

### 1. Handle each completion outcome

**Intent:** Only a finished summary reaches agents; every other outcome is
either retried in a way that can succeed or recorded as unavailable.

**Done when:**

- `AC-001`: A normal completion is stored as the ticket's summary.
- `AC-002`: A completion cut off at the token limit is not stored, and the job
  is scheduled again with a larger token limit.
- `AC-003`: A refusal is stored as unavailable, without model text.
- `AC-004`: A rate limit schedules the job again after the provider's
  Retry-After and stores nothing.

**Depends on:** None
