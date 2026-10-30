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

`POST /records/export` saves the records matching the given filters as a CSV
file and returns the same CSV in the response. The filters are the same as for
listing (`status`, `owner`, `q`), with the same validation, so an export holds
exactly the records `GET /records` lists for the same query, in the same order.

Example: `POST /records/export?owner=dana` exports dana's records.

- Only administrators can export. A request without a signed-in user gets
  `401` and an editor or viewer gets `403`; no file is written.
- An unknown `status` gets `400`; no file is written.
- A successful export returns `201` with
  `content-type: text/csv; charset=utf-8` and a `content-disposition` header
  naming the file.

### CSV format

- The first row is the header `id,title,owner,status,createdAt`, followed by
  one row per record ordered by `id`. Every row ends with CRLF.
- A value that contains a comma, a double quote, or a line break is enclosed
  in double quotes, and each double quote inside it is doubled. For example,
  the title `Q2 "priority" accounts review` is written as
  `"Q2 ""priority"" accounts review"`.
- Files are UTF-8 without a byte order mark.

### Export files

- Each export is saved as `exports/records-<YYYYMMDDTHHMMSSZ>.csv`, named
  after the UTC time of the request, in the service's working directory. The
  folder is created on the first export.
- Two exports in the same second get the same name; the later one replaces
  the earlier file.
- Export files are not removed automatically.
- The service keeps records in memory only, so an export file is the copy of
  the record list as it was when the export was made.

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
