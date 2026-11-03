# Deploying records-admin

The image runs `node src/main.ts`, which listens on `PORT` (8080). Apply the
manifests with `kubectl apply -f deploy/kubernetes/`.

- `deploy/kubernetes/deployment.yaml` runs three replicas so the API stays
  available while a node is drained or a new version rolls out.
- `deploy/kubernetes/service.yaml` exposes them as `records-admin` on port 80.
  The Service balances requests across the replicas and does not pin a user
  to one of them.
- Each replica keeps its own seeded record store in memory. Records are
  read-only, so every replica returns the same data.

The gateway in front of the cluster signs users in and forwards them in the
`x-user-id`, `x-user-name`, and `x-user-role` headers. `GET /healthz` needs no
user and backs the readiness probe.
