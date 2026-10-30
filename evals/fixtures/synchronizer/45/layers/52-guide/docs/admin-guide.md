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
