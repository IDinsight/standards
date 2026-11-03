<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: let-survey-owners-submit-responses-20260923T141200Z-5c8e2a17
-->

# Technical Design

## Context

Responses are already stored in `survey_responses` and `answers`
(`app/models.py`), written today only by `app/surveys/importer.py` with
`source = "import"`. Ownership is enforced by `_owned_survey` in
`app/surveys/router.py`, and authentication by `get_current_user` in
`app/auth.py`. See `.standards/CONTEXT.md`.

## Decision

Add one endpoint to `app/surveys/router.py` that reuses `get_current_user` and
`_owned_survey`, validates the answers against the survey's questions inside
the handler, and writes the response and its answers in one commit. No model,
table, or dependency change is needed.

## Acceptance Coverage

- `AC-001`: `submit_response` handler with the `ResponseCreate` and
  `ResponseOut` contracts below; the response row is written with
  `source = "api"`.
- `AC-002`: ownership through the existing `_owned_survey` helper, evaluated
  before any answer check or write.
- `AC-003`: required-answer check against `questions.required` in the handler,
  returning the 422 body below before any write.

## Components

- `app/surveys/router.py` — request and response models for submissions and
  the `submit_response` handler.

## Interfaces and Contracts

`POST /surveys/{survey_id}/responses`, bearer token required.

Request body (`ResponseCreate`):

    {"answers": [{"question_id": 12, "value": "4"}]}

`value` is a non-empty string of at most 2000 characters. A body that does not
match this shape gets FastAPI's default request-validation 422 (`detail` is a
list of errors); that validation runs before the handler.

Outcomes, in evaluation order:

| Condition                                   | Status | Body                                                                     |
| ------------------------------------------- | ------ | ------------------------------------------------------------------------ |
| Missing or unknown token                    | 401    | `{"detail": "Not authenticated"}`                                         |
| Survey does not exist                       | 404    | `{"detail": "Survey not found"}`                                          |
| Caller does not own the survey              | 403    | `{"detail": "Not the survey owner"}`                                      |
| An answer names a question outside survey   | 422    | `{"detail": {"code": "unknown_questions", "question_ids": [...]}}`        |
| A question is answered more than once       | 422    | `{"detail": {"code": "duplicate_answers", "question_ids": [...]}}`        |
| A required question has no answer           | 422    | `{"detail": {"code": "missing_required_answers", "question_ids": [...]}}` |
| Otherwise                                   | 201    | `ResponseOut`                                                            |

`question_ids` lists every offending question id in ascending order.

`ResponseOut`: `{"id", "survey_id", "submitted_by", "submitted_at", "answers"}`
where `submitted_by` is the caller's user id, `submitted_at` is the stored
timestamp, and `answers` is a list of `{"question_id", "value"}` in request
order. Optional questions may be left out.

## Data and Control Flow

Authenticate, load the owned survey, load its questions, run the three answer
checks, then insert one `survey_responses` row and its `answers` rows and
commit once. Any rejection happens before the insert, so nothing is stored.

## Technical Acceptance Criteria

- `AC-001`: A valid owner submission stores one `survey_responses` row with
  `source = "api"` and `submitted_by_id` equal to the caller, plus one
  `answers` row per submitted answer, and returns 201 with `ResponseOut`.
  Answers naming unknown questions or repeating a question are rejected with
  the 422 bodies above and store nothing.
- `AC-002`: A caller who does not own the survey receives 403 with
  `{"detail": "Not the survey owner"}` and no rows are written.
- `AC-003`: A submission missing any required question receives 422 with code
  `missing_required_answers` listing every missing question id, and no rows
  are written.

## Build Plan

1. MODIFY `app/surveys/router.py`: add the submission request and response
   models and the `submit_response` handler.

## Risks and Follow-up

- FastAPI body validation runs before the handler, so a non-owner sending a
  malformed body receives 422 rather than 403. Accepted: no survey data is
  revealed either way.
