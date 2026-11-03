# portal-auth Technical Design

## Context

portal-auth signs members in and issues session tokens for the member portal's
API. It is a small set of handler functions with no web framework and no package
dependencies. The login lockout change (cycle
`login-lockout-20260915T101500Z-3c9e4f21`) adds a per-account limit on failed
sign-in attempts.

## Decision

- Handlers are plain functions that return `{ status, headers, body }`; the
  portal's HTTP layer serializes them.
- Session tokens are HMAC-SHA256 signed strings of the form
  `<base64url payload>.<base64url signature>`. The payload is `{ sub, exp }`
  and tokens are valid for one hour. There is no server-side session store.
- Every authentication failure is an `AuthError` built from one table in
  `src/auth/errors.js`, so each status code and message is defined in one place.
- Lockout state is kept in process memory by `LockoutTracker`, keyed by the
  normalized email. A restart clears it; this is accepted while the service runs
  as a single instance.

## Acceptance Coverage

- `AC-001`: `LockoutTracker.recordFailure` counts failed attempts per normalized
  email; the fifth consecutive failure sets `lockedUntil` 15 minutes ahead.
- `AC-002`: `login` checks `lockedForMs` before looking up the user, and returns
  `account_locked` (423) while the lock lasts, even for the correct password.
- `AC-003`: `toResponse` copies `retryAfterSeconds` from the error details into
  the `Retry-After` header and the error body.
- `AC-004`: `lockedForMs` clears the entry once `lockedUntil` has passed, so
  sign-in works again after the lockout window.
- `AC-005`: `recordSuccess` deletes the entry after a successful sign-in, so
  earlier failures no longer count.

## Components

- `src/auth/login.js` — sign-in handler: input normalization, lockout check,
  password verification, token issue.
- `src/auth/lockout.js` — `LockoutTracker`: failure counts and lock expiry
  against an injectable clock (`MAX_FAILURES` 5, `LOCKOUT_MS` 15 minutes).
- `src/auth/passwords.js` — scrypt hashing with a 16-byte random salt and a
  32-byte key; constant-time comparison.
- `src/auth/tokens.js` — token issue and verification.
- `src/auth/middleware.js` — `authenticate` parses the bearer token;
  `withAuth` wraps a protected handler and passes `userId` from the `sub` claim.
- `src/auth/errors.js` — the error table (code, status, message), `AuthError`,
  and `toResponse`.

## Interfaces and Contracts

- Sign-in: `login(context, body)` with `body = { email, password }`. The email
  is trimmed and lowercased. Success is `200` with `{ token }`. The context
  carries `users`, `lockout`, and `secret`.
- Error responses: `{ error: { code, message } }` with the status from the error
  table. A locked account's response also carries a `Retry-After` header and
  `error.retryAfterSeconds`, both in whole seconds.
- Protected handlers: wrapped with `withAuth(handler, secret)`; they require an
  `Authorization: Bearer <token>` header.

## Data and Control Flow

Sign-in: normalize input -> reject missing fields -> check lockout -> look up
user and verify password -> record the failure or success -> issue the token.

Protected request: read the `Authorization` header -> check the signature ->
decode the claims -> check expiry -> call the handler with `userId`.

## Technical Acceptance Criteria

- `AC-002`: The lockout check runs before password verification, so a locked
  account never reaches `verifyPassword`.
- `AC-003`: `retryAfterSeconds` is the remaining lock time rounded up to whole
  seconds.
- `AC-004`: Lock expiry is evaluated against the tracker's clock on each call;
  no timers are used.

## Build Plan

1. CREATE `src/auth/lockout.js` with `LockoutTracker`.
2. MODIFY `src/auth/errors.js`: add `account_locked` (423) and retry details in
   `toResponse`.
3. MODIFY `src/auth/login.js`: check the lockout before the password check and
   record failures and successes. Callers pass a `lockout` tracker in the
   context.

## Risks and Follow-up

- Lockout state is per process; running several instances would need shared
  storage.
- Locking by email lets anyone who knows an address lock that account for 15
  minutes.
- Tokens cannot be revoked before they expire.
