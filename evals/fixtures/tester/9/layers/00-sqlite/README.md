# records-service

Record storage and listing for the internal records admin tool.

Records are stored in SQLite (`records.db` by default). Tests use an
in-memory database, so they need no setup:

    python -m pip install -e '.[test]'
    python -m pytest

## Layout

- `app/filters.py`: listing filters (status, owner, title text)
- `app/repository.py`: record storage and queries
- `tests/`: pytest suites
