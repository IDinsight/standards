# Operations

## Deploys

Every push to `main` deploys to Fly.io: `.github/workflows/deploy.yml` runs
`flyctl deploy --remote-only` with the `FLY_API_TOKEN` repository secret. The
deploy does not wait for CI.

Fly.io builds the image from `Dockerfile` and replaces the running machines
with new ones that pass the `/health` check in `fly.toml`.

## Database migrations

Deploys do not run migrations. When a release adds a file under
`migrations/versions/`, the person who merged it applies the migration once the
deploy has finished:

```sh
fly ssh console -C "alembic upgrade head"
```

and confirms the result:

```sh
fly ssh console -C "alembic current"
```

Until then the new version runs against the previous schema, so do this
straight after the deploy.

## Configuration

`DATABASE_URL` is a Fly.io secret and is not stored in the repository:

```sh
fly secrets set DATABASE_URL=postgresql+psycopg://...
```

Setting a secret restarts the machines.
