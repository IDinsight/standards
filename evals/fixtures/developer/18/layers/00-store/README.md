# admin-records

In-memory store and request handlers for back-office admin records.

Each record has `id`, `name`, `email`, and `role` (`owner`, `admin`, or
`support`). Names are trimmed and emails are lowercased on save.

## Tests

    npm test
