# Using the records service

The records service backs the internal records admin tool. Every request
carries the signed-in user; requests without one are rejected.

## Roles

- `admin`, `editor`, and `viewer` can all list records.
- Only `admin` can export records (see [Exporting records](#exporting-records)).
- A request without a signed-in user gets `401`; a role that is not allowed
  for a route gets `403`. Role checks run on the server in every handler.

## Listing records

`GET /records` returns JSON:

```json
{ "count": 2, "records": [ { "id": 4, "title": "Insurance renewal 2026", "owner": "marco", "status": "active", "createdAt": "2026-04-18T16:20:00Z" } ] }
```

Records are ordered by `id`. Each record has `id`, `title`, `owner`,
`status` (`active` or `archived`), and `createdAt` (ISO 8601, UTC).

## Filtering

Query parameters narrow the list; all given filters must match:

- `status`: `active` or `archived`. Any other value returns `400` with
  `{"error": "unknown status: <value>"}`.
- `owner`: exact owner username, for example `marco`.
- `q`: case-insensitive text that must appear in the title.

Blank values and other parameters are ignored.

Example: `GET /records?status=active&owner=marco` lists marco's active records.

## Exporting records

Administrators can save the records they are looking at as a CSV file.

`POST /records/export` takes the same `status`, `owner`, and `q` query
parameters as `GET /records`, with the same validation, and exports exactly the
records that `GET /records` lists for that query, ordered by `id`. Any request
body is ignored.

Example: `POST /records/export?owner=dana` exports dana's records.

On success the service:

- writes the CSV to a file named `records-<YYYYMMDDTHHMMSSZ>.csv` (the UTC time
  of the request) in its export folder, `exports/` by default, creating the
  folder when needed; and
- returns `201` with `content-type: text/csv; charset=utf-8`, a
  `content-disposition: attachment; filename="<file name>"` header, and the same
  CSV as the body.

The CSV is UTF-8 with the header row `id,title,owner,status,createdAt` and one
row per record; every row ends with CRLF. A value containing a comma, a double
quote, or a line break is enclosed in double quotes, and double quotes inside it
are doubled, so spreadsheet programs read titles such as
`Lease agreement, Building B` correctly:

```csv
id,title,owner,status,createdAt
1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

A request without a signed-in user gets `401`, an `editor` or `viewer` gets
`403`, and an invalid `status` gets `400`. In each of these cases no file is
written.

Two exports made within the same second share a file name; the later one
replaces the earlier file.

## Errors

Errors are JSON objects of the form `{"error": "..."}`:

| Status | Meaning                                  |
| ------ | ---------------------------------------- |
| 400    | Invalid query parameter                  |
| 401    | No signed-in user                        |
| 403    | Role not allowed for this route          |
| 404    | Unknown path                             |
| 405    | Known path, unsupported method           |
| 500    | Unexpected server error                  |
