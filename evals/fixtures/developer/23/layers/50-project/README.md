# tokenhub

Signed bearer tokens shared by the HTTP API and the background job worker.

- `src/auth/token.js` issues and verifies HMAC-signed tokens (`sub`, `scopes`, `exp`).
- `src/api/handler.js` checks the `Authorization: Bearer` header before routing.
- `src/worker/consumer.js` checks the token attached to each job before running it.

Run the tests with `npm test`.
