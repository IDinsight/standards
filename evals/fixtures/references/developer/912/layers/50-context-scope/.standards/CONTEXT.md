# Project Context

## Project Baseline

- `status-service` (version 1.3.0) is a small Node.js HTTP service that reports
  health and build status. It has no runtime dependencies.

## Stack and Tooling

- Node.js 22, ES modules (`"type": "module"`), `node:http` only.
- pnpm 10.34.5, pinned through `packageManager` in `package.json`;
  `pnpm-lock.yaml` is committed.
- ESLint 9 flat config in `eslint.config.js` using `@eslint/js` recommended
  rules. `eslint` and `@eslint/js` are dev dependencies only.

## Structure and Boundaries

- `index.js` — entry point; reads the version from `package.json` and listens on
  `PORT` (default 8080).
- `src/server.js` — routing for `GET /health` and `GET /status`, 404 and 405
  responses.
- `src/status.js` — status payload (version, uptime).
- `test/` — `node:test` suites for the payload and the HTTP server.
- `.github/workflows/ci.yml` — GitHub Actions workflow with one `test` job,
  triggered by `push` and `pull_request` on `main`.

## Commands

- `pnpm install --frozen-lockfile` — install dev dependencies from the lockfile;
  this is how CI installs.
- `pnpm test` (`node --test test/*.test.js`) — run the test suites; needs no
  installed dependencies.
- `pnpm lint` (`eslint .`) — lint the repository; requires the installed dev
  dependencies. ESLint exits with status 1 when it reports an error.

## Conventions and Constraints

- CI runs on `ubuntu-latest` with Node 22 via `actions/setup-node@v4` (pnpm
  cache) and pnpm via `pnpm/action-setup@v4`, which reads `packageManager`.
  Actions are referenced by major tag. The workflow sets
  `permissions: contents: read` and uses no secrets.
- Job timeouts are set explicitly (`timeout-minutes: 10` on `test`).

## Testing and Verification Baseline

- `node --test test/*.test.js` passes on Node 22 (6 tests).
- There is no workflow linter or local GitHub Actions runner in the project; CI
  behavior is observed on GitHub.

## Known Unknowns

- `node_modules` is not present in this checkout, so `pnpm lint` was not run
  during this audit and the current lint result of the code is not established
  here.

## Evidence

- `package.json`, `pnpm-lock.yaml`, `eslint.config.js` — scripts, tooling, and
  dev dependencies.
- `.github/workflows/ci.yml` — current CI triggers and job.
- `node --test test/*.test.js` — test baseline.
