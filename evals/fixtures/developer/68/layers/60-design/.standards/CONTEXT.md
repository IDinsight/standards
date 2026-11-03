# Project Context

## Project Baseline

- `survey-api` (version 0.4.0) is a FastAPI service where field teams create surveys and anonymous respondents submit answers. Owners can create, list, read, and close their own surveys; respondents can submit to open surveys. There is no API for reading submitted responses.

## Stack and Tooling

- Python 3.11+, FastAPI, SQLModel (SQLAlchemy 2), pydantic-settings, PyJWT, Alembic; PostgreSQL through psycopg 3 in deployed environments.
- Dependencies are declared in `pyproject.toml`; the dev tools (pytest, httpx, ruff, mypy) are in the `dev` extra. No lockfile and no virtual environment are committed.

## Structure and Boundaries

- `app/main.py` — app creation, lifespan, router registration.
- `app/users/`, `app/surveys/`, `app/responses/` — one package per feature with `model.py`, `schema.py`, `router.py`, and `service.py` (`users` has only a model).
- `app/dependencies/auth.py` — `get_current_user`, the bearer-token dependency; it raises 401 for a missing, invalid, or expired token or an inactive user.
- `app/utils/` — settings (`config.py`), engine and `get_session` (`database.py`), JWT helpers (`security.py`).
- `migrations/` — Alembic; `app/models.py` imports every model for autogenerate. Revisions `0001` (users, surveys) and `0002` (survey_responses).
- `tests/` — pytest suite.

## Nearest Analogues

- `GET /surveys/` in `app/surveys/router.py` with `list_surveys` in `app/surveys/service.py` — authenticated, owner-scoped, paginated list: `offset` (>= 0, default 0) and `limit` (1-100, default 50) query parameters, ordering and paging in the query, plain JSON array response.
- `GET /surveys/{survey_id}` with `get_survey` — owner-scoped lookup; a survey owned by someone else is reported as 404, the same as a missing one.
- `POST /surveys/{survey_id}/responses/` in `app/responses/router.py` — anonymous submission returning `ResponseRead`; the responses router has no auth dependency.

## Commands

- Setup: `python -m venv .venv && . .venv/bin/activate && pip install -e ".[dev]"`.
- `pytest` — full test suite, from the project root (`pythonpath` and `testpaths` are set in `pyproject.toml`).
- `ruff check .` — lint and import order.
- `mypy app` — type check (`disallow_untyped_defs`, pydantic plugin).
- `alembic upgrade head` — apply migrations; needs `DATABASE_URL` pointing at a real database.

## Conventions and Constraints

- Routers own HTTP concerns: they inject dependencies, call a service, and translate a service `None` into `HTTPException`. Services take `session` first and return model objects or `None`.
- Authentication is applied with `Depends(get_current_user)` on each protected route. Tokens are issued by the organisation's accounts service and carry the user ID in `sub`.
- Ownership is enforced in service queries by filtering on `Survey.owner_id` with the authenticated user; responses have no owner of their own and belong to a survey.
- Schema changes go through Alembic revisions.

## External Systems and Data

- Tables `users`, `surveys` (`owner_id`, `title`, `is_open`, `created_at`), and `survey_responses` (`survey_id`, `respondent_ref`, JSON `answers`, `submitted_at`).
- JWT signing secret shared with the accounts service (`SECRET_KEY`).

## Testing and Verification Baseline

- `tests/test_surveys.py` and `tests/test_responses.py` cover survey creation, listing, owner isolation, page-size validation, closing, and response submission.
- `tests/conftest.py` overrides `get_session` with in-memory SQLite and mints tokens with `create_access_token`.
- The dev extra must be installed before the commands above can run.

## Evidence

- `pyproject.toml`, `README.md`, `app/`, `tests/`, `migrations/versions/`.
