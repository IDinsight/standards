# records-admin

In-memory record store behind the internal records admin tool. See
[docs/usage.md](docs/usage.md) for how to use the Python API.

## Development

Requires Python 3.11 or later and pytest. The package uses only the
standard library.

    python3 -m pytest

## Layout

- `records/models.py`: the `Record` type
- `records/store.py`: `RecordStore` with listing filters and CSV export
- `tests/`: pytest suite
- `docs/usage.md`: usage guide

## Conventions

- Public classes, functions, and methods have docstrings that describe what
  they do.
