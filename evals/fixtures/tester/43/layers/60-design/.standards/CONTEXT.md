# Project Context

## Project Baseline

- Helpdesk web: the customer help center. Visitors search help articles
  (`app/page.tsx`), read an article (`app/articles/[slug]/page.tsx`), and mark
  it helpful or not; `app/api/feedback/route.ts` forwards that feedback to the
  analytics collector.
- No accounts, sessions, or database. Articles are static data in
  `lib/articles-data.ts`.

## Stack and Tooling

- TypeScript with Next.js 15 (App Router) and React 19, declared in
  `package.json`; npm scripts.
- `tsconfig.json` enables `allowImportingTsExtensions` and
  `verbatimModuleSyntax`: imports use relative paths with explicit `.ts`/`.tsx`
  extensions and `import type` for types. There is no `@/` alias.
- Unit tests use Node's built-in runner (`node:test`) directly on the `.ts`
  sources through Node 22 type stripping, with no build step.
- Browser tests use Playwright (`@playwright/test`); `playwright.config.ts`
  starts `npm run dev` and runs the specs in `e2e/`.

## Structure and Boundaries

- `app/` — pages and route handlers. Route handlers use the web `Request` and
  `Response` APIs only.
- `components/` — client components.
- `lib/` — framework-free logic imported by routes, components, and tests.
- `test/` — unit tests; `e2e/` — Playwright specs.

## Nearest Analogues

- `lib/feedback.ts` with `lib/analytics.ts` and `test/feedback.test.ts` — the
  only server-side code that calls an outside service, always through one
  module (`lib/analytics.ts`). The test replaces that module with
  `mock.module` before importing `lib/feedback.ts`. The requested chat also
  calls an outside service from server code, but streams the response back to
  the browser.

## Commands

- `npm test` — unit tests: `node --test --experimental-test-module-mocks` with
  an explicit list of test files; new test files must be added to the script.
- `npm run test:e2e` — Playwright specs against `next dev`.
- `npm run dev`, `npm run build` — Next.js development server and build.

## Conventions and Constraints

- Service URLs and secrets come from environment variables. `.env` is
  git-ignored; `.env.example` lists the variable names.
- CI (`.github/workflows/ci.yml`) runs `npm install`, `npm test`, and the
  Playwright specs on every push and pull request. It passes no secrets or
  environment variables.

## External Systems and Data

- Analytics collector at `ANALYTICS_URL` (default
  `https://collect.helpdesk.example/v1/events`), called only from
  `lib/analytics.ts`.

## Testing and Verification Baseline

- 7 unit tests: 4 in `test/articles.test.ts` (search and lookup) and 3 in
  `test/feedback.test.ts` (feedback recording with the analytics module
  replaced). 2 Playwright specs in `e2e/home.spec.ts` (search and article
  page).
- No recorded HTTP responses, HTTP mocking library, or fixtures for outside
  services.

## Known Unknowns

- `node_modules` is not present in this checkout, so the Next.js build and the
  Playwright specs were not run during the audit. `npm test` needs no
  installed packages and passed (7 tests).

## Evidence

- `package.json`, `tsconfig.json`, `playwright.config.ts`,
  `.github/workflows/ci.yml` — tooling and commands.
- `test/feedback.test.ts` — module replacement pattern.
- `npm test` in the repository root — exit 0, 7 passed.
