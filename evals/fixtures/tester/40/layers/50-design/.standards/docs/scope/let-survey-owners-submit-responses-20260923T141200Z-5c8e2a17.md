<!-- STANDARDS
Artifact: SCOPE
Cycle: let-survey-owners-submit-responses-20260923T141200Z-5c8e2a17
-->

# Survey Response Submission

## Goal

Survey owners collect answers in the field and today can record them only by
loading a CSV through the importer after returning to the office. They need to
submit a completed response through the API as soon as it is collected, so
results stay current.

## Constraints

- Uses the existing bearer-token authentication and survey ownership rules.
- Existing survey creation, retrieval, results, and CSV import behavior stays
  unchanged.

## Non-goals

- Submissions by anyone other than the survey owner (shared or public
  surveys).
- Editing or deleting submitted responses.
- Changes to the CSV importer or the results endpoint.

## Work

### 1. Submit a response

**Intent:** Let the owner of a survey record one completed response with its
answers in a single request.

**Done when:**

- `AC-001`: An authenticated survey owner can submit a response with answers to
  the survey's questions through `POST /surveys/{id}/responses` and receives
  201 with the stored response.
- `AC-002`: An authenticated user who does not own the survey receives 403 and
  no response is stored.
- `AC-003`: A submission that omits an answer to any required question receives
  422 and no response is stored.

**Depends on:** None
