# survey-service

FastAPI service for building surveys and recording field responses. Data lives
in PostgreSQL through SQLModel.

## Development

    pip install -e '.[dev]'
    fastapi dev app/main.py

The service reads `DATABASE_URL` (default
`postgresql+psycopg://surveys:surveys@localhost:5432/surveys`).

## Tests

    python -m pytest

The suite starts a disposable PostgreSQL 16 container with testcontainers, so
Docker must be running. To use an existing database instead, set
`TEST_DATABASE_URL` (for example
`postgresql+psycopg://postgres:postgres@localhost:5432/surveys_test`); the
suite creates and drops its tables there.

## Paper responses

Responses collected on paper are loaded with
`python -m app.surveys.importer <survey-id> <csv-file> <user-email>`. The CSV
has one column per question id.
