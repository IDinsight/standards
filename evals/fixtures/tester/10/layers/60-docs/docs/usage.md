# Using the records service

The records service backs the internal records admin tool. Every request
carries the signed-in user; requests without one are rejected.

## Roles

- `admin`, `editor`, and `viewer` can all list records.
- Only `admin` can export records.
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

`POST /records/export` saves the records that `GET /records` would list for
the same query as a CSV file and returns the same CSV. It accepts the
`status`, `owner`, and `q` filters described above, with the same
validation; an invalid `status` returns `400` and no file is saved.

A successful export returns `201` with `content-type: text/csv; charset=utf-8`
and a `content-disposition` header naming the file, for example
`attachment; filename="records-20260924T090000Z.csv"`.

The CSV starts with the header row `id,title,owner,status,createdAt`, lists
records by `id`, and ends every row with CRLF. A field that contains a comma,
a double quote, or a line break is enclosed in double quotes, with each double
quote inside it doubled, so spreadsheet programs read titles such as
`Lease agreement, Building B` correctly.

Editors and viewers get `403`, and a request without a signed-in user gets
`401`; no file is saved in either case.

Example: `POST /records/export?owner=dana` exports dana's records.

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
