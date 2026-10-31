# Project Context

## Project Baseline

- `survey-service` is a FastAPI service where field staff build surveys and
  record responses; data lives in PostgreSQL through SQLModel. Survey creation,
  retrieval, and per-question results exist. Responses are written only by the
  CSV importer.

## Stack and Tooling

- Python 3.11+ (`pyproject.toml`), FastAPI 0.115+, SQLModel, psycopg 3.
- Dev extras: pytest, httpx (for `TestClient`), testcontainers[postgres].
- No migration framework: tests and deployments create tables from
  `SQLModel.metadata`.

## Structure and Boundaries

- `app/main.py` — application object and router registration.
- `app/database.py` — engine from `DATABASE_URL` and the `get_session`
  dependency.
- `app/auth.py` — `get_current_user`: bearer token checked against hashed
  `api_tokens`; 401 `{"detail": "Not authenticated"}` otherwise.
- `app/models.py` — tables `users`, `api_tokens`, `surveys`, `questions`
  (with `required`), `survey_responses` (with `source`, default `import`), and
  `answers`.
- `app/surveys/router.py` — `/surveys` routes, their request and response
  models, and the `_owned_survey` helper (404 `Survey not found`, 403
  `Not the survey owner`).
- `app/surveys/importer.py` — CSV loader for paper responses.

## Nearest Analogues

- `get_results` in `app/surveys/router.py` with `tests/test_results.py` — an
  owner-only survey sub-resource; its tests seed data and switch users with the
  `login` fixture.

## Commands

- `pip install -e '.[dev]'` — install the service and test dependencies.
- `python -m pytest` — full suite from the project root. Needs Docker for the
  PostgreSQL container, or `TEST_DATABASE_URL` pointing at a PostgreSQL
  database where the suite may create and drop tables.

## Conventions and Constraints

- Errors use `HTTPException` with FastAPI's `{"detail": ...}` body.
- Survey ownership checks go through `_owned_survey`.

## Testing and Verification Baseline

- `tests/conftest.py`: session-scoped PostgreSQL (`postgres:16-alpine` through
  testcontainers, or `TEST_DATABASE_URL`) with tables from `SQLModel.metadata`;
  a per-test `session` inside an outer transaction that is rolled back after
  the test; `client` overrides `get_session` through `app.dependency_overrides`;
  `login(user)` overrides `get_current_user`; `make_user(email)` creates users.
- 7 tests: `tests/test_surveys.py` (5) and `tests/test_results.py` (2).

## Known Unknowns

- No CI configuration is in the repository, so how CI provides Docker is not
  established.

## Evidence

- `tests/conftest.py`, `pyproject.toml`, `README.md`, `app/surveys/router.py`,
  `app/models.py`, `app/auth.py`.
