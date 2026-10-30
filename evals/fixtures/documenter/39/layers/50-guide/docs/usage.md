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

`POST /records/export` writes the records that match the listing filters to a
CSV file on the server and returns the same CSV in the response. Only
administrators can export; the role check runs before anything is written.

### Request

The query parameters are the same as for `GET /records`: `status`, `owner`,
and `q`, with the same validation (see [Filtering](#filtering)). Blank values
and other parameters are ignored, and any request body is ignored. Without
filters, every record is exported.

Example: `POST /records/export?owner=dana` exports dana's records.

### Response

A successful export returns `201` with these headers:

- `content-type: text/csv; charset=utf-8`
- `content-disposition: attachment; filename="records-20260924T090000Z.csv"`,
  naming the file that was written

The response body is the CSV, identical to the contents of that file.

### CSV format

- UTF-8 without a byte order mark.
- A header row `id,title,owner,status,createdAt`, then one row per record,
  ordered by `id`.
- Every row, including the last, ends with CRLF (`\r\n`).
- A field that contains a comma, a double quote, or a line break (CR or LF) is
  enclosed in double quotes, and each double quote inside it is doubled
  (RFC 4180). Other fields are written as they are; `createdAt` is written as
  stored.

For `POST /records/export?owner=dana` with the seed data:

```csv
id,title,owner,status,createdAt
1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

### Export files

- Each export is written to `exports/records-<YYYYMMDDTHHMMSSZ>.csv`, named
  with the UTC time of the request, for example `records-20260924T090000Z.csv`.
- The folder defaults to `exports`, relative to the service's working
  directory, and is created when missing. Code that embeds the app can choose
  another folder with `createApp({ exportDir })`. `exports/` is ignored by git.
- Two exports in the same second get the same file name; the later one
  replaces the earlier file.
- The service never removes export files.

### Export errors

- No signed-in user: `401` with `{"error": "authentication required"}`.
- `editor` or `viewer`: `403` with `{"error": "forbidden"}`.
- Invalid `status`: `400` with `{"error": "unknown status: <value>"}`.

When an export request fails, nothing is written: no file, and no folder if it
did not already exist.

## Errors

Errors are JSON objects of the form `{"error": "..."}`:

| Status | Meaning                                                  |
| ------ | -------------------------------------------------------- |
| 400    | Invalid query parameter                                  |
| 401    | No signed-in user                                        |
| 403    | Role not allowed for this route, such as a non-admin export |
| 404    | Unknown path                                             |
| 405    | Known path, unsupported method                           |
| 500    | Unexpected server error                                  |
