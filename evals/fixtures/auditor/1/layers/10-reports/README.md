# expense-tracker

Small HTTP API for recording and reviewing employee expenses. Node 22, no
third-party dependencies.

## Running

    npm start

Listens on `PORT` (default 3000). Configuration comes from environment
variables:

- `PORT`: port to listen on.
- `API_KEYS`: comma-separated `key:userId:role` entries; `role` is `admin` or
  `member`.
- `DATA_FILE`: path to a JSON file holding the expense records. When unset, the
  server starts from `data/sample.json` and keeps changes in memory only.

## API

Every request needs an `x-api-key` header. Members see only their own
expenses; admins see everyone's and may pass `owner=<userId>` to narrow a list
or report.

- `GET /expenses?from=YYYY-MM-DD&to=YYYY-MM-DD&category=<category>`: list
  expenses, oldest first. All filters are optional.
- `GET /expenses/:id`: one expense.
- `POST /expenses`: create an expense for the caller. Body:
  `{ "date", "merchant", "category", "amountCents", "description"? }`.
- `GET /reports/monthly?month=YYYY-MM`: totals for a month, overall and by
  category.

Responses are JSON. Amounts are returned both as integer `amountCents` and as a
formatted decimal string `amount` (for example `"12.50"`).

Categories: `travel`, `meals`, `lodging`, `supplies`, `other`.

## Tests

    npm test
