# Invoice API

All endpoints are read-only `GET` requests; other methods return `405`. JSON
responses follow [the API conventions](../conventions.md).

## List invoices

`GET /invoices`

The optional query parameter `status` (`open`, `paid`, or `void`) limits the
results to invoices with that status.

Response `200`:

```json
{
  "invoices": [
    {
      "id": "INV-1001",
      "customer": "Northwind Traders",
      "issued_at": "2026-08-03T14:20:00.000Z",
      "amount_cents": 125000,
      "currency": "USD",
      "status": "paid"
    }
  ]
}
```

## Get one invoice

`GET /invoices/{id}` returns one invoice object, or `404` with
`{"error": "invoice not found"}`.

## CSV export

`GET /invoices/export.csv` returns every invoice as CSV with the header row
`id,customer,issued_at,amount_cents,currency,status`. Fields containing a
comma, double quote, or newline are quoted, with embedded quotes doubled.
