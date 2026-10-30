# records-admin

Backend for the internal records admin tool: an in-memory record store, role
checks, and a small request/response route layer. The admin tool's help page
is [docs/usage.html](docs/usage.html).

## Development

Requires Node 22. There are no npm dependencies.

    npm test

`tools/convert_legacy.py` regenerates `data/seed.json` from the old admin
tool's spreadsheet dump. It needs Python 3 and has its own tests:

    python3 -m pytest tools

## Layout

- `src/store.js`, `src/filter.js`: record store and query filters
- `src/auth.js`: roles and the `authorize` helper; every route handler checks
  roles server-side with it
- `src/http.js`, `src/errors.js`: response helpers, errors, and the router
- `src/routes/`: route handlers
- `src/app.js`: wires the store and routes together
- `data/seed.json`: seed records
- `tools/`: Python maintenance scripts
- `test/`: `node:test` suites
