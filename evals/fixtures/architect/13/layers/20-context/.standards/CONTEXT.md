# Project Context

## Project Baseline

- `portal-auth` provides the sign-in handler and session-token checks used by
  the member portal API. Node 22 ES modules with no package dependencies.
- The login lockout change (accounts locked after five failed sign-ins) is
  merged and is part of the current baseline.

## Stack and Tooling

- Node 22, `node:crypto` for scrypt and HMAC, `node:test` for tests.

## Structure and Boundaries

- `src/auth/errors.js` — error table (code, HTTP status, message), `AuthError`,
  and `toResponse`, which builds every error response.
- `src/auth/login.js` — sign-in handler.
- `src/auth/lockout.js` — failed-attempt counting and lockout window.
- `src/auth/tokens.js` — token issue and verification.
- `src/auth/middleware.js` — bearer-token check for protected handlers.
- `src/auth/passwords.js` — password hashing and comparison.
- `docs/architecture.md` — the project's technical design document.

## Commands

- `npm test` — runs `node --test test/auth.test.js test/lockout.test.js`; needs
  no network or services.

## Conventions and Constraints

- `AGENTS.md`: technical design is kept in `docs/architecture.md` rather than in
  separate design files.
- Handlers return `{ status, headers, body }`; error bodies are
  `{ error: { code, message } }`.
- No client-facing documentation exists yet; `README.md` links only the design.

## Testing and Verification Baseline

- `test/auth.test.js` covers sign-in success, `missing_credentials`,
  `invalid_credentials`, `token_missing`, `token_expired`, and a valid token.
- `test/lockout.test.js` covers `account_locked`, `Retry-After`, lock expiry,
  and reset after a successful sign-in.
- No test exercises `token_invalid`.

## Relevant Existing Behavior

- Error messages are fixed strings in the `src/auth/errors.js` table; no message
  is built from user input.

## Evidence

- `src/auth/*.js`, `test/*.test.js`, `package.json`, `AGENTS.md`, `README.md`.
- `npm test` in the project root on the committed tree: 9 tests passed.
