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

## Exporting records as CSV

`POST /records/export` saves the records an administrator is looking at as a
CSV file and returns the same CSV in the response.

- Who: administrators only. Without a signed-in user the request gets `401`
  `{"error": "authentication required"}`; an `editor` or `viewer` gets `403`
  `{"error": "forbidden"}`. A denied request writes nothing.
- Filters: the same `status`, `owner`, and `q` query parameters as
  `GET /records`, with the same rules, so an export contains exactly the
  records that listing returns for the same query. An unknown `status` gets
  `400` and writes nothing. Any request body is ignored.
- Response: `201` with `content-type: text/csv; charset=utf-8` and
  `content-disposition: attachment; filename="records-<timestamp>.csv"`. The
  body is the CSV text.
- File: the service also writes the CSV to
  `<export folder>/records-<timestamp>.csv`, where `<timestamp>` is the UTC
  time of the request as `YYYYMMDDTHHMMSSZ` (for example
  `records-20260924T090000Z.csv`). The export folder is `exports/` in the
  service's working directory unless the app is created with another
  `exportDir`; it is created on the first export. The file and the response
  body are identical.

### CSV format

- UTF-8 without a byte order mark.
- A header row `id,title,owner,status,createdAt`, then one row per record in
  `id` order. Every row, including the last, ends with CRLF.
- A field containing a comma, a double quote, or a line break (CR or LF) is
  enclosed in double quotes, and each double quote inside it is doubled
  (RFC 4180). Other fields are written as they are.
- When no record matches, the file and the body contain only the header row;
  the status is still `201`.

Example: `POST /records/export?owner=dana` returns and saves

```csv
id,title,owner,status,createdAt
1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

### Things to know

- Two exports in the same second get the same file name; the later one
  replaces the earlier file.
- The service does not remove export files.
- `GET /records/export` returns `405`; use `POST`.

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
