# Using the records service

The records service backs the internal records admin tool. Every request
carries the signed-in user; requests without one are rejected.

## Roles

- `admin`, `editor`, and `viewer` can all list records; only `admin` can
  export them.
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

`POST /records/export` saves the records that `GET /records` would list for
the same query parameters as a CSV file, and returns the same CSV in the
response. Only administrators can export: a request without a signed-in user
gets `401` and an editor or viewer gets `403`. A rejected request creates no
file.

- Filters: `status`, `owner`, and `q`, exactly as for listing. An unknown
  `status` returns `400` with `{"error": "unknown status: <value>"}` and
  creates no file.
- Response: `201` with `content-type: text/csv; charset=utf-8`,
  `content-disposition: attachment; filename="records-<timestamp>.csv"`, and
  the CSV as the body.
- File: `exports/records-<YYYYMMDDTHHMMSSZ>.csv`, named from the UTC time of
  the request, relative to the service's working directory. The folder is
  created when missing and is not tracked by git.
- Format: UTF-8, a header row `id,title,owner,status,createdAt`, then one row
  per record ordered by `id`. Every row ends with CRLF. A field containing a
  comma, double quote, or line break is enclosed in double quotes, and double
  quotes inside it are doubled:

  ```csv
  id,title,owner,status,createdAt
  1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
  3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
  ```

- Two exports in the same second share a file name; the later one replaces
  the earlier file.

Example: `POST /records/export?owner=dana` saves and returns dana's records.

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
