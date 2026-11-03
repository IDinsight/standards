<!-- STANDARDS
Artifact: SCOPE
Cycle: survey-results-export-20260923T140000Z-3f9a2c71
-->

# Survey Results CSV Export

## Goal

Survey owners can currently see only answer counts. They need to take a
survey's raw responses into a spreadsheet for their own analysis.

## Constraints

- Responses come from the existing response store; no new storage.
- The output must open correctly in common spreadsheet tools (RFC 4180 CSV).

## Non-goals

- Filtering or selecting which responses are exported; every response to the
  survey is exported.
- Delivering the file over HTTP or through any user interface.
- Project documentation changes.

## Work

### 1. Export a survey's responses as CSV

**Intent:** Give survey owners every response to one survey in a form a
spreadsheet can open without manual cleanup.

**Done when:**

- `AC-001`: Exporting a survey produces a header row with the response id, the
  submission time, and the requested question columns, followed by one row per
  response to that survey.
- `AC-002`: Fields containing commas, double quotes, or line breaks are quoted
  per RFC 4180, with embedded double quotes doubled.
- `AC-003`: A question that a response did not answer produces an empty field.

**Depends on:** None
