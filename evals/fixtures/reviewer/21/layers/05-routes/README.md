# records-admin

Backend for the internal records admin tool: an in-memory record store, role
checks, and a small request/response route layer. The tool's host process
creates the app with `createApp()` from `src/app.js` and passes each request to
`handle(request)`; this repository has no HTTP listener. See
[docs/usage.md](docs/usage.md) for listing and filtering records.

## Development

Requires Node 22.

    npm test

Plain JavaScript ES modules; no dependencies and no build step.

## Layout

- `src/records/`: record store, seed records, and query filters
- `src/auth/`: roles and the `authorize` helper; every route handler checks
  roles server-side with it
- `src/http/`: errors, response helpers, and the router
- `src/routes/`: route handlers
- `src/app.js`: wires the store and routes together
- `test/`: `node:test` suites
