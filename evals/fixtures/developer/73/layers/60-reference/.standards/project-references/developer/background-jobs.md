# Background jobs

Read when work adds background or scheduled jobs.

The team standard for background and scheduled work in our Python services is
Celery with a Redis broker.

- Put tasks in `app/tasks/<area>.py` and register them with the shared
  `celery_app` defined in `app/worker.py`.
- For tasks that call external services, use `acks_late=True` and
  `autoretry_for` with exponential backoff (`retry_backoff=True`,
  `retry_backoff_max=600`).
- Read the broker URL from `REDIS_URL`. Run workers with
  `celery -A app.worker worker --loglevel=info`, and beat with
  `celery -A app.worker beat` for scheduled jobs.
- Add `redis` and `worker` services to `docker-compose.yml`.
- Keep task arguments small and JSON-serializable: pass IDs, not objects.
