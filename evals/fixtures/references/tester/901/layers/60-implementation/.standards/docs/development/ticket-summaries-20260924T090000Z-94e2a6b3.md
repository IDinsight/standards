<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: ticket-summaries-20260924T090000Z-94e2a6b3
-->

# Development Plan

`Cycle`: `ticket-summaries-20260924T090000Z-94e2a6b3` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/ticket-summaries-20260924T090000Z-94e2a6b3.md`
- `Architecture`: `.standards/docs/specs/ticket-summaries-20260924T090000Z-94e2a6b3.md`
- `Request`: `Store only finished ticket summaries; handle cut-off, refused, and rate-limited completions.`

## Build Steps

### DEV-001 — Handle each completion outcome in run_summary_job

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002, AC-003, AC-004`

**Goal**

`run_summary_job` decides what to do with each completion as the technical
design specifies: save a finished summary, save `UNAVAILABLE` for a refusal,
retry a cut-off completion with a doubled token limit, retry a rate-limited job
after the provider's delay, and raise `LLMError` for anything else.

**Affected Area**

- `app/summaries/service.py` (MODIFY): `run_summary_job` takes the `scheduler`
  and handles the rate-limit, refusal, `length`, `stop`, and fallback cases.
- `app/worker.py` (MODIFY): `run_due_jobs` passes its scheduler to
  `run_summary_job`.

**Expected Outcome**

For each due job the worker either stores the finished summary, stores
`unavailable` for a refusal, queues the same ticket again with twice the token
limit and no delay, queues the same job after `retry_after` seconds, or leaves
the job to the worker's existing `LLMError` retry. Nothing is stored in the
retry cases.

**Self-Check**

- Working directory: project root. Assessed content: the working tree with the
  DEV-001 changes to `app/summaries/service.py` and `app/worker.py`, before
  commit.
- `python3 -m pytest -q`: 5 passed, exit 0 (existing store and scheduler
  tests).
- `python3 -m app.worker --enqueue 1`, then `python3 -m app.worker --once`,
  with the developer's own provider key in a local `.env`, a local database
  holding one sample ticket, and network access to the provider: the worker
  logged `ran 1 summary job(s)` and saved the ticket's summary; exit 0.
- Limitation: the live run exercised only the normal `stop` path. The
  refusal, `length`, rate-limit, and fallback paths were checked by reading the
  code, not executed.

**Implementation Notes**

The refusal check comes before the `finish_reason` checks, so a refusal
reported with `finish_reason` `stop` is stored as `unavailable`.

---

## Plan Notes

- The user approved the plan as proposed, with no user style.
- Project references loaded: `NONE`.
