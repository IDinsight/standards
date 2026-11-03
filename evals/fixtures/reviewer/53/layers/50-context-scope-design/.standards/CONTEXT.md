# Project Context

## Project Baseline

- `hookpost` is a small Node.js library that delivers webhook payloads through
  a caller-supplied transport and signs request bodies. `deliver` currently
  makes exactly one attempt.

## Stack and Tooling

- Node.js 22, plain ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/deliver.js` — `deliver(send, payload)`. The transport boundary is
  `send(payload)`, which resolves to `{ status }` or rejects on a network
  error.
- `src/signature.js` — signature header value; unrelated to delivery timing.
- `test/` — `node:test` suites, one per source file.

## Commands

- `npm test` — runs `node --test` with the test files listed explicitly in
  `package.json`; a new test file must be added to that list.

## Conventions and Constraints

- `deliver` returns `{ delivered, attempts, status, error }`; the README
  documents that shape for callers.
- The package has no dependencies and adds none.

## Testing and Verification Baseline

- `test/deliver.test.js` covers a 2xx and a 404 response by replacing the
  transport with an async function. There is no timer control yet.

## Evidence

- `src/deliver.js`, `test/deliver.test.js`, `package.json`, `README.md` — as
  committed before this cycle.
