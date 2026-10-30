# Using the records service

The records service backs the internal records admin tool. Every request
carries the signed-in user; requests without one are rejected.

## Roles

- `admin`, `editor`, and `viewer` can all list records.
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

Administrators can save the records they are looking at as a CSV file with
`POST /records/export`. Only `admin` users can export: a request without a
signed-in user gets `401` and an `editor` or `viewer` gets `403`, and no file
is written in either case.

The export accepts the same `status`, `owner`, and `q` query parameters as
`GET /records`, with the same validation, and contains exactly the records
`GET /records` lists for them, ordered by `id`. An invalid `status` returns
`400` and writes no file. Any request body is ignored.

A successful export writes the CSV to
`exports/records-<YYYYMMDDTHHMMSSZ>.csv`, named with the UTC time of the
request, and creates the `exports` folder when it is missing. The folder is
relative to the service's working directory; `createApp` accepts a different
`exportDir`. The response has status `201`, the headers
`content-type: text/csv; charset=utf-8` and
`content-disposition: attachment; filename="records-<YYYYMMDDTHHMMSSZ>.csv"`,
and the same CSV as its body.

The CSV starts with the header row `id,title,owner,status,createdAt`, then has
one row per record, and every row ends with CRLF. A value that contains a
comma, a double quote, or a line break is enclosed in double quotes, and each
double quote inside it is doubled.

Example: `POST /records/export?owner=dana` returns

```csv
id,title,owner,status,createdAt
1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

Two exports in the same second get the same file name; the later one replaces
the earlier file.

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
