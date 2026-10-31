# Survey Responses API

Collects survey responses submitted by field partners. The service lives in
`api/` and is a FastAPI application backed by SQLite.

## Local setup

Requires Python 3.11 or newer.

```sh
cd api
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
set -a; . ./.env; set +a
python -m app.persistence.migrate
uvicorn app.main:app --reload --env-file .env
```

All settings come from environment variables (see `api/app/config.py` and
`api/.env.example`). Local development uses the SQLite file named by
`DATABASE_PATH` (default `var/dev.sqlite3`). Tests never touch it: each test
gets a fresh database in a temporary directory with every migration applied.

## Tests and checks

```sh
cd api
ruff check . && ruff format --check .
mypy
pytest --cov=app
```

## Migrations

Schema changes are numbered SQL files in `api/migrations/`.
`python -m app.persistence.migrate` applies the pending ones in order and
records each in the `schema_migrations` table. Add a new file for every change;
never edit a migration that has been applied.

## API keys

Clients send `Authorization: Bearer <key>`. Only the SHA-256 hash of a key is
stored. Issue and revoke keys with:

```sh
python -m app.keys create <partner-name>
python -m app.keys revoke <key-id>
```

## Endpoints

- `GET /health`: database reachability.
- `POST /surveys/{slug}/responses`: submit a response (API key required).
- `GET /surveys/{slug}/responses`: list responses (API key required).
