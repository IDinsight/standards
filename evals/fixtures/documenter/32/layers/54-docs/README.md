# records-admin

Backend for the internal records admin tool: an in-memory record store, role
checks, and request handlers called in-process. See
[docs/usage.md](docs/usage.md) for how to list and filter records and
[docs/api/reference.md](docs/api/reference.md) for the Python API.

## Development

Requires Python 3.11 or later. Tests use pytest; there are no other
dependencies.

    python3 -m pytest

## API reference

`docs/api/reference.md` is generated from the docstrings of the modules listed
in `tools/apidoc.json`. To update it, change the docstrings and run

    python3 tools/apidoc.py

`tests/test_apidoc.py` fails when the committed reference no longer matches the
docstrings (`python3 tools/apidoc.py --check` runs the same comparison).

## Layout

- `recordsvc/store.py`: record store
- `recordsvc/filters.py`: query parameter parsing
- `recordsvc/auth.py`: users, roles, and the `authorize` helper; every handler
  checks roles server-side with it
- `recordsvc/api.py`: handlers and the `App` route table
- `recordsvc/seed.py`: seed records
- `tools/apidoc.py`, `tools/apidoc.json`: API reference generator and its
  module list
- `tests/`: pytest suites
