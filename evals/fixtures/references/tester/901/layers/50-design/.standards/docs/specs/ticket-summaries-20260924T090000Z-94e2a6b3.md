<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: ticket-summaries-20260924T090000Z-94e2a6b3
-->

# Technical Design

## Context

The scope asks the summary job to store only finished summaries and to handle
cut-off, refused, and rate-limited completions. The provider client already
reports each of these: `Completion.finish_reason`, `Completion.refusal`, and
`RateLimitError.retry_after` for HTTP 429 (`.standards/CONTEXT.md`).
`run_summary_job` in `app/summaries/service.py` currently saves any non-empty
text, and `app/worker.py` reschedules every `LLMError` after a fixed 300
seconds.

## Decision

Keep the change inside `run_summary_job`; the client, store, and scheduler
interfaces stay as they are. The job receives its scheduler from the caller, as
it already receives its client, ticket repository, and store, so it can schedule
follow-up work itself. Outcomes are decided in this order: rate limit, refusal,
cut-off (`length`), finished (`stop` with non-empty text), anything else. A
refusal is checked before the finish reason because providers report refusals
with different finish reasons. A cut-off job is retried at once with twice the
token limit; doubling reaches a useful size in one or two retries without a new
setting.

## Acceptance Coverage

- `AC-001`: the `stop` branch saves `completion.text` with
  `store.save_summary`.
- `AC-002`: the `length` branch schedules `SummaryJob(ticket_id, max_tokens * 2)`
  with no delay and saves nothing.
- `AC-003`: the refusal branch saves the constant `UNAVAILABLE`
  (`"unavailable"`), never the completion text.
- `AC-004`: the `RateLimitError` handler schedules the same job after
  `retry_after` and saves nothing.

## Interfaces and Contracts

- `run_summary_job(job, *, client, tickets, store, scheduler) -> None`.
  `client.complete(messages, *, max_tokens)` returns a `Completion` or raises
  `LLMError` or `RateLimitError`; `tickets.get_text(ticket_id)` returns the
  ticket text; `store.save_summary(ticket_id, text)`;
  `scheduler.schedule(job, *, delay_seconds)`.
- `UNAVAILABLE = "unavailable"` is the stored summary for a refused ticket.
- `SummaryJob(ticket_id, max_tokens)` is unchanged.

## Data and Control Flow

`app/worker.py` takes due jobs from the scheduler and calls `run_summary_job`
for each, now passing its scheduler. The job reads the ticket text, calls the
client with `max_tokens=job.max_tokens`, and then takes exactly one of the
outcomes below. Client errors other than `RateLimitError` propagate to the
worker unchanged.

## Technical Acceptance Criteria

- `AC-001`: For a completion with no refusal, `finish_reason` `stop`, and
  non-empty text, the job calls `store.save_summary(job.ticket_id, completion.text)`
  once and schedules nothing.
- `AC-002`: For a completion with no refusal and `finish_reason` `length`, the
  job saves nothing and calls
  `scheduler.schedule(SummaryJob(job.ticket_id, job.max_tokens * 2), delay_seconds=0)`
  once.
- `AC-003`: For a completion whose `refusal` is set, the job calls
  `store.save_summary(job.ticket_id, UNAVAILABLE)` once, whatever its text and
  finish reason, and schedules nothing.
- `AC-004`: When `client.complete` raises `RateLimitError`, the job calls
  `scheduler.schedule(job, delay_seconds=error.retry_after)` with the same job
  and saves nothing.
- `AC-001` (fallback): A summary is saved only for a `stop` completion with
  non-empty text. Any other completion makes the job raise `LLMError` without
  saving or scheduling; `app/worker.py` already catches `LLMError` and
  schedules the job again after `RETRY_DELAY_SECONDS`.

## Build Plan

1. MODIFY `app/summaries/service.py`: add the `scheduler` parameter and the
   outcome handling above.
2. MODIFY `app/worker.py`: pass the scheduler from `run_due_jobs` to
   `run_summary_job`.

## Risks and Follow-up

- A summary still cut off after doubling doubles again on each retry; this
  cycle sets no cap (scope non-goal). A later cycle may add one.
- The client falls back to a 60-second delay when `Retry-After` is missing or
  invalid; this cycle relies on that behavior unchanged.
