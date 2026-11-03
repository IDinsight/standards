# Project Context

## Project Baseline

- `beneficiary-registry` is an established Django REST Framework service that
  field coordinators and program staff use to register beneficiaries of a
  cash-transfer program and look them up by village. It runs in production on
  AWS ECS (Fargate) against MySQL 8.0 on Amazon RDS.
- Beneficiaries are created one at a time through `POST /api/beneficiaries/`.
  Villages are loaded by an administrator with the `load_villages` management
  command. There is no bulk path for beneficiaries.

## Stack and Tooling

- Python 3.11 (`Dockerfile` base `python:3.11-slim`; CI `setup-python` 3.11).
- Django 4.2 LTS and Django REST Framework 3.15, pinned in `requirements.txt`.
- MySQL 8.0 through `mysqlclient` (`django.db.backends.mysql`, charset
  `utf8mb4`, `STRICT_TRANS_TABLES`). Production database on Amazon RDS in
  `af-south-1`; CI uses the `mysql:8.0` service image.
- Celery 5.4 with Redis as the broker (`CELERY_BROKER_URL`; Amazon ElastiCache
  in production), used for side effects after a write commits.
- gunicorn serves the web container with 3 workers and a 60-second worker
  timeout.
- Tests: pytest 8 with pytest-django (`requirements-dev.txt`, `pytest.ini`).
- CI/CD: GitHub Actions (`.github/workflows/ci.yml`) runs the tests against
  MySQL and, on `main`, builds the image, pushes it to Amazon ECR, and deploys
  the ECS task definition.

## Structure and Boundaries

- `registry/` — project package: settings, URL root (`/api/`, `/api/token/`,
  `/health/`, `/admin/`), WSGI entry point, and the Celery app.
- `beneficiaries/models.py` — `Village` (unique `code`) and `Beneficiary`
  (unique `national_id`; foreign keys to `Village` and to the creating user).
- `beneficiaries/serializers.py` — `BeneficiarySerializer`, the single place
  where per-record validation rules live: required fields, `sex` choices, no
  future `date_of_birth`, phone format, village by existing code, and
  `national_id` uniqueness from the model.
- `beneficiaries/views.py` — `BeneficiaryViewSet` (`ModelViewSet`) and the
  read-only `VillageViewSet`, routed by a `DefaultRouter` in
  `beneficiaries/urls.py`.
- `beneficiaries/tasks.py` — `send_registration_sms`, a Celery task that posts
  to the SMS gateway with up to 3 retries.
- `beneficiaries/management/commands/load_villages.py` — village CSV loader.
- `deploy/ecs/task-definition.json` — Fargate task with `web` and `worker`
  containers built from one image; `Dockerfile` builds that image.

## Nearest Analogues

- `beneficiaries/management/commands/load_villages.py` — reads a CSV with
  `csv.DictReader` (`utf-8-sig`), checks required columns, and writes all rows
  in one `transaction.atomic()` block. It is an administrator command, updates
  existing villages, and reports no per-row errors. The requested import is an
  authenticated API operation that must not change existing beneficiaries.
- `BeneficiaryViewSet.perform_create` — saves with `created_by` set to the
  request user and queues `send_registration_sms` with
  `transaction.on_commit`, so a rolled-back write sends nothing.

## Commands

- `pip install -r requirements-dev.txt` — install runtime and test
  dependencies.
- `pytest` — run the test suite; needs a MySQL server and the
  `DJANGO_SECRET_KEY` and `DB_*` environment variables.
- `python manage.py makemigrations --check --dry-run` — CI check that models
  and migrations agree.
- `python manage.py migrate` — apply migrations.
- `python manage.py load_villages <csv>` — load or update villages.
- `celery -A registry worker -l info` — run the worker locally.

## Conventions and Constraints

- API authentication is `TokenAuthentication` or `SessionAuthentication`; the
  default permission class is `DjangoModelPermissions`, so creating a
  beneficiary requires `beneficiaries.add_beneficiary` and unauthenticated
  requests are refused.
- Villages are referenced by `code` through a `SlugRelatedField`.
- Side effects such as SMS are queued with `transaction.on_commit`.
- Schema changes go through Django migrations. The web container runs
  `python manage.py migrate --noinput` before starting gunicorn.
- Configuration comes from environment variables; production secrets are
  injected from AWS Secrets Manager by the task definition.
- List endpoints paginate with `PageNumberPagination`, 50 per page.
- No upload size settings are customized; Django defaults apply.

## External Systems and Data

- MySQL 8.0 on Amazon RDS (`registry` database, `registry_app` user).
- Redis broker on Amazon ElastiCache.
- SMS gateway: JSON `POST` to `SMS_GATEWAY_URL` with a bearer token, called
  only from the worker.
- AWS: ECR repository `beneficiary-registry`, ECS cluster `registry-prod`,
  service `beneficiary-registry`, CloudWatch Logs group
  `/ecs/beneficiary-registry`.

## Testing and Verification Baseline

- `beneficiaries/tests/test_api.py` covers single-record creation, refusal
  without the add permission, duplicate national ID, future date of birth, and
  the village filter. SMS dispatch is asserted by patching
  `send_registration_sms.delay` and running on-commit callbacks with
  `django_capture_on_commit_callbacks`.
- Tests run against MySQL, never SQLite; CI provides the server.
- Django and a MySQL server were not available in the audit environment, so
  the suite was not run during this audit. The facts above come from the source
  and CI configuration.

## Relevant Existing Behavior

- Single-record create, list, retrieve, update, and delete behavior, including
  the `?village=<code>` filter, is relied on by coordinators and must stay
  unchanged.
- `national_id` uniqueness is enforced by the serializer and by the database
  unique index.
- A registration SMS is queued for every created beneficiary; the task skips
  records without a phone number.

## Known Unknowns

- The load balancer in front of the ECS service, including its idle timeout, is
  managed outside this repository. Only gunicorn's 60-second worker timeout is
  evidenced here.
- RDS and ElastiCache sizing are managed outside this repository.

## Evidence

- `requirements.txt`, `requirements-dev.txt`, `pytest.ini` — stack and test
  tooling.
- `registry/settings.py` — MySQL engine and options, DRF authentication,
  permissions and pagination, Celery broker, SMS settings.
- `beneficiaries/models.py`, `beneficiaries/serializers.py`,
  `beneficiaries/views.py`, `beneficiaries/tasks.py` — records, validation,
  API behavior, SMS side effect.
- `beneficiaries/management/commands/load_villages.py` — existing CSV import.
- `Dockerfile`, `deploy/ecs/task-definition.json`, `.github/workflows/ci.yml` —
  image, ECS deployment, CI.
