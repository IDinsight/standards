# ledger-api

Account lookup handlers for the ledger service.

- `src/session.js` signs and verifies HS256 session tokens
  (`header.payload.signature`, signing key chosen by the header's `kid`).
- `src/handlers.js` exposes `getAccount`, which serves `GET /accounts/:id` for
  the bearer of a valid session.

Run the tests with `npm test`.
