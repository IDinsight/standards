# orders-dashboard

Internal dashboard for the support team: recent orders and customer search.
Next.js 15 (App Router, server components) on Postgres through `pg`.

## Commands

- `pnpm dev` — local server; needs `DATABASE_URL`.
- `pnpm format` — repository formatter (`scripts/format.mjs`); `pnpm format:check` only reports.
- `pnpm lint` — repository lint rules (`scripts/lint.mjs`).
- `pnpm test` — unit tests for the query modules; no database needed.
- `pnpm typecheck`, `pnpm build` — need dependencies installed.

CI runs `pnpm format:check`, `pnpm lint`, `pnpm test`, and `pnpm build`.

## Conventions

- SQL lives in `lib/sql/*.sql`, one statement per file, loaded with `loadSql()`. Keywords are
  lowercase, parameters are positional (`$1`, `$2`), and columns are listed explicitly.
- Pages under `app/` are server components; no `"use client"` in `page.tsx`.
- No semicolons, double quotes, 2-space indentation, lines up to 100 columns.
