# status-service

Small HTTP service that reports health and build status for the deployment
dashboard.

## Endpoints

- `GET /health` returns `{"status":"ok"}`.
- `GET /status` returns the service version and uptime in seconds.

Other paths return 404; other methods on the endpoints above return 405.

## Development

```sh
pnpm install
pnpm start        # listens on PORT, default 8080
pnpm test
```
