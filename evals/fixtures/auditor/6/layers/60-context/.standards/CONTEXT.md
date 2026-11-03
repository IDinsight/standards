# Project Context

## Project Baseline

- `reportdesk` is a small Node.js reporting service. Owners sign in, create
  tabular reports, and read their own reports through a request-handler API
  (`createApp` in `src/api.js`) that takes `{ method, path, headers, body }`
  objects and returns `{ status, body }`. The repository contains no HTTP
  server binding.
- Reports are owner-private: every report route requires a session token, and
  a report owned by someone else is answered with `404`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"` in
  `package.json`).
- No runtime or development dependencies.
- Tests use the built-in `node:test` runner with `node:assert/strict`.

## Structure and Boundaries

- `src/api.js` — routing, session issuing (`POST /sessions`), bearer-token
  authentication, report create (`POST /reports`) and read
  (`GET /reports/:id`).
- `src/tokens.js` — signing and verification of session tokens
  (HMAC-SHA256 via `node:crypto`).
- `src/store.js` — in-memory `ReportStore`; nothing persists across restarts.
- `src/config.js` — reads the signing secret from the `REPORTDESK_SECRET`
  environment variable.
- `docs/api.md` — client-facing API reference, including the session token
  format.

## Commands

- `npm test` — runs `node --test` on the explicit file list in the `test`
  script of `package.json`.

## Conventions and Constraints

- Handlers return `{ status, body }`; error bodies are `{ error: <message> }`.
- The `test` script lists test files explicitly; a new test file must be added
  to it to run.

## External Systems and Data

- Session token wire format, documented in `docs/api.md`:
  `<userId>.<expiresAt>.<signature>`, where `expiresAt` is milliseconds since
  the epoch and `signature` is the base64url HMAC-SHA256 of
  `<userId>.<expiresAt>` keyed by `REPORTDESK_SECRET`.
- The web dashboard (not in this repository) reads `expiresAt` from the second
  token segment to prompt users to sign in again. Sessions last 30 days, and
  the documentation promises that tokens issued by an earlier release stay
  valid until they expire.

## Testing and Verification Baseline

- `test/tokens.test.js` — round trip, documented three-segment form,
  tampering, expiry, wrong secret.
- `test/reports.test.js` — store ids and unknown reports.
- `test/api.test.js` — credentials, owner-only reads, `401` without a valid
  session, 30-day session expiry.

## Relevant Existing Behavior

- `GET /reports/:id` returns the full report record (`id`, `ownerId`, `title`,
  `rows`) to its owner.
- Report rows are arrays of string cells; there is no export or rendering
  format.

## Evidence

- `src/api.js`, `src/tokens.js`, `src/store.js`, `src/config.js`,
  `docs/api.md`, `package.json`, `test/`.
