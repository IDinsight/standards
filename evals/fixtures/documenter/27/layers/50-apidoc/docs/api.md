# Records API reference

A compact reference for the records service. The [usage guide](usage.md)
explains each request in more detail.

## Endpoints

| Method | Path       | Allowed roles         | Success response                       |
| ------ | ---------- | --------------------- | -------------------------------------- |
| GET    | `/records` | admin, editor, viewer | `200` `{"count": n, "records": [...]}` |

`GET /records` accepts the query parameters `status`, `owner`, and `q`; see
[Filtering](usage.md#filtering).

## Record fields

| Field       | Type   | Description                               |
| ----------- | ------ | ----------------------------------------- |
| `id`        | number | Unique record id; lists are ordered by it |
| `title`     | string | Record title                              |
| `owner`     | string | Owner username                            |
| `status`    | string | `active` or `archived`                    |
| `createdAt` | string | Creation time, ISO 8601 in UTC            |

## Error statuses

`400`, `401`, `403`, `404`, `405`, and `500`, each with a body of the form
`{"error": "..."}`. See [Errors](usage.md#errors) for their meaning.
