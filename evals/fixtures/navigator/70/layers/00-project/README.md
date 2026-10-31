# orders-client

Small client for the orders service. Requests that fail with a temporary
network error are retried with exponential backoff (see `src/retry.js`).

Run the tests with `npm test`.
