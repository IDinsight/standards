<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: let-survey-owners-list-the-responses-20260922T141500Z-3c9e0b7a
-->

# Development Plan

`Cycle`: `let-survey-owners-list-the-responses-20260922T141500Z-3c9e0b7a`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`: `AFTER_IMPLEMENTATION`
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

### DEV-002 — Owner response listing endpoint

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Let an authenticated survey owner page through the responses submitted to one of their surveys.

**Affected Area**

`app/responses/service.py` (new listing function) and `app/responses/router.py` (new `GET` route on the existing responses router).

**Expected Outcome**

`GET /surveys/{survey_id}/responses/` behaves as the design's Interfaces and Contracts section states for owners, other users, unauthenticated callers, and out-of-range pagination. Anonymous `POST` submission is unchanged.

**Self-Check**

Planned: `pytest`, `ruff check .`, and `mypy app` from the project root. Not yet run.

## Plan Notes

- Revision 2, approved by the user on 2026-09-23 after DEV-001 was done: at the user's request the former DEV-002 (owner-scoped page query) and DEV-003 (listing route) were merged into a single DEV-002 so the listing lands as one change. DEV-003 is withdrawn and its number is not reused. The user style selection is unchanged.
- Project references loaded: NONE.
