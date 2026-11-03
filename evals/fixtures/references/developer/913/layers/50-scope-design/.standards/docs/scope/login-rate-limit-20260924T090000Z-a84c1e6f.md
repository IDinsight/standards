<!-- STANDARDS
Artifact: SCOPE
Cycle: login-rate-limit-20260924T090000Z-a84c1e6f
-->

# Login Rate Limit

## Goal

Slow down password guessing against `POST /auth/login` by limiting how many
login requests one client can make per minute.

## Constraints

- Applies to the login route only; other routes keep their current behavior.
- Login responses within the limit stay as they are today.

## Non-goals

- Per-account lockout or lockout notifications.
- Limits shared across several API instances.
- Rate limits on any other route.

## Work

### 1. Limit login requests per client

**Intent:** Make brute-force login attempts from a single client impractical
without affecting ordinary sign-in.

**Done when:**

- `AC-001`: A client that sends more than 10 login requests within one minute
  gets HTTP 429 for further login requests until the minute ends.

**Depends on:** None

## Assumptions

- The API runs as a single process, so all of one client's requests reach the
  same instance.
