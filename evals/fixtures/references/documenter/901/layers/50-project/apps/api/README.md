# datahub API

FastAPI service that accepts CSV uploads and imports them in the background.

## Setup

Install [uv](https://docs.astral.sh/uv/), then from this folder run:

```sh
uv sync
```

Copy `.env.example` to `.env`, adjust the values, and export them in your
shell before starting the server.

## Run

```sh
uv run uvicorn app.main:app --reload
```

## Test

```sh
uv run pytest
```

## Configuration

| Name           | Default                  | Purpose                                         |
| -------------- | ------------------------ | ----------------------------------------------- |
| `DATABASE_URL` | `sqlite:///./datahub.db` | SQLite database for import jobs and API tokens. |
| `STORAGE_DIR`  | `./uploads`              | Folder where uploaded files are stored.         |

## API

The contract is [openapi.yaml](openapi.yaml) in this folder.

- `POST /imports` uploads a CSV file (multipart field `file`) and returns the
  new import job.
- `GET /imports/{import_id}` returns an import job. It requires a bearer token;
  tokens are stored as SHA-256 hashes in the `api_tokens` table.
