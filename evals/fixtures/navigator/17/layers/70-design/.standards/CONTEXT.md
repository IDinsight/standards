# Project Context

## Project Baseline

- `relay` delivers application events to customer webhook endpoints. Before
  this cycle it made a single delivery attempt per event.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/deliver.js` — `deliver(event, endpoint, { send })`; `send` has the shape
  of `fetch()` and is supplied by the caller.
- `test/deliver.test.js` — `node:test` scenarios for `deliver()`.

## Commands

- `node --test test/deliver.test.js` — run the tests (also `npm test`).

## Conventions and Constraints

- Callers inject `send`; `deliver()` performs no network access of its own.
- `deliver()` resolves to a result object and does not throw for delivery
  failures.

## Testing and Verification Baseline

- Four scenarios: JSON body and URL, 2xx delivered, 4xx not delivered, and the
  exact request header set (`content-type` only). None exercises retries.

## Relevant Existing Behavior

- Request body is `{ type, data, sentAt }`; the only header is
  `content-type: application/json`.

## Active-Cycle Non-Baseline Work

- `Cycle: retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0; src/deliver.js retry loop from commit ${COMMIT:Retry failed webhook deliveries with backoff}`
  — added on the former expedited path; tentative implementation, not
  established baseline.

## Evidence

- `git log -- src/deliver.js` — single-attempt baseline in the initial commit;
  retry loop added by the active cycle.
- `node --test test/deliver.test.js` — exit 0, 4 passed.
