# Using the records service

The records service backs the internal records admin tool. Every request
carries the signed-in user; requests without one are rejected.

## Roles

- `admin`, `editor`, and `viewer` can all list records.
- Only `admin` can export records as CSV.
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

## Exporting records as CSV

`POST /records/export` saves the records you are listing as a CSV file and
returns the same CSV in the response. It takes the same `status`, `owner`, and
`q` query parameters as `GET /records`, with the same validation, and exports
exactly the records `GET /records` lists for that query, ordered by `id`. Any
request body is ignored.

Only administrators can export. A request without a signed-in user gets `401`
with `{"error": "authentication required"}`, and an `editor` or `viewer` gets
`403` with `{"error": "forbidden"}`. A `status` other than `active` or
`archived` gets `400` with `{"error": "unknown status: <value>"}`. None of
these requests writes a file.

A successful export returns `201` with these headers:

- `content-type: text/csv; charset=utf-8`
- `content-disposition: attachment; filename="records-<YYYYMMDDTHHMMSSZ>.csv"`

The body is identical to the file the service writes.

Example: an administrator sends `GET /records/export?owner=dana` at
2026-09-24 09:00:00 UTC. The response is `200` with
`content-disposition: attachment; filename="records-20260924T090000Z.csv"` and
this body:

```csv
id,title,owner,status,createdAt
1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

### CSV format

- UTF-8 without a byte order mark.
- A header row `id,title,owner,status,createdAt`, then one row per record.
  Every row, including the last, ends with CRLF.
- A field that contains a comma, a double quote, or a line break (CR or LF) is
  enclosed in double quotes, and each double quote inside it is doubled
  (RFC 4180). Other fields are written as they are.

### Export files

- Each export is written to `records-<YYYYMMDDTHHMMSSZ>.csv` in the export
  folder, named after the UTC time of the request.
- The export folder is `exports`, relative to the service's working
  directory, unless `createApp({ exportDir })` sets another one. It is created
  when missing and is ignored by git.
- Two exports in the same second get the same file name; the later one
  replaces the earlier file. The service never removes export files.

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
