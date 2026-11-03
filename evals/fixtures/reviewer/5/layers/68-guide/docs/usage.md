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
the same query parameters as a CSV file, and returns the same CSV. Only
administrators can export: a request without a signed-in user gets `401`, an
`editor` or `viewer` gets `403`, and no file is created.

The export accepts the filters described under Filtering (`status`, `owner`,
`q`) with the same validation: an unknown `status` returns `400` and no file
is created. The request body is ignored.

Example: `POST /records/export?owner=dana` exports dana's records.

A successful export returns `201` with:

- `content-type: text/csv; charset=utf-8`
- `content-disposition: attachment; filename="records-<timestamp>.csv"`,
  where `<timestamp>` is the export's UTC time as `YYYYMMDDTHHMMSSZ`, for
  example `records-20260924T090000Z.csv`
- a body identical to the saved file

The file is saved in the service's export folder, `exports/` under the
service's working directory unless the service is configured with another
folder; the folder is created when missing. Two exports in the same second
share a file name, and the later one replaces the earlier file.

### CSV format

- UTF-8, a header row `id,title,owner,status,createdAt`, then one row per
  record, ordered by `id`.
- Every row, including the last, ends with CRLF.
- A value containing a comma, a double quote, or a line break is enclosed in
  double quotes, and each double quote inside it is doubled, as RFC 4180
  describes. For example, the title `Q2 "priority" accounts review` is written
  as `"Q2 ""priority"" accounts review"`.

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
