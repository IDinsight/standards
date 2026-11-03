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

`POST /records/export` saves the records you would get from `GET /records` as
a CSV file and returns the same CSV in the response. Only administrators can
export.

### Request

An export takes the same query parameters as listing, `status`, `owner`, and
`q`, with the same rules: all given filters must match, blank values and other
parameters are ignored, and an unknown `status` is rejected. The export
contains exactly the records `GET /records` returns for the same query, in
`id` order. A request body is ignored.

Example: `POST /records/export?status=active&owner=marco` exports marco's
active records.

### Response

On success the status is `201` and the headers are:

- `content-type: text/csv; charset=utf-8`
- `content-disposition: attachment; filename="records-<YYYYMMDDTHHMMSSZ>.csv"`

The body is the CSV described below, identical to the file the export saves.

### CSV format

- UTF-8 without a byte order mark.
- The first row is the header `id,title,owner,status,createdAt`, followed by
  one row per record.
- Every row, including the last, ends with CRLF (carriage return and line
  feed).
- A field that contains a comma, a double quote, or a line break (CR or LF) is
  enclosed in double quotes, and each double quote inside it is written twice.
  Other fields are written as they are.

### Saved files

Each export is also saved as `records-<YYYYMMDDTHHMMSSZ>.csv`, named from the
UTC time of the request, in the service's export folder. The folder is
`exports`, relative to the service's working directory, unless the service is
created with a different `exportDir`; the first export creates it. The service
does not remove export files. Two exports in the same second get the same
name, and the later one replaces the earlier file.

### Export errors

- No signed-in user: `401` with `{"error": "authentication required"}`.
- Signed in as `editor` or `viewer`: `403` with `{"error": "forbidden"}`.
- Unknown `status`: `400` with `{"error": "unknown status: <value>"}`.

A rejected export writes no file.

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
