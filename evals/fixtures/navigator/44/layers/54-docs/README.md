# orders

Small order-tracking service for the warehouse team. It keeps orders in
memory and serves them over HTTP.

## Development

- `npm start` — start the service (port from `PORT`, default 3000)
- `npm test` — run the tests

## Endpoints

- `GET /orders` — all orders as JSON, newest first
- `GET /orders.csv` — the same orders as CSV (`text/csv`), newest first, with
  the columns `id,customer,total,placed_at`. Fields containing commas, double
  quotes, or line breaks are quoted, and embedded quotes are doubled, so the
  file opens correctly in a spreadsheet.
