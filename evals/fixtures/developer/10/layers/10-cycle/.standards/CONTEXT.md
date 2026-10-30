# Project Context

## Project Baseline

- `orders-dashboard` is an internal Next.js dashboard for the support team with two pages:
  recent orders (`/orders`) and customer search (`/customers`). It reads Postgres through `pg`
  and writes nothing.

## Stack and Tooling

- Next.js 15.1 App Router, React 19, TypeScript 5.7 in strict mode (`package.json`,
  `tsconfig.json`: `moduleResolution: bundler`, `allowImportingTsExtensions`,
  `verbatimModuleSyntax`, `@/*` path alias).
- Node 22 and pnpm scripts. Plain CSS in `app/globals.css`; no CSS framework.
- Postgres through `pg` 8; `lib/db.ts` builds the pool from `DATABASE_URL`.

## Structure and Boundaries

- `app/` — server-component pages (`app/orders/page.tsx`, `app/customers/page.tsx`), the root
  layout, and `app/globals.css`.
- `lib/sql/*.sql` — one SQL statement per file, loaded by name with `loadSql()` from `lib/sql.ts`.
- `lib/orders.ts`, `lib/customers.ts` — query modules: run a loaded statement through a `Db`
  (`lib/db-types.ts`) and map snake_case rows to camelCase objects.
- `lib/db.ts` — the only module that imports `pg`.
- `scripts/format.mjs`, `scripts/lint.mjs` — the repository's own formatter and lint rules.

## Commands

- `pnpm format:check` — formatter check over `app/`, `lib/`, `test/`, and `scripts/`;
  `pnpm format` fixes whitespace in place and reports the rest.
- `pnpm lint` — repository lint rules.
- `pnpm test` — `node:test` unit tests for the query modules and money formatting; no database.
- `pnpm typecheck`, `pnpm build`, `pnpm dev` — need installed dependencies; `dev` also needs
  `DATABASE_URL`.

## Conventions and Constraints

- Formatting (`scripts/format.mjs`, `.editorconfig`): 2-space indentation, no tabs or trailing
  whitespace, one final newline, at most 100 columns, no statement-ending semicolons in `.ts`,
  `.tsx`, and `.mjs` files. Strings use double quotes by convention.
- Lint (`scripts/lint.mjs`): lowercase SQL keywords and no `select *` in `lib/sql/*.sql`; no SQL
  template strings passed to `.query()`; no `any`; no `console.log` in `app/` or `lib/`; no
  `"use client"` in a `page.tsx`.
- Pages are server components and receive `searchParams` as a promise (Next.js 15), as in
  `app/customers/page.tsx`.
- Imports inside `lib/` and `test/` carry `.ts` extensions so the tests run under Node type
  stripping; `app/` imports use the `@/lib/...` alias. Type-only imports use `import type`.

## External Systems and Data

- Postgres tables read here: `orders (id, customer_id, placed_at, status, total_cents)` and
  `customers (id, name, email)`. `orders.customer_id` is null for guest checkouts.
  `orders.status` holds `pending`, `paid`, `shipped`, or `cancelled`.
- The schema is owned by the shop backend; this repository has no migrations.

## Testing and Verification Baseline

- `test/orders.test.ts`, `test/customers.test.ts`, and `test/money.test.ts` use fake `Db`
  objects. Pages have no unit tests; CI checks them with `pnpm build`.

## Relevant Existing Behavior

- `/orders` lists the 50 most recent orders (order number, placed date, status, total) with no
  filtering.
- `/customers` searches by name or email once the text has at least two characters.

## Known Unknowns

- Dependencies are not installed in this checkout (`node_modules` is absent and the package
  registry is not reachable here), so `pnpm typecheck` and `pnpm build` were not run.

## Evidence

- `package.json`, `tsconfig.json`, `.editorconfig`, `README.md`, `scripts/format.mjs`,
  `scripts/lint.mjs`, `lib/sql/*.sql`.
- `pnpm format:check`, `pnpm lint`, and `pnpm test` passed at the project root on the audited
  commit.
