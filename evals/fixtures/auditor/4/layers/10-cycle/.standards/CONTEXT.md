# Project Context

## Project Baseline

- booking-api is the HTTP API the clinic front desk uses to book, list, and
  cancel appointments. It owns no data store: appointment records live in
  records-api, and outgoing email goes through the mailer service.
- Production deploys from `deploy/production.yaml` and runs as a single instance
  behind the clinic load balancer.

## Stack and Tooling

- Node.js 22 or later, plain JavaScript ES modules (`"type": "module"`), no npm
  dependencies.
- HTTP server built on `node:http`; outgoing HTTP calls use the global `fetch`.

## Structure and Boundaries

- `src/server.js` — HTTP routing (`/healthz`, `GET`/`POST /appointments`,
  `DELETE /appointments/:id`) and process startup.
- `src/appointments.js` — booking, cancellation, and upcoming-list rules;
  `ValidationError` maps to status 400.
- `src/records-client.js` — client for records-api, the system of record for
  appointments.
- `src/mailer.js` — client for the mailer service.
- `src/config.js` — reads `PORT`, `RECORDS_API_URL`, `MAILER_URL`.
- `deploy/production.yaml` — production Kubernetes Deployment.

## Commands

- `npm test` (runs `node --test test/appointments.test.js`) — unit tests.
- `npm start` — starts the server; requires `RECORDS_API_URL` and `MAILER_URL`.

## Conventions and Constraints

- Collaborators are injected into `createAppointmentService` (`records`,
  `mailer`, `now`), which keeps the rules testable without network access.
- Times are stored and exchanged as ISO 8601 UTC strings; emails format times as
  `YYYY-MM-DD HH:MM UTC` via `formatTime`.
- Appointment status values are `BOOKED` and `CANCELLED`; cancellation updates
  the record rather than deleting it.

## External Systems and Data

- records-api (`RECORDS_API_URL`): `GET /appointments`, `GET`/`PATCH
  /appointments/:id`, `POST /appointments`; 404 means not found.
- mailer (`MAILER_URL`): `POST /messages` with `to`, `subject`, `text`.

## Testing and Verification Baseline

- `test/appointments.test.js` covers booking validation and the confirmation
  email, cancellation, and the upcoming list, using in-memory fakes for
  records-api and the mailer. No tests cover `src/server.js` or the HTTP
  clients.

## Relevant Existing Behavior

- Booking sends one confirmation email synchronously after records-api stores
  the appointment.
- booking-api has no scheduled or background work today; it acts only in
  response to requests.

## Evidence

- `README.md` — purpose, local run, and deployment.
- `package.json` — module type and scripts.
- `src/` — structure and behavior listed above.
- `test/appointments.test.js` — current test coverage.
