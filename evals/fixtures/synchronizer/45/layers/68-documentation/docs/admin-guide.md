# Admin guide

This guide covers the records service for administrators.

## Signing in

Every request needs a signed-in user. Requests without one receive status 401.

## Listing records

`GET /records` returns records 50 at a time as JSON. Use `page` to move
through results and `status` to show only records with that status, for
example `GET /records?status=active&page=2`. The response includes `total`,
the number of matching records.

`GET /records/<id>` returns one record.

## Adding records

Only administrators can add records. Send `POST /records` with `name`,
`email`, `status`, and `createdAt`. Other users receive status 403.

## Exporting records

Administrators can download records as a CSV file for spreadsheets:

- `GET /records/export` downloads every record as `records.csv`.
- `GET /records/export?status=archived` downloads only the records with that
  status.

The file starts with a header row (`id,name,email,status,createdAt`) followed
by one line per record. Values that contain commas, double quotes, or line
breaks are wrapped in double quotes, with any double quotes inside doubled, so
spreadsheet programs read them correctly. Other users receive status 403.
