<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: let-survey-owners-list-the-responses-20260922T141500Z-3c9e0b7a
-->

# Development Plan

`Cycle`: `let-survey-owners-list-the-responses-20260922T141500Z-3c9e0b7a`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/let-survey-owners-list-the-responses-20260922T141500Z-3c9e0b7a.md`
- `Architecture`: `.standards/docs/specs/let-survey-owners-list-the-responses-20260922T141500Z-3c9e0b7a.md`
- `Request`: `Let survey owners list the responses submitted to their surveys, a page at a time.`

## Build Steps

### DEV-001 — Composite index for per-survey response pages

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-003`

**Goal**

Support paging through one survey's responses in submission order without scanning the table.

**Affected Area**

`app/responses/model.py`, `migrations/versions/0003_survey_responses_submitted_index.py`.

**Expected Outcome**

`survey_responses` has a composite index on `(survey_id, submitted_at)`, declared on the model and created by Alembic revision `0003`, which also drops the superseded single-column `survey_id` index. No API behaviour changes.

**Self-Check**

Run from the project root in a local `.venv` with the `dev` extra installed, on the working tree at `${COMMIT:Record context, scope, and design for owner response listing}` plus the DEV-001 changes to the two files above:

- `pytest`: 7 passed.
- `ruff check .`: All checks passed!
- `mypy app`: Success: no issues found in 21 source files.
- `alembic upgrade head`, then `alembic downgrade -1` and `alembic upgrade head` against a local PostgreSQL 16 database: each applied without errors, and the table's index list showed `ix_survey_responses_survey_id_submitted_at` and no single-column `survey_id` index.

### DEV-002 — Owner-scoped response page query

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Return one page of a survey's responses to its owner, or nothing when the caller does not own the survey.

**Affected Area**

`app/responses/service.py`.

**Expected Outcome**

`list_survey_responses` exists with the design's signature and returns `None` for missing or unowned surveys, otherwise the requested page in the design's order.

**Self-Check**

Planned: `ruff check .` and `mypy app` from the project root. Not yet run.

### DEV-003 — Response listing route

`Status`: `PENDING` `Depends On`: `DEV-002` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Expose the owner's response pages over HTTP.

**Affected Area**

`app/responses/router.py`.

**Expected Outcome**

`GET /surveys/{survey_id}/responses/` behaves as the design's contract states; anonymous submission is unchanged.

**Self-Check**

Planned: `pytest`, `ruff check .`, and `mypy app` from the project root. Not yet run.

## Plan Notes

- Project references loaded: NONE.
