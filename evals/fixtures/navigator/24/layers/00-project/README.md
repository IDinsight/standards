# orders

Small order service with an in-memory store.

## Layout

- `src/store.js` — in-memory order storage.
- `src/handlers/orders.js` — request handlers for creating, fetching, and listing orders.
- `src/server.js` — `route(method, path, body)` dispatches requests to the handlers.

Handlers return `{ status, body }` objects.

## Tests

```
npm test
```
