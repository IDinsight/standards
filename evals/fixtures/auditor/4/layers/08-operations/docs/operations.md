# Operating booking-api

## Deployment

Production runs from `deploy/production.yaml` in the `clinic` namespace.
Deploys are rolling updates: new pods start and pass the `/healthz` readiness
probe before old ones stop, so for a short time old and new versions serve
traffic together.

## Instances

booking-api runs as several replicas behind the clinic load balancer, and any
replica may receive any request.

Application instances must be stateless. A pod can be stopped, rescheduled, or
added at any time (deploys, node maintenance, scaling), so:

- Do not keep anything in process memory that another instance needs or that
  must survive a restart.
- Appointment data and any other durable or shared state belong in records-api.
- Work must not depend on a particular instance staying up.

## Logs and health

- Logs go to stdout and are collected by the cluster.
- `GET /healthz` returns `{"ok": true}` when the process can serve requests.
