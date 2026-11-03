<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: login-rate-limit-20260924T090000Z-a84c1e6f
-->

# Development Plan

`Cycle`: `login-rate-limit-20260924T090000Z-a84c1e6f` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `APPROVED`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/login-rate-limit-20260924T090000Z-a84c1e6f.md`
- `Architecture`: `.standards/docs/specs/login-rate-limit-20260924T090000Z-a84c1e6f.md`
- `Request`: `Limit login attempts so a client sending more than 10 login requests within one minute gets 429 until the minute ends.`

## Build Steps

### DEV-001 — Rate-limit the login route

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Throttle `POST /auth/login` with `@nestjs/throttler` as the technical design
specifies, leaving every other route unthrottled.

**Affected Area**

- `src/auth/auth.module.ts`: register the throttler with in-memory storage,
  limit 10 per 60000 ms.
- `src/auth/auth.controller.ts`: guard the `login` handler with
  `ThrottlerGuard`.

**Expected Outcome**

From one client, the 11th and later login requests within a 60-second window
receive HTTP 429 until the window ends, without reaching `AuthService.login`.
Requests within the limit behave as before, and no other route is throttled.

**Self-Check**

Planned: `pnpm run build` and `pnpm test` from the project root, and inspection
that only the login handler carries the guard and no global guard is
registered. Record the actual commands, results, and limitations when the step
runs.

## Plan Notes

- Approved by the user as proposed, with collaboration mode AUTONOMOUS and user
  style NONE; the style selection is locked.
- Project references loaded: NONE.
