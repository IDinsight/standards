# API conventions

These conventions apply to every JSON endpoint in the billing service. Follow
them when adding or changing endpoints.

## Field names

Response fields use snake_case.

## Timestamps

Timestamps are integers holding Unix epoch seconds, for example `1785766800`.

## Money

Amounts are decimal strings in the invoice currency with two decimal places,
in an `amount` field, for example `"1250.00"`, alongside a `currency` code.

## Errors

Errors return a 4xx status with a JSON body `{"error": "<message>"}`.

## Collections

List endpoints wrap results in an object keyed by the resource name, for
example `{"invoices": [...]}`.
