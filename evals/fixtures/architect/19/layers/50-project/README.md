# beneficiary-registry

Django REST Framework service for registering cash-transfer program
beneficiaries and looking them up by village. Backed by MySQL 8.0.

## Local development

```sh
python -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
export DJANGO_SECRET_KEY=dev DJANGO_DEBUG=true DB_USER=root DB_PASSWORD=root
python manage.py migrate
python manage.py runserver
```

Run the tests with `pytest` against a local MySQL 8.0 server.
