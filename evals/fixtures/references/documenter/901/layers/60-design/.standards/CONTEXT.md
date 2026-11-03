# Project Context

## Project Baseline

- Monorepo: `apps/api` (FastAPI, imports uploaded CSV files in a background
  task) and `apps/web` (Vite/TypeScript client with an imports page).
- `POST /imports` needs no authentication, answers 201 with an `ImportJob`
  whose status is `running` or `done`, and rejects an empty file (400) or a
  file over a fixed 10 MiB limit (413). An unreadable file stays `running`.
  `GET /imports/{import_id}` requires a bearer token.

## Stack and Tooling

- API: Python 3.12, FastAPI, pydantic, SQLite (standard library); uv.
- Web: TypeScript, Vite, Vitest; pnpm. `pnpm build` generates
  `src/schema.d.ts` from `apps/api/openapi.yaml` (gitignored).
- CI: one GitHub Actions workflow per app in `.github/workflows/`.

## Structure and Boundaries

- `apps/api/app/routes/imports.py` — handlers for `/imports`.
- `apps/api/app/jobs.py` — schema, job creation, file storage, processing.
- `apps/api/app/auth.py` — `require_token`, bearer tokens checked against
  SHA-256 hashes in `api_tokens`; 401 otherwise.
- `apps/api/app/config.py` — settings from environment variables.
- `apps/web/src/api.ts`, `apps/web/src/imports.ts` — client and page.

## Commands

- `apps/api`: `uv sync`, `uv run uvicorn app.main:app --reload`, `uv run pytest`.
- `apps/web`: `pnpm install`, `pnpm dev`, `pnpm test`, `pnpm build`.

## Conventions and Constraints

- `apps/api/openapi.yaml` is the hand-maintained contract, not generated.
- Settings are listed in `apps/api/.env.example`.
- Errors use FastAPI's `{"detail": ...}` body (`Error`).

## Testing and Verification Baseline

- API: pytest with `TestClient` in `apps/api/tests/`. Web: Vitest in
  `src/*.test.ts`; no browser tests. No OpenAPI linter or documentation build
  tool is configured.
