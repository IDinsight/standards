# members-api

NestJS API behind the volunteer portal.

## Development

```sh
pnpm install
pnpm run build
pnpm start      # listens on PORT, default 3000
pnpm test
```

## Endpoints

- `GET /health`: liveness check.
- `POST /auth/login`: exchanges `email` and `password` for an access token
  (200), or returns 401 for unknown email or wrong password.
