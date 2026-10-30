<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-login-and-sessions-for-registered-20260923T141000Z-5c8e2a91
-->

# Technical Design

## Context

The scope adds sign-in, a signed-in identity check, and sign-out to the existing
account API. Per project context, handlers in `src/app.js` return plain response
objects, users live in the in-memory store in `src/users.js`, and passwords are
stored as `<salt hex>:<key hex>` by `src/passwords.js`. No external
dependencies are allowed.

## Decision

Keep the existing handler style. Credentials are checked by a new `authenticate`
function built on a `verifyPassword` helper beside `hashPassword`. Sessions are
opaque random tokens held in an in-memory session store and carried in an `sid`
cookie. Login, identity, and logout are three routes in `src/app.js`. In-memory
sessions match the in-memory user store; persistence is a scope non-goal.

## Acceptance Coverage

- `AC-001`: `verifyPassword` and `authenticate` decide credentials; `POST /login`
  returns `401` without `Set-Cookie` when `authenticate` returns `null`.
- `AC-002`: session store `create` and `get`; `POST /login` sets the `sid` cookie
  on success; `GET /me` resolves the cookie to a user.
- `AC-003`: session store `destroy`; `POST /logout` destroys the cookie's
  session and clears the cookie.

## Components

- `src/passwords.js` — add `verifyPassword(password, stored)`: split the stored
  value at `:`, derive the scrypt key with the stored salt and the same key
  length, and compare with `crypto.timingSafeEqual`. A malformed stored value or
  a non-string password returns `false`; it never throws.
- `src/auth.js` (new) — `authenticate(users, username, password)` returns
  `{ id, username }` for a matching user and password, otherwise `null`. For an
  unknown username it still runs `verifyPassword` against a fixed dummy hash so
  unknown and known usernames take comparable time.
- `src/sessions.js` (new) —
  `createSessionStore({ ttlMs = 8 * 60 * 60 * 1000, now = Date.now } = {})` with
  `create(userId)` returning a token of 32 random bytes in hex, `get(token)`
  returning the user id or `null` (expired entries are deleted on read), and
  `destroy(token)`.
- `src/app.js` — `createApp({ users, sessions = createSessionStore() })` adds
  the three routes and reads the `sid` value from the request's `cookie` header.

## Interfaces and Contracts

- `POST /login`, body `{ username, password }`:
  - match: `200` with `{ id, username }` and
    `Set-Cookie: sid=<token>; HttpOnly; Path=/; SameSite=Lax`;
  - anything else, including missing or non-string fields: `401` with
    `{ "error": "invalid credentials" }` and no `Set-Cookie`. Unknown username
    and wrong password are indistinguishable.
- `GET /me`: valid session gives `200` with `{ id, username }`; a missing,
  unknown, or expired session gives `401` with `{ "error": "not signed in" }`.
- `POST /logout`: destroys the session named by the cookie, if any, and responds
  `204` with `Set-Cookie: sid=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
  whether or not a session existed.

## Data and Control Flow

`POST /login` calls `authenticate`; on a match it calls
`sessions.create(user.id)` and sets the cookie. `GET /me` reads `sid`, calls
`sessions.get`, then `users.findById`, and returns public fields only.
`POST /logout` reads `sid` and calls `sessions.destroy`.

## Technical Acceptance Criteria

- `AC-001`: `verifyPassword` uses `timingSafeEqual` and returns `false` instead
  of throwing on malformed input; a failed login never creates a session.
- `AC-002`: tokens come from `crypto.randomBytes(32)`; the cookie is `HttpOnly`,
  `Path=/`, and `SameSite=Lax`; responses never include `passwordHash`.
- `AC-003`: after logout, `sessions.get` returns `null` for the destroyed token.

## Build Plan

1. Credential verification (`verifyPassword`, `authenticate`).
2. Session store plus `POST /login` and `GET /me`; this is the first point at
   which sign-in is observable.
3. `POST /logout`.

## Risks and Follow-up

- Sessions are lost on restart; acceptable under the scope's non-goals.
