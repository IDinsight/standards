# hookrelay

Delivers outgoing webhook events for the dispatcher service. Each event is
POSTed as JSON to the subscriber's URL and the outcome is logged.

- `src/relay.js` — `relayBatch()`, the entry point the dispatcher calls.
- `src/deliver.js` — delivery of a single event.
- `src/http.js` — the HTTP sender used in production.
- `src/config.js` — settings read from the environment.

Operators: see [docs/operations.md](docs/operations.md).

Run the tests with `npm test`.
