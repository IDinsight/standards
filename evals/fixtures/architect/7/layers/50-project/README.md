# dispatch

Core of the dispatch message API: account API keys, bearer authentication, and
the request handlers. Handlers return `{ status, body }` objects and are mounted
by the HTTP adapter in the deployment repository.

Run the tests with `npm test`. Operational procedures are in
[`docs/operations.md`](docs/operations.md).
