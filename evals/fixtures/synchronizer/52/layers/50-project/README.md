# cronlet

A tiny interval scheduler for local maintenance jobs.

Jobs are read from a JSON file (see `jobs.example.json`); each job has a
`name`, a `command`, and an `interval`.

Run the tests with `npm test`.
