# contacts

A small contacts service: validation, an in-memory store, and handler
functions that return `(status, body)` tuples.

- `app/validation.py` checks incoming contact data.
- `app/service.py` adds and fetches contacts.
- `app/store.py` keeps contacts in memory and enforces unique email addresses.

Run the tests with `python3 -m pytest tests/test_service.py`.
