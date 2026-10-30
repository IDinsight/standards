<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: share-report-link-20260924T090000Z-5e8a1c3f
-->

# Technical Design

## Context

Reports are persisted by `ReportStore` (`src/store.js`) in a JSON file.
Handlers in `src/api.js` return `{ status, body }` and enforce owner-only
access; `src/router.js` maps method and path to handlers. There is no session
layer: the router receives `user` or `null`.

## Decision

Share links are backed by a share-link token persisted by `ReportStore`. The
owner requests a link through a new `shareReport` handler, and the response
carries a URL containing the token. Opening the link returns the report in
read-only form through a handler that does not require a signed-in user.
Tokens are generated with `node:crypto` `randomBytes` so they cannot be
guessed; no new dependency is introduced.

## Acceptance Coverage

- `AC-001`: `shareReport` in `src/api.js`; token persisted by `ReportStore`; response `{ url }`.
- `AC-002`: `shareReport` applies the same lookup order as `getReport` (404 for an unknown report, then 403 for a non-owner).
- `AC-003`: shared-view handler in `src/api.js` serves the report without a user.
- `AC-004`: shared-view response contains only `title` and `body`; no write route is added for shared access.

## Components

- `src/store.js` — persists the share-link token.
- `src/api.js` — `shareReport` and the shared-view handler.
- `src/router.js` — routes for both handlers.

## Interfaces and Contracts

- `POST /reports/:id/share` — signed-in owner only; `201 { url }`.
- Shared view — `200 { title, body }`.

## Technical Acceptance Criteria

- `AC-001`: The token is generated from at least 16 random bytes and persisted before the response is returned.
- `AC-003`: The shared-view handler does not read `user`.
- `AC-004`: The shared-view body contains only `title` and `body`.

## Build Plan

1. Store support for the share-link token.
2. `shareReport` handler and route.
3. Shared-view handler and route.
