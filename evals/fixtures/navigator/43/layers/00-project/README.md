# fieldlog

Records species counts from field survey sites and sends them to the shared
project server.

- `src/observations.js`: input validation and the on-device observation store.
- `src/client.js`: client for the project server (`POST /api/observations`).
- `src/app.js`: recording and listing observations.

Run the tests with `npm test` (no network needed; the tests use a fake fetch).
