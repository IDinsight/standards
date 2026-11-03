# portal-auth Technical Design

## Context

portal-auth signs members in and issues session tokens for the member portal's
API. It is a small set of handler functions with no web framework and no package
dependencies.

## Decision

- Handlers are plain functions that return `{ status, headers, body }`; the
  portal's HTTP layer serializes them.
- Session tokens are HMAC-SHA256 signed strings of the form
  `<base64url payload>.<base64url signature>`. The payload is `{ sub, exp }`
  and tokens are valid for one hour. There is no server-side session store.
- Every authentication failure is an `AuthError` built from one table in
  `src/auth/errors.js`, so each status code and message is defined in one place.

## Components

- `src/auth/login.js` — sign-in handler: input normalization, password
  verification, token issue.
- `src/auth/passwords.js` — scrypt hashing with a 16-byte random salt and a
  32-byte key; constant-time comparison.
- `src/auth/tokens.js` — token issue and verification.
- `src/auth/middleware.js` — `authenticate` parses the bearer token;
  `withAuth` wraps a protected handler and passes `userId` from the `sub` claim.
- `src/auth/errors.js` — the error table (code, status, message), `AuthError`,
  and `toResponse`.

## Interfaces and Contracts

- Sign-in: `login(context, body)` with `body = { email, password }`. The email
  is trimmed and lowercased. Success is `200` with `{ token }`.
- Error responses: `{ error: { code, message } }` with the status from the error
  table.
- Protected handlers: wrapped with `withAuth(handler, secret)`; they require an
  `Authorization: Bearer <token>` header.

## Data and Control Flow

Sign-in: normalize input -> reject missing fields -> look up user and verify
password -> issue the token.

Protected request: read the `Authorization` header -> check the signature ->
decode the claims -> check expiry -> call the handler with `userId`.

## Risks and Follow-up

- Tokens cannot be revoked before they expire.
