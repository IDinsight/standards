# Project Context

## Project Baseline

- Volunteer sign-up portal. The only application is the Next.js 16 App Router
  project in `web/`, backed by Postgres (`web/db/schema.sql`).

## Stack and Tooling

- TypeScript, React 19, Next.js 16.0.3, `pg` for database access. npm scripts
  in `web/package.json` (`dev`, `build`, `start`, `lint`). No lockfile is
  committed.

## Structure and Boundaries

- `web/app/page.tsx` — public list of upcoming events with a Register form.
- `web/lib/events.ts` — `listUpcomingEvents()` query used by the public list.
- `web/lib/actions/registrations.ts` — `registerForEvent` Server Action.
- `web/lib/session.ts`, `web/lib/auth.ts` — signed session cookie and the
  `auth()` helper used by Server Actions.
- `web/app/admin/` — admin pages; `web/proxy.ts` redirects non-admin users away
  from `/admin` page loads.

## Nearest Analogues

- `web/app/admin/events/page.tsx` — already computes confirmed registrations per
  event with a `LEFT JOIN` and `FILTER (WHERE status = 'confirmed')`.

## Commands

- `cd web && npm run lint` — ESLint. Requires installed dependencies.
- `cd web && npm run dev` — local server; requires Postgres and `.env.local`.

## Testing and Verification Baseline

- No automated test suite exists. Verification so far has been manual against a
  local database.

## Known Unknowns

- No seed data is committed, so local manual checks need events created by
  hand.

## Evidence

- `web/db/schema.sql` — events, registrations (status), capacity column.
- `web/lib/events.ts`, `web/app/page.tsx` — current public list behavior.
