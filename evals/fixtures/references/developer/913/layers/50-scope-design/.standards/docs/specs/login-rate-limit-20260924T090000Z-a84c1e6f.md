<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: login-rate-limit-20260924T090000Z-a84c1e6f
-->

# Technical Design

## Context

- Scope: `.standards/docs/scope/login-rate-limit-20260924T090000Z-a84c1e6f.md`
  (AC-001).
- `POST /auth/login` is handled by `AuthController.login` in
  `src/auth/auth.controller.ts`, which calls `AuthService.login`. `AuthModule`
  (`src/auth/auth.module.ts`) owns the controller.
- `package.json` already lists `@nestjs/throttler` ^6.4.0; nothing configures
  it. The API runs as a single process with no shared cache
  (`.standards/CONTEXT.md`).

## Decision

Use `@nestjs/throttler` with its default in-memory storage. Register one
throttler in `AuthModule` with `ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])`
(ttl in milliseconds) and apply `ThrottlerGuard` to the `login` handler only
with `@UseGuards(ThrottlerGuard)`. Do not register the guard globally (no
`APP_GUARD`), so every other route keeps its current behavior. Clients are
identified by the guard's default tracker, the request IP.

The in-memory store suits the single-process deployment; a shared store is not
needed for this scope.

## Acceptance Coverage

- `AC-001`: `ThrottlerGuard` on `AuthController.login` with a limit of 10 per
  60000 ms window keyed by client IP; the 11th and later requests in the window
  are rejected with `ThrottlerException` (HTTP 429) until the window expires.

## Components

- `AuthModule`: imports `ThrottlerModule.forRoot(...)` alongside `UsersModule`.
- `AuthController.login`: carries `@UseGuards(ThrottlerGuard)`; the handler body
  is unchanged.

## Interfaces and Contracts

- `POST /auth/login` within the limit: unchanged (200 with `accessToken` and
  `memberId`, or 401).
- Over the limit: HTTP 429 with the package's default `ThrottlerException`
  body; `AuthService.login` is not called for rejected requests.
- Every login request counts toward the limit, whatever its outcome.

## Data and Control Flow

Request -> `ThrottlerGuard` increments the hit count for the client key in
in-memory storage -> if the count within the 60-second window exceeds 10, it
throws `ThrottlerException` (429) -> otherwise `AuthController.login` ->
`AuthService.login`. Counts expire when the window ends.

## Technical Acceptance Criteria

- `AC-001`: Only the login handler is guarded; the throttler configuration is a
  limit of 10 and a ttl of 60000 ms with default storage; requests beyond the
  limit return 429 without reaching `AuthService.login`.

## Build Plan

1. MODIFY `src/auth/auth.module.ts`: import
   `ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])`.
2. MODIFY `src/auth/auth.controller.ts`: add `@UseGuards(ThrottlerGuard)` to
   `login`.

## Risks and Follow-up

- Counts live in process memory: they reset on restart and are not shared
  across instances. Acceptable for the single-process deployment.
- Behind a reverse proxy the request IP would be the proxy's; no proxy fronts
  the API today.
