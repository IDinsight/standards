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

`POST /records/export` saves the records a query selects as a CSV file and
returns the same CSV. Only administrators can export.

### Request

- Query parameters: the same `status`, `owner`, and `q` filters as
  `GET /records`, with the same validation. Without filters the export holds
  every record. Any request body is ignored.

### Response and file

- `201` with `content-type: text/csv; charset=utf-8` and
  `content-disposition: attachment; filename="records-<timestamp>.csv"`. The
  body is the CSV.
- The same CSV is written to `exports/records-<timestamp>.csv`, where
  `<timestamp>` is the UTC time of the request as `YYYYMMDDTHHMMSSZ`. The
  folder is created when it is missing.
- Two exports in the same second get the same file name; the later one
  replaces the earlier file. The service never removes export files.

### CSV format

- UTF-8 without a byte order mark.
- A header row `id,title,owner,status,createdAt`, then one row per record in
  `id` order. Every row, including the last, ends with CRLF.
- A field that contains a comma, a double quote, or a line break is enclosed
  in double quotes, and each double quote inside it is doubled. Other fields
  are written as they are.

Example: `POST /records/export?owner=dana` at 09:00:00 UTC on 24 September
2026 returns and writes `exports/records-20260924T090000Z.csv`:

```csv
id,title,owner,status,createdAt
1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z
3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z
```

### Export errors

- No signed-in user: `401` with `{"error": "authentication required"}`.
- `editor` or `viewer`: `403` with `{"error": "forbidden"}`.
- Invalid `status`: `400` with `{"error": "unknown status: <value>"}`.

No folder or file is created for a request that gets an error.

### Export folder

Export files go to `exports` under the service's working directory. Code that
creates the app can choose another folder with the `exportDir` option, and can
fix the timestamp with `now`, for example in tests:

```ts
import { createApp } from './src/app.ts';

const app = createApp({
  exportDir: '/var/lib/records/exports',
  now: () => new Date('2026-09-24T09:00:00Z'),
});
```

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
