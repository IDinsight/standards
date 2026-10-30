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
{ "count": 1, "records": [ { "id": 4, "title": "Insurance renewal 2026", "owner": "marco", "status": "active", "createdAt": "2026-04-18T16:20:00Z" } ] }
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

`POST /records/export` writes the records that match the listing filters to a
CSV file and returns the same CSV. Only administrators can export.

The query parameters are the ones `GET /records` accepts (`status`, `owner`,
`q`), validated the same way, so an export contains exactly the records
`GET /records` lists for the same query, in the same order. A request body is
ignored.

Example: `POST /records/export?owner=dana` exports dana's records.

### Response

A successful export returns `201` with:

- `content-type: text/csv; charset=utf-8`
- `content-disposition: attachment; filename="records-<YYYYMMDDTHHMMSSZ>.csv"`
- the CSV as the body

### CSV format

- UTF-8 without a byte order mark.
- A header row `id,title,owner,status,createdAt`, then one row per record,
  ordered by `id`.
- Every row, including the last, ends with CRLF.
- A field that contains a comma, a double quote, or a line break (CR or LF)
  is enclosed in double quotes, and each double quote inside it is doubled
  (RFC 4180). Other fields are written as they are.

With the seed data, the example above returns (shown with plain line breaks;
the service writes CRLF):

```csv
id,title,owner,status,createdAt
1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

### Export files

Each successful export is also written to the export folder as
`records-<YYYYMMDDTHHMMSSZ>.csv`, named after the UTC time of the request; the
file holds exactly the response body. The folder is `exports/` under the
service's working directory unless `createApp` is given another `exportDir`.
It is created when missing and is ignored by git.

Two exports in the same second get the same file name, and the later one
replaces the earlier file. The service does not remove export files.

### When an export is refused

- No signed-in user: `401` with `{"error": "authentication required"}`.
- An `editor` or `viewer`: `403` with `{"error": "forbidden"}`.
- An invalid `status`: `400` with `{"error": "unknown status: <value>"}`.

A refused export creates no export folder and writes no file.

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
