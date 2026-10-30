# accounts-admin

Internal admin console for customer accounts. Staff use it to list, view, and
edit account records.

- `app/models.py`: the `Account` record.
- `app/store.py`: SQLite persistence. Schema changes are appended to
  `MIGRATIONS`; `PRAGMA user_version` tracks which ones a database has applied.
- `app/admin.py`: the admin edit form and its update handler. Form fields are
  declared in `FIELDS`; fields that may be left blank are listed in `OPTIONAL`.

Run the tests with `python3 -m pytest`.
