# exports-service

Queues report exports for client accounts and posts each result to the
client's callback URL.

## API

- `POST /exports` with `{ "report": "monthly-usage", "callbackUrl": "https://..." }`
  returns `202` and `{ "exportId": "...", "status": "queued" }`.
- `GET /exports/:id` returns the export's current record.

Available reports: `monthly-usage`, `active-accounts`.

## Callbacks

When an export finishes, the service sends `POST <callbackUrl>` with
`{ "exportId", "status": "done", "rowCount" }` or
`{ "exportId", "status": "failed", "error" }`.

Each callback carries `x-exports-signature: sha256=<hex>`, the HMAC-SHA256 of
the exact request body with the shared `CALLBACK_SECRET`. Receivers must verify
it before trusting the body.

## How it works

The API publishes `export.requested` on an in-process message bus; the export
worker builds the report, updates the record, and sends the callback. Logs are
JSON lines on stdout.

An hourly scheduler publishes `exports.purge`; the purge worker removes
finished exports older than seven days.

## Development

Node 22, no dependencies.

    npm test
    PORT=8080 CALLBACK_SECRET=change-me npm start
