# Records API

All endpoints accept `GET` only and return JSON. Other methods return `405`;
unknown paths return `404`.

## Paging

List endpoints are paged with two query parameters:

- `page`: 1-based page number. Default 1.
- `pageSize`: number of items per page. Default 20, maximum 50. Larger values
  are treated as 50.

Paged responses have the shape `{ items, page, pageSize, total }`, where
`pageSize` is the page size actually applied and `total` counts all items
across pages.

## GET /records

Returns all records in insertion order, paged as described above. Each item is
`{ id, name, email }`.
