<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: survey-results-export-20260923T140000Z-3f9a2c71
-->

# Technical Design

## Context

Scope: `.standards/docs/scope/survey-results-export-20260923T140000Z-3f9a2c71.md`.
Responses live in the in-memory store in `src/responses.js`; `forSurvey`
returns a survey's responses in insertion order with `id`, `submittedAt`
(ISO 8601 UTC), and an `answers` object keyed by question. The project has no
runtime dependencies (`.standards/CONTEXT.md`).

## Decision

Add a pure function `exportSurveyCsv(store, surveyId, questions)` in a new
module `src/export.js` that returns the CSV text. The caller supplies the
question keys, which fixes column order; the module does no I/O.

## Acceptance Coverage

- `AC-001`: `exportSurveyCsv` writes the header
  `response_id,submitted_at,<questions...>` and one record per
  `store.forSurvey(surveyId)` entry, in store order.
- `AC-002`: one field encoder quotes values containing a comma, double quote,
  CR, or LF and doubles embedded quotes; it is applied to header and data
  fields alike.
- `AC-003`: a missing (`undefined` or `null`) answer is encoded as an empty
  field.

## Interfaces and Contracts

- `exportSurveyCsv(store, surveyId, questions: string[]): string`. Records are
  separated and terminated by CRLF (RFC 4180). A survey with no responses
  yields only the header record.

## Technical Acceptance Criteria

- `AC-001`: header columns are exactly `response_id`, `submitted_at`, then
  `questions` in the given order.
- `AC-002`: quoting follows RFC 4180 section 2, rules 5 to 7.
- `AC-003`: every record has the same number of fields as the header.

## Build Plan

1. CREATE `src/export.js` with the field encoder and `exportSurveyCsv`.
