# records

In-memory record store and request router used by our internal tools.

## API

Call `route(store, method, path, body, query)` from `src/routes.js`. Every
response is `{ status, body }`.

| Method | Path           | Result                                                         |
| ------ | -------------- | -------------------------------------------------------------- |
| POST   | `/records`     | 201 with the created record; 400 without a title               |
| GET    | `/records`     | 200 with all records; `q` filters by title (case-insensitive)  |
| GET    | `/records/:id` | 200 with the record, or 404                                    |
| PATCH  | `/records/:id` | 200 with the updated record, or 404                            |
| DELETE | `/records/:id` | 204, or 404                                                    |

## Development

Run the tests with `npm test`.
