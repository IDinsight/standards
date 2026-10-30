<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-login-and-sessions-for-registered-20260923T141000Z-5c8e2a91
-->

# Development Plan

`Cycle`: `add-login-and-sessions-for-registered-20260923T141000Z-5c8e2a91` `Mode`: `STEPWISE`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`INCREMENTAL` `Current Increment`: `1`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-login-and-sessions-for-registered-20260923T141000Z-5c8e2a91.md`
- `Architecture`: `.standards/docs/specs/add-login-and-sessions-for-registered-20260923T141000Z-5c8e2a91.md`
- `Request`: `Add login and sessions for registered users.`

## Build Steps

### DEV-001 — Credential verification

`Status`: `PENDING` `Depends On`: `NONE`
`Acceptance`: `AC-001`

**Goal**

Decide whether a username and password match a registered user, as the design's
credential components define.

**Affected Area**

`src/passwords.js` (new `verifyPassword` beside `hashPassword`) and a new
`src/auth.js` exporting `authenticate(users, username, password)`.

**Expected Outcome**

`verifyPassword` accepts the stored `<salt>:<key>` form, compares with
`timingSafeEqual`, and returns `false` for malformed input. `authenticate`
returns `{ id, username }` for a correct pair and `null` for an unknown username
or a wrong password, running a dummy comparison for unknown usernames. No route
uses it yet.

**Self-Check**

Planned: `npm test` from the project root (the existing suite stays green), and
a `node --input-type=module -e` script from the project root that registers a
user in a fresh store and calls `authenticate` with correct, wrong-password,
unknown-user, and non-string inputs. Not run yet.

### DEV-002 — Sessions, login, and identity routes

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `AC-002`

**Goal**

Issue a session on successful login and resolve it on later requests.

**Affected Area**

New `src/sessions.js` (`createSessionStore`); `src/app.js` (`sessions` option,
`sid` cookie parsing, `POST /login`, `GET /me`).

**Expected Outcome**

`POST /login` uses `authenticate`: on a match it creates a session and responds
`200` with the `sid` cookie; otherwise `401` with no cookie. `GET /me` returns
`{ id, username }` for a valid session and `401` otherwise. Existing routes
behave as before.

**Self-Check**

Planned: `npm test` from the project root, and a `node --input-type=module -e`
script driving `createApp` through registration, a failed login, a successful
login, and `GET /me` with and without the returned cookie. Not run yet.

### DEV-003 — Logout

`Status`: `PENDING` `Depends On`: `DEV-002`
`Acceptance`: `AC-003`

**Goal**

End the current session on request.

**Affected Area**

`src/app.js` (`POST /logout`).

**Expected Outcome**

`POST /logout` destroys the cookie's session and responds `204` with a clearing
cookie; `GET /me` with the old cookie then responds `401`.

**Self-Check**

Planned: `npm test` from the project root, and a `node --input-type=module -e`
script running login, logout, then `GET /me` with the old cookie. Not run yet.

---

## Verification Increments

### Increment 1

`Development Steps`: `DEV-001, DEV-002` `Acceptance`: `AC-001, AC-002`

**Ready Outcome**

A registered user can sign in through `POST /login`: wrong or unknown
credentials get `401` without a cookie, correct credentials get `200` with the
`sid` cookie, and `GET /me` identifies the user from that cookie and answers
`401` without it.

### Increment 2

`Development Steps`: `DEV-003` `Acceptance`: `AC-003`

**Ready Outcome**

A signed-in user can sign out through `POST /logout`, after which `GET /me` with
the same cookie answers `401`.

---

## Plan Notes

- Increment 1 covers two steps because neither is observable on its own:
  credential checks are reachable only through `POST /login`, which DEV-002
  adds, and DEV-002 cannot issue a session without DEV-001's `authenticate`.
