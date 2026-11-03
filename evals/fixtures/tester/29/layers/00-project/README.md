# order-desk

In-memory order store and route handlers that return `{ status, headers, body }`
objects for the host HTTP server.

- `handleOrders(store, query)`: orders as JSON, with an optional `status` filter.

Totals are stored in integer cents and formatted at the response boundary.

Run the tests with `npm test`.
