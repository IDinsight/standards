# invoice-intake

Turns supplier invoice documents into structured invoice records.

## Layout

- `app/settings.py`: configuration, read once at import from `.env` and the
  environment.
- `app/extract/store.py`: `InvoiceStore`, SQLite storage for invoice records.
- `tests/`: pytest tests.

## Configuration

Copy `.env.example` to `.env` and adjust it. Environment variables override
values in `.env`.

## Tests

    python3 -m pytest

The project uses only the Python standard library; pytest is the only tool
needed to run the tests.
