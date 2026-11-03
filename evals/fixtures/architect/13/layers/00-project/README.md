# portal-auth

Sign-in and session tokens for the member portal API. The portal's HTTP layer
calls these handlers; they return `{ status, headers, body }`.

- `npm test` runs the test suite (Node 22, no dependencies).
- Technical design: [docs/architecture.md](docs/architecture.md).
