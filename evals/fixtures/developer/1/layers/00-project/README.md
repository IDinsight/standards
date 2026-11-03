# profiles

Profile storage and a small handler-style API for the account service.

- `app/store.py` — SQLite persistence (`ProfileStore`)
- `app/service.py` — input normalization (`ProfileService`)
- `app/api.py` — handlers returning `(status, body)` tuples

Run the tests from the repository root with `python3 -m pytest`.
