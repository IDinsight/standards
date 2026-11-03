# Project Context

## Project Baseline

- fieldwork is a Python monorepo with two services and one shared package
  (root README.md). It has no CI: there is no `.github/` directory and no other
  CI configuration.

## Stack and Tooling

- Python projects managed with uv. Each app has its own `pyproject.toml`,
  `uv.lock`, and `.python-version`; there is no uv workspace at the root.
- apps/api: FastAPI service. `requires-python = ">=3.11"`; `.python-version`
  holds `3.12`. Hatchling build backend; the wheel packages `app`. Dependency
  group `dev`: pytest, pytest-cov, ruff, mypy, httpx.
- Ruff, mypy, and pytest are configured in apps/api/pyproject.toml. There is no
  `[tool.coverage]` section and no `.coveragerc`.

## Structure and Boundaries

- `apps/api/app/`: routes (`main.py`), Pydantic schemas (`schemas.py`), and an
  in-memory survey store (`store.py`).
- `apps/api/tests/`: pytest suite using FastAPI's `TestClient`.
- `apps/worker/`: separate uv project for enumerator reminders; also depends on
  packages/shared.
- `packages/shared/`: hatchling package `shared` (survey codes and statuses),
  installed into both apps through
  `[tool.uv.sources] shared = { path = "../../packages/shared", editable = true }`.

## Commands

All from `apps/api`, as listed in apps/api/README.md:

- `uv sync`: create the environment, including the `dev` group.
- `uv run ruff check .`: lint.
- `uv run ruff format --check .`: formatting check.
- `uv run mypy app`: type check.
- `uv run pytest --cov=app --cov-report=xml`: tests with coverage; writes
  `coverage.xml`.
- `uv build`: sdist and wheel into `dist/`.

## Conventions and Constraints

- Commands run from the app's own folder.
- apps/api behavior can change through edits under packages/shared.

## Testing and Verification Baseline

- apps/api tests live in `apps/api/tests`, apps/worker tests in
  `apps/worker/tests`. Nothing runs them automatically.

## Known Unknowns

- The commands were not run during this audit: uv is not installed in this
  environment and package registries are unreachable, so the current results of
  the checks are unknown.

## Evidence

- `apps/api/pyproject.toml`, `apps/api/.python-version`, `apps/api/uv.lock`:
  Python support, tooling, and the path source.
- `apps/api/README.md`: commands.
- `apps/worker/pyproject.toml`: second consumer of packages/shared.
- Repository tree: no `.github/` directory.
