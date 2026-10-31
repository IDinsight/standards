# Fieldbook API

Account sign-up and password reset for the Fieldbook web app.

## Running

```sh
uvicorn app.main:app --reload
```

Configuration comes from environment variables:

- `FIELDBOOK_DB`: SQLite file (default `fieldbook.db`)
- `SMTP_HOST`, `SMTP_PORT`: outgoing mail server (default `localhost:25`)
- `MAIL_FROM`: sender address

## Tests

```sh
python -m pytest
```
