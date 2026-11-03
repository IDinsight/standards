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
- `POST /invoices/:id/share`, `GET /shared/:token`, `DELETE /shared/:token`:
  see Share links.

Amounts are integer cents. Invalid input returns `400` with `{ error }`.

## Share links

A share link gives read-only access to a single invoice and nothing else.

- `POST /invoices/:id/share` creates a link and returns `201` with
  `{ token, expiresAt }`; `404` for an unknown invoice.
- `GET /shared/:token` returns the invoice, or `404` once the link has expired
  or been revoked.
- `DELETE /shared/:token` revokes the link (`204`); `404` if it is unknown or
  already revoked.

Links expire seven days after creation. They are kept in memory, so they do not
survive a restart.
