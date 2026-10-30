# portfolio-api

Next.js (App Router) service that exposes project records as JSON.

## Layout

- `app/api/**/route.ts` — route handlers. They use the Web `Request` and
  `Response` APIs.
- `lib/` — in-memory project store and small HTTP helpers.
- `tests/` — route-handler tests run with Node's built-in test runner.

## Commands

- `pnpm dev`, `pnpm build` — need dependencies installed first (`pnpm install`).
- `pnpm test` — imports the route handlers directly with Node's type stripping;
  no install needed.
