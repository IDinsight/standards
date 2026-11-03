# imports-api

HTTP service that accepts CSV inventory files, validates them, and records each
import so it can be looked up later.

## Requirements

- Python 3.11 or later
- [uv](https://docs.astral.sh/uv/)

## Setup

```sh
uv sync
cp .env.example .env
```

The defaults in `.env.example` keep the SQLite database and uploaded files under
`./data`, which the service creates when it first needs it.

## Running

```sh
uv run uvicorn app.main:app --reload --env-file .env
```

The API listens on http://127.0.0.1:8000. FastAPI serves interactive docs at
`/docs`; the maintained contract is [`openapi.yaml`](openapi.yaml).

## Testing

```sh
uv run pytest
```

## Configuration

| Variable       | Default                       | Purpose                                 |
| -------------- | ----------------------------- | --------------------------------------- |
| `DATABASE_URL` | `sqlite:///./data/imports.db` | SQLite database that records imports    |
| `UPLOAD_DIR`   | `./data/uploads`              | Directory where uploaded files are kept |

Only `sqlite:///` URLs are supported.

## CSV format

Upload a UTF-8 file (a byte order mark is allowed) whose first line is a header
that includes `sku`, `name`, and `quantity`. Other columns are ignored. Values
are trimmed, rows where `sku`, `name`, and `quantity` are all empty are skipped,
and `quantity` must be an integer. A file that breaks these rules is rejected
with status 422 and a message naming the problem and, for row errors, the line.

## Project layout

- `app/main.py`: application setup and HTTP routes.
- `app/settings.py`: configuration from the environment.
- `app/storage.py`: SQLite storage for import records.
- `app/imports/service.py`: runs an import from upload to stored record.
- `app/imports/parser.py`: parses and validates uploaded CSV files.

[`docs/architecture.md`](docs/architecture.md) describes how these fit together.
