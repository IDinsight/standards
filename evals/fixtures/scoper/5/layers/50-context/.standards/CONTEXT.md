# Project Context

## Project Baseline

- `helpdesk-web` 0.4.0: sign-in and session handling for the support helpdesk
  web app. A small Node HTTP server with an in-memory session store.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no external
  dependencies.
- Tests use `node:test` and `node:assert/strict`.

## Structure and Boundaries

- `src/server.js` — HTTP routes `POST /login`, `GET /me`, `POST /logout`; reads
  the `sid` cookie and looks up the session.
- `src/sessions.js` — `SessionStore`: creates, looks up, and destroys sessions in
  memory; the clock is injectable (`now`).
- `src/cookies.js` — builds the `sid` cookie and parses the `Cookie` header.
- `docs/scope/` — project-owned scope documents.

## Commands

- `npm test` (`node --test test/sessions.test.js test/cookies.test.js`) — runs
  all tests.
- `npm start` — runs the server on `PORT` (default 3000).

## Conventions and Constraints

- No runtime dependencies; standard library only.
- Sessions live only in process memory; a server restart ends all sessions.

## Testing and Verification Baseline

- `test/sessions.test.js` covers session creation, lookup, the 12-hour lifetime,
  and destroy.
- `test/cookies.test.js` covers cookie attributes and header parsing.
- There are no HTTP-level tests of `src/server.js`.

## Relevant Existing Behavior

- A session is valid for 12 hours from creation regardless of activity
  (`MAX_AGE_MS` in `src/sessions.js`); `lastSeen` is updated on each lookup but
  not used.
- The `sid` cookie is `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Max-Age=43200`,
  so it survives browser restarts for 12 hours.
- `POST /logout` destroys the session and clears the cookie.

## Evidence

- `src/sessions.js`, `src/cookies.js`, `src/server.js` — behavior above.
- `npm test` — 5 passing tests at audit time.
