# booking-api

HTTP API the clinic front desk uses to book, list, and cancel appointments.
Appointment data lives in records-api; booking-api calls it over HTTP and sends
confirmation emails through the mailer service.

## Running locally

```sh
RECORDS_API_URL=http://localhost:9001 MAILER_URL=http://localhost:9002 npm start
```

`PORT` defaults to 8080.

## Tests

```sh
npm test
```

## Deployment

Production deploys from `deploy/production.yaml` as a single instance behind
the clinic load balancer.
