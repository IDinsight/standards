<!-- STANDARDS
Artifact: SCOPE
Cycle: add-login-and-sessions-for-registered-20260923T141000Z-5c8e2a91
-->

# Login and Sessions

## Goal

Registered users can sign in with their username and password, stay signed in
across requests through a session cookie, and sign out. Today the API can
create accounts but cannot tell who is making a request.

## Constraints

- Existing registration and health behavior stays unchanged.
- No new third-party dependencies, as for the rest of the project.

## Non-goals

- Sessions that survive a server restart.
- Password reset, account lockout, or rate limiting.
- Changing how passwords are hashed at registration.

## Work

### 1. Sign in

**Intent:** Let a registered user prove who they are once and be recognized on
later requests.

**Done when:**

- `AC-001`: `POST /login` with an unknown username or a wrong password responds
  `401` and sets no session cookie; the response does not reveal which of the
  two was wrong.
- `AC-002`: `POST /login` with correct credentials responds `200` with a
  session cookie, and `GET /me` with that cookie returns the user's `id` and
  `username`; without a valid session `GET /me` responds `401`.

**Depends on:** None

### 2. Sign out

**Intent:** Let a signed-in user end their session.

**Done when:**

- `AC-003`: `POST /logout` with a valid session cookie ends that session, after
  which `GET /me` with the same cookie responds `401`.

**Depends on:** 1
