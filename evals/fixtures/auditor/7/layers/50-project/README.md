# invoicing

Small invoicing service: an in-memory invoice store and request handlers that
return `{ status, body }` replies.

## Development

Requires Node 22. TypeScript runs through Node's type stripping; there is no
build step and there are no dependencies.

    npm test

## Routes

- `GET /invoices` lists invoices.
- `POST /invoices` creates an invoice from `{ customer, amountCents, issuedOn }`.
- `GET /invoices/:id` fetches one invoice.

Amounts are integer cents. Invalid input returns `400` with `{ error }`.
