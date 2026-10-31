# relay

Forwards events received on `POST /events` to a configured webhook target,
retrying deliveries that fail.

## Commands

- `node bin/relay.js` — start the relay (needs `TARGET_URL`).
- `node bin/relay.js --print-config` — print the effective configuration.
- `node --test test/config.test.js test/deliver.test.js` — run the tests
  (also `npm test`).

Configuration and day-to-day operation are described in
[docs/operations.md](docs/operations.md).
