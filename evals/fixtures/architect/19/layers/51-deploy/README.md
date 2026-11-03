# beneficiary-registry

Django REST Framework service for registering cash-transfer program
beneficiaries and looking them up by village. Backed by MySQL 8.0 and deployed
to AWS ECS.

## Local development

```sh
python -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
export DJANGO_SECRET_KEY=dev DJANGO_DEBUG=true DB_USER=root DB_PASSWORD=root
python manage.py migrate
python manage.py runserver
```

A MySQL 8.0 server is required, for example
`docker run -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=registry -p 3306:3306 mysql:8.0`.
The Celery worker that sends registration SMS needs Redis:

```sh
celery -A registry worker -l info
```

## Tests

Run `pytest` with the same environment variables against a MySQL server. CI
runs the suite against the `mysql:8.0` service image.

## Loading villages

```sh
python manage.py load_villages villages.csv
```

The file needs the columns `code`, `name`, and `district`. Existing villages
are updated by code.

## API

- `POST /api/token/` returns a token for a username and password.
- `/api/beneficiaries/` lists, creates, retrieves, updates, and deletes
  beneficiaries. Filter the list with `?village=<code>`.
- `/api/villages/` lists villages.

Creating a beneficiary requires the `beneficiaries.add_beneficiary`
permission. When the record has a phone number, a registration SMS is queued
after the record is saved.

## Deployment

Pushes to `main` run CI. When the tests pass, the workflow builds the image,
pushes it to the `beneficiary-registry` ECR repository, and deploys
`deploy/ecs/task-definition.json` to the `beneficiary-registry` service in the
`registry-prod` ECS cluster (`af-south-1`). The web container applies
migrations before starting gunicorn; the worker container runs Celery. Secrets
come from AWS Secrets Manager.
