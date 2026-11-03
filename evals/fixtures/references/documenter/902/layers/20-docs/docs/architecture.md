# Architecture

imports-api is a single FastAPI application backed by SQLite. It has no
background workers: each upload is parsed and recorded within its request.

## Modules

- `app/main.py` creates the FastAPI application, builds the settings, storage,
  and import service once at startup, and defines the HTTP routes.
- `app/settings.py` reads `DATABASE_URL` and `UPLOAD_DIR` from the environment,
  falling back to local defaults under `./data`.
- `app/storage.py` holds `ImportStore`, a thin wrapper around one SQLite table of
  import records, and `sqlite_path`, which accepts only `sqlite:///` URLs.
- `app/imports/service.py` holds `ImportService`, which turns an uploaded file
  into a stored import.
- `app/imports/parser.py` turns CSV text into rows and reports any problem as a
  `ParseError`. Its public entry point is `parse_csv`.

## Upload flow (`POST /imports`)

1. The route reads the uploaded file's bytes.
2. `ImportService.create` decodes them as UTF-8 (a byte order mark is allowed)
   and passes the text to `parse_csv`.
3. `parse_csv` checks that the header includes `sku`, `name`, and `quantity`,
   then converts each data row, trimming values, skipping rows whose required
   values are all empty, and requiring an integer `quantity`.
4. On success the service records the import with status `completed` and the
   row count, writes the original file to `UPLOAD_DIR/<id>.csv`, and the route
   returns the record with status 201.
5. A decoding or parsing problem raises `ParseError`; the route returns status
   422 with the message in `detail`. Nothing is recorded or written.

## Lookup flow (`GET /imports/{import_id}`)

The route asks the service for the record and returns it, or status 404 with
`detail` set to `Import not found`.

## Data

The `imports` table (`id`, `filename`, `status`, `row_count`, `created_at`) is
created when the application starts if it does not exist. Rows of an uploaded
file are not stored; the original file in `UPLOAD_DIR` is kept instead.

## API contract

[`openapi.yaml`](../openapi.yaml) is the contract for clients. Keep it in step
with the routes in `app/main.py`.
