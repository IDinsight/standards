# hookpost

Delivers webhook payloads through a transport you supply, and signs request
bodies.

- `deliver(send, payload)` calls `send(payload)`, which resolves to
  `{ status }` or rejects on a network error, and returns
  `{ delivered, attempts, status, error }`.
- `signPayload(secret, body)` returns the `sha256=<hex>` value for the
  signature header.

Run the tests with `npm test`.
