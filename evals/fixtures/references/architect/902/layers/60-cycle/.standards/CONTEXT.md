# Project Context

## Project Baseline

- `ledger-api` is a Python web service that records ledger entries per account
  and lists them. Every environment runs PostgreSQL 14.

## Stack and Tooling

- Python 3.12 (`requires-python >= 3.11`), FastAPI, SQLAlchemy 2, Alembic,
  psycopg 3 (`postgresql+psycopg://` URLs), pytest with FastAPI's TestClient.
  Dependencies are declared in `pyproject.toml`.
- Docker Compose for the local database and API container; GitHub Actions for
  CI.

## Structure and Boundaries

- `app/db.py` — engine and session factory; reads `DATABASE_URL`.
- `app/models.py` — the `entries` table.
- `app/main.py` — HTTP routes: `GET /health`, `POST /entries`,
  `GET /accounts/{account}/entries`.
- `migrations/` — Alembic environment and revisions; schema changes go through
  Alembic.
- `docker-compose.yml`, `.github/workflows/ci.yml`, `docs/operations.md` — the
  database setup for local development, CI, and production.

## Commands

- `docker compose up -d db` — start the local database.
- `alembic upgrade head` — apply migrations; needs `DATABASE_URL`.
- `pytest` — run the tests against the database in `DATABASE_URL`.
- No command in the repository manages the production database; production
  changes are made through the AWS console or CLI by a team member with access
  (`docs/operations.md`).

## External Systems and Data

- Local development: service `db` in `docker-compose.yml` runs the
  `postgres:14` image with database `ledger_dev` and a `pg_isready` health
  check. The named volume `pgdata` is mounted at `/var/lib/postgresql/data` and
  holds each developer's local data across container restarts.
- CI: the `test` job in `.github/workflows/ci.yml` runs against a `postgres:14`
  service container with database `ledger_test`, created fresh for every run.
- Production: Amazon RDS for PostgreSQL 14, Multi-AZ, automated backups kept
  for 7 days, about 40 GB. Created on PostgreSQL 11 in 2019 and upgraded in
  place to 14 in 2023, with about 12 minutes of unavailability. The API is the
  only client of the production database. The application reads `DATABASE_URL`
  from the deployment's secrets.

## Testing and Verification Baseline

- `tests/` holds API tests that run against a real PostgreSQL database;
  `tests/conftest.py` truncates `entries` before each test and expects
  migrations to be applied already. There is no SQLite or mocked database path.
- CI runs `alembic upgrade head` and then `pytest` on pushes to `main` and on
  pull requests.

## Relevant Existing Behavior

- `GET /health` runs `SELECT 1` against the database.
- Each release runs `alembic upgrade head` against production before the new
  application version serves traffic (`docs/operations.md`).

## Known Unknowns

- Which newer major versions RDS offers as upgrade targets for the production
  instance cannot be established from the repository.

## Evidence

- `docker-compose.yml`, `.github/workflows/ci.yml`, `docs/operations.md`,
  `pyproject.toml`, `migrations/env.py`, `tests/conftest.py`.
