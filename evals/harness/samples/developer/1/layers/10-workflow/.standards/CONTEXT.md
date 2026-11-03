# Project Context

Python 3.12 package `app` with a SQLite-backed `ProfileStore` (app/store.py),
a `ProfileService` that normalizes input (app/service.py), and handler
functions returning `(status, body)` tuples (app/api.py). Tests use pytest in
tests/. No migrations framework: the schema is created on start.
