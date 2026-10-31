# Project Context

## Project Baseline

- `survey-reports` is a small Node.js library that collects survey responses
  in memory and reports on them. It stores responses and counts answers per
  question; it has no export.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no external
  dependencies.

## Structure and Boundaries

- `src/responses.js` — `createResponseStore()`: `add(response)` assigns a
  sequential `id`, defaults `submittedAt` to the current ISO 8601 UTC time, and
  copies `answers`; `forSurvey(surveyId)` returns that survey's responses in
  insertion order.
- `src/summary.js` — `countAnswers(responses, question)` counts each answer to
  one question, skipping unanswered responses.

## Commands

- `npm test` — runs `node --test` on the test files listed in `package.json`.

## Conventions and Constraints

- No runtime dependencies; modules are pure functions over the store.
- Test files are listed explicitly in the `test` script.

## Testing and Verification Baseline

- `test/responses.test.js` uses `node:test` and `node:assert/strict` and covers
  the store and the answer summary.

## Relevant Existing Behavior

- `submittedAt` is an ISO 8601 UTC string; responses are never reordered or
  removed.

## Evidence

- `src/responses.js`, `src/summary.js`, `test/responses.test.js`,
  `package.json`.
