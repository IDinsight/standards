# Project Context

## Project Baseline

- `portfolio-api` is a small Next.js App Router service that exposes project
  records as JSON under `/api/projects`. It has one informational page and no
  other UI.

## Stack and Tooling

- TypeScript, Next.js `15.1.6` (App Router), React `19.0.0`, pinned in
  `package.json`. Package manager: pnpm. `"type": "module"`.
- `tsconfig.json` enables `allowImportingTsExtensions` and
  `verbatimModuleSyntax`. Imports use relative paths with explicit `.ts`
  extensions, and type-only imports use `import type`.

## Structure and Boundaries

- `app/api/projects/route.ts` — collection route handler (`GET` list, `POST`
  create).
- `app/api/projects/[id]/route.ts` — single-project route handler (`GET`).
- `lib/projects.ts` — in-memory project store: `listProjects`, `findProject`,
  `createProject`, `deleteProject`, `resetProjects`. `deleteProject` is not
  exposed over HTTP yet.
- `lib/http.ts` — `jsonError(status, message)`, which builds the standard error
  body `{ "error": message }`.
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css` — root layout and
  informational landing page.

## Commands

- `pnpm test` — runs `tests/projects.test.ts` and `tests/project-by-id.test.ts`
  with `node --experimental-strip-types --test`. Needs no installed
  dependencies.
- `pnpm build`, `pnpm dev` — require `pnpm install` first.

## Conventions and Constraints

- Route handlers are exported async functions named after the HTTP method. They
  take the Web `Request` and return a Web `Response`, built with
  `Response.json(...)` or `jsonError(...)`.
- Dynamic route handlers take a second argument `{ params }`, where `params` is
  a `Promise<{ id: string }>` (Next.js 15). Handlers await it before use.
- Error responses always go through `jsonError`. Unknown project ids use the
  message `Project <id> not found` with status 404.

## Testing and Verification Baseline

- Tests in `tests/` import route handlers directly. They pass a context of
  `{ params: Promise.resolve({ id }) }` and call `resetProjects()` before each
  test.

## Known Unknowns

- `node_modules` is not present in this checkout, so `next build` and
  `tsc --noEmit` cannot run until dependencies are installed. Type correctness
  is established by inspection and by the type-stripping test run only.

## Evidence

- `package.json`, `tsconfig.json` — versions, scripts, compiler settings.
- `app/api/projects/[id]/route.ts` — dynamic route-handler signature.
- `pnpm test` — 6 passing tests on the committed tree.
