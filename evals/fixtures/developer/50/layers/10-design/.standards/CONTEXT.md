# Project Context

## Project Baseline

- `accounts-api`: a small dependency-free Node.js HTTP API for user accounts.
  It supports registration (`POST /users`) and a health probe (`GET /health`);
  there is no sign-in or session handling.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no npm
  dependencies.
- Tests use the built-in `node:test` runner and `node:assert/strict`.

## Structure and Boundaries

- `src/app.js` — `createApp({ users })` returns a synchronous request handler
  `(request) => { status, headers, body }`, where request is
  `{ method, path, headers, body }`. `json()` builds JSON responses.
- `src/users.js` — in-memory user store with `add`, `findByUsername`, and
  `findById`. Usernames are trimmed and lowercased. Stored users carry
  `passwordHash`; `add` returns only `{ id, username }`.
- `src/passwords.js` — `hashPassword` with scrypt and a random 16-byte salt,
  stored as `<salt hex>:<key hex>` (32-byte key).
- `src/server.js` — adapts `node:http` to the handler; parses JSON bodies and
  passes the raw request headers through.

## Commands

- `npm test` (`node --test test/users.test.js test/app.test.js`) — the full
  existing suite, run from the project root.
- `node src/server.js` — starts the server on `PORT` (default 3000).

## Conventions and Constraints

- No external dependencies; use Node built-ins only.
- Handlers return plain response objects; HTTP specifics stay in
  `src/server.js`.
- Store errors surface as `400` with `{ error }`.

## Testing and Verification Baseline

- `test/users.test.js` covers the user store; `test/app.test.js` covers the
  health route, registration, and unknown routes. All pass.

## Evidence

- `src/*.js`, `test/*.js`, `package.json`, and `README.md` as committed before
  this cycle.
