# records-admin

Backend for the internal records admin tool: an in-memory record store seeded
with sample records, server-side role checks, and a small request/response
route layer that is exercised in-process.

## Development

Requires Python 3.11 or later; the service uses only the standard library.

    python3 -m pytest      # run the tests
    python3 -m mypy        # type check (strict; configured in pyproject.toml)

mypy is a development tool, not a dependency of the service; install it
separately to run the type check.

## Layout

- `records/store.py`: record type, store, and listing filters
- `records/filters.py`: query parameters to store filters
- `records/auth.py`: roles and the `authorize` helper; every route handler
  checks roles server-side with it
- `records/http.py`: request/response types and the router
- `records/routes.py`: route handlers
- `records/app.py`: wires the store and routes together
- `records/seed.py`: seed records
- `tests/`: pytest suites
