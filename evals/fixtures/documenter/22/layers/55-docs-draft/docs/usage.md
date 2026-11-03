# Using the records service

The records service backs the internal records admin tool. Every request
carries the signed-in user; requests without one are rejected.

## Roles

- `admin`, `editor`, and `viewer` can all list records.
- Only `admin` can export records (`POST /records/export`).
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

**Administrators can save the filtered records list as a CSV file.**

You start an export with `POST /records/export`. It accepts the same query
parameters as listing, validated the same way, and ignores any request body:

| Parameter | Values                 | Notes                                                 |
| --------- | ---------------------- | ----------------------------------------------------- |
| `status`  | `active` or `archived` | Any other value returns `400` and no file is written. |
| `owner`   | owner username         | Exact match, for example `marco`.                     |
| `q`       | any text               | Case-insensitive; must appear in the title.           |

Heads up: every successful export also writes a file on the server. It goes
into the export folder (`exports/` by default) and is named
`records-<YYYYMMDDTHHMMSSZ>.csv` after the UTC time of the request. Two
exports in the same second share a name, and the later one replaces the
earlier file.

A successful export returns `201` with the headers
`content-type: text/csv; charset=utf-8` and
`content-disposition: attachment; filename="<file name>"`. The response body
is the CSV text, identical to the file written.

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
