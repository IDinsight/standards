# customers

Customer profile records backed by SQLite, with handler functions for reading
and editing a customer's profile.

## Layout

- `app/api.py` — profile handlers returning `(status, body)` tuples.
- `app/service.py` — validation and normalization of profile edits.
- `app/repository.py` — SQL access to the `customers` table.
- `app/models.py` — the `Customer` record.
- `app/db.py` — opens the database and applies migrations.
- `app/migrations/` — numbered schema migrations.

## Schema changes

Add a new file `app/migrations/NNN_description.sql` with the next number.
Migrations run in order when `app.db.connect()` opens a database, and the
highest applied number is stored in `PRAGMA user_version`. Do not edit a
migration that has already shipped.

## Tests

    python3 -m pytest -q
