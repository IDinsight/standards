# orders

Small order-tracking service for the warehouse team. It keeps orders in
memory and serves them over HTTP.

## Development

- `npm start` — start the service (port from `PORT`, default 3000)
- `npm test` — run the tests

## Endpoints

- `GET /orders` — all orders as JSON, newest first
