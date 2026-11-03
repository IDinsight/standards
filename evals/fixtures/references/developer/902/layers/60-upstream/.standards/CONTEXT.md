# Project Context

## Project Baseline

- notes-api is a small FastAPI JSON API for personal notes. Each user sees only
  their own notes; the caller's identity arrives in the `X-User-Id` request
  header, set by the gateway in front of the service.

## Stack and Tooling

- Python 3.12 in the container image (`python:3.12-slim`); FastAPI,
  pydantic-settings, and uvicorn are declared in `pyproject.toml`. uv installs
  dependencies in the image and runs the local dev server.

## Structure and Boundaries

- `app/main.py` — creates the FastAPI app, registers `CORSMiddleware` with the
  origins from settings, includes the notes router, and defines `/health`. CORS
  is the only middleware.
- `app/config.py` — pydantic-settings `Settings` (`environment` is
  `development` by default and `production` in production via
  `ENVIRONMENT=production`; `cors_origins`; `page_size_max`) and a module-level
  `settings` object.
- `app/routers/notes.py` — list, read, create, and delete endpoints under
  `/notes`, all scoped to the current user.
- `app/deps.py` — `current_user_id` dependency.
- `app/services/notes.py` — in-memory `NoteStore`, standard library only.
- `app/utils/` — shared helpers (`pagination.py`).

## Commands

- `python3 -m pytest` — runs the unit tests in `tests/unit/` from the project
  root; needs only pytest.
- `make dev` — `uv run uvicorn app.main:app --reload` for local development
  over plain HTTP.
- `Dockerfile` — the image's CMD runs `uvicorn app.main:app` on
  `0.0.0.0:8000`. No other file starts the server.

## Conventions and Constraints

- Response bodies are per-user note data.
- Production serves the API over HTTPS, terminated at a load balancer that
  forwards to the container on port 8000. Development and CI use plain HTTP.
- No project code sets response headers today.

## Testing and Verification Baseline

- `tests/unit/` covers `NoteStore` and `clamp_page`. No test imports FastAPI
  or exercises the HTTP layer; HTTP-level checks need FastAPI and its
  dependencies installed.

## Evidence

- `app/main.py`, `app/config.py`, `app/routers/notes.py`, `Dockerfile`,
  `Makefile`, `pyproject.toml`, `tests/unit/`.
