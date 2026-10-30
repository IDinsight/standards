# taskboard

Core of a small task-tracking service: an in-memory task store and request
handlers that return `{ status, body }` objects. The host application mounts
the handlers and passes query-string values through as strings.

## Development

Requires Node.js 22. Run the tests with `npm test`.
