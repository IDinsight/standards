# hookrelay

Sends signed webhook events to subscriber endpoints.

- `src/signing.js` — HMAC-SHA256 signatures, sent as `x-hookrelay-signature`.
- `src/webhook.js` — `deliver(endpoint, event)` posts one event to one endpoint.
- `src/dispatch.js` — sends one event to every endpoint in a list.

Run the tests with `npm test`.
