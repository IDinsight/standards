# contacts

A small contact-book service. `create_contact` in `app/handlers.py` validates
the incoming payload and stores the contact in SQLite.

Run the tests with:

```
python3 -m pytest -q tests/test_contacts.py
```
