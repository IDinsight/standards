# API conventions

These conventions apply to every JSON endpoint in the billing service. Follow
them when adding or changing endpoints.

## Field names

Response fields use snake_case.

## Timestamps

Timestamps are ISO 8601 strings in UTC with millisecond precision and a `Z`
suffix, as produced by `Date.prototype.toISOString()`, for example
`"2026-08-03T14:20:00.000Z"`. Timestamp field names end in `_at`.

## Money

Amounts are integers in the currency's minor unit (cents for USD and EUR) in
fields whose names end in `_cents`, for example `"amount_cents": 125000` for
1,250.00. Each amount is accompanied by a three-letter ISO 4217 `currency`
code.

## Errors

Errors return a 4xx status with a JSON body `{"error": "<message>"}`.

## Collections

List endpoints wrap results in an object keyed by the resource name, for
example `{"invoices": [...]}`.

## Example

An invoice as returned by `GET /invoices/INV-1001`:

```json
{
  "id": "INV-1001",
  "customer": "Northwind Traders",
  "issued_at": "2026-08-03T14:20:00.000Z",
  "amount_cents": 125000,
  "currency": "USD",
  "status": "paid"
}
```
