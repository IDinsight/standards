<!-- STANDARDS
Artifact: SCOPE
Cycle: replace-session-cookie-authentication-20260923T141022Z-5b8e2f17
-->

# Access Tokens for API Authentication

## Goal

Replace the session-cookie authentication contract that the API, web app, and
worker use today with short-lived access tokens, so that a leaked credential
stops working within minutes instead of remaining valid for up to two weeks.
The change must roll out without interrupting signed-in users or the nightly
report job, because the three components are released on separate schedules.

## Constraints

- The API, web app, and worker keep their separate release schedules; no
  rollout step may require two components to deploy together.

## Non-goals

- Single sign-on, external identity providers, or third-party API clients.
- Changes to roles and route permissions, login rate limiting, password
  storage, or audit event names.
- New user-facing account features such as "remember me" or a
  session-management screen.

## Work

### 1. Access-token authentication

**Intent:** Shorten how long a stolen credential is useful by moving every API
consumer from the long-lived session cookie to short-lived access tokens.

**Done when:**

- `AC-001`: The API, web app, and worker authenticate API requests with
  short-lived access tokens that expire no more than 15 minutes after issue,
  replacing the existing session-cookie authentication contract.

**Depends on:** None

### 2. Uninterrupted staged rollout

**Intent:** Users and the nightly report must keep working while the change
reaches each component on its own schedule.

**Done when:**

- `AC-002`: Sessions that exist when the rollout starts continue working
  throughout the staged rollout; signed-in users and the worker are not forced
  to sign in again because of it.
- `AC-003`: The API, web app, and worker may each be updated at a different
  time, and every combination of updated and not-yet-updated components keeps
  working during the rollout.

**Depends on:** 1

### 3. Reversible migration

**Intent:** Operators need a way back if the new contract misbehaves in
production. The migration is complete only when operators explicitly retire
the session-cookie contract after every component uses access tokens.

**Done when:**

- `AC-004`: Until the migration is complete, operators can roll back to
  session-cookie authentication at any stage of the rollout.

**Depends on:** 1, 2

## Assumptions

- Browser users reach the API only from the web app's configured origin
  (`WEB_ORIGIN`).
