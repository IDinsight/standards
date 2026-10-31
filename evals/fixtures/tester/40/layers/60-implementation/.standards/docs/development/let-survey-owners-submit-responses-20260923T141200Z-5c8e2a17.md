<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: let-survey-owners-submit-responses-20260923T141200Z-5c8e2a17
-->

# Development Plan

`Cycle`: `let-survey-owners-submit-responses-20260923T141200Z-5c8e2a17`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/let-survey-owners-submit-responses-20260923T141200Z-5c8e2a17.md`
- `Architecture`:
  `.standards/docs/specs/let-survey-owners-submit-responses-20260923T141200Z-5c8e2a17.md`
- `Request`: `Let survey owners submit responses through the API: POST /surveys/{id}/responses.`

## Build Steps

### DEV-001 — Submission request and response models

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-003`

**Goal**

Define `AnswerIn`, `ResponseCreate`, `AnswerOut`, and `ResponseOut` in
`app/surveys/router.py` as the design's request and response contracts.

**Affected Area**

`app/surveys/router.py` only.

**Expected Outcome**

Request bodies parse as a list of `question_id`/`value` pairs with non-empty
values; the response model matches the design's 201 body.

**Self-Check**

Covered by the DEV-002 self-check below.

### DEV-002 — Submission endpoint with ownership and answer checks

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Add `POST /surveys/{survey_id}/responses`, reusing `get_current_user` and
`_owned_survey`, validating answers against the survey's questions, and storing
the response with `source = "api"` and its answers in one commit.

**Affected Area**

`app/surveys/router.py` (`submit_response`, `_reject_answers`).

**Expected Outcome**

Owner submissions are stored and returned with 201; non-owners get the existing
403; unknown, repeated, or missing required answers get the design's 422 bodies
before anything is written.

**Self-Check**

- `python -m pytest -q` from the project root in a Python 3.12 virtualenv with
  `.[dev]` installed and Docker 27 running (testcontainers PostgreSQL 16):
  exit 0, 7 passed. Existing suite only; this plan adds no tests.
- Manual run with `fastapi dev app/main.py` against a local PostgreSQL 16: an
  owner submission returned 201, another user's token returned 403, and a body
  without the required answer returned 422 with `missing_required_answers`.
- Assessed content: the uncommitted `app/surveys/router.py` with the new
  endpoint, on top of `${COMMIT:Record survey response scope and design}`.

**Implementation Notes**

Answer checks run in the order unknown, repeated, missing required, so a body
with several problems reports only the first category found.

## Plan Notes

- Project references loaded: `NONE`.
