# fieldwork

Python services for running household and facility surveys in the field.

- `apps/api`: FastAPI service for setting up and looking up surveys. See
  `apps/api/README.md`.
- `apps/worker`: background jobs that build reminders for enumerators with
  overdue assignments.
- `packages/shared`: Python package with survey codes and statuses used by both
  services.

Each app is its own uv project with its own lockfile. Run commands from the
app's folder, for example `cd apps/api && uv sync`.
