# Volunteer Portal

Sign-up portal for local volunteer events. The web app lives in `web/` and is a
Next.js (App Router) project backed by Postgres.

## Running locally

```sh
cd web
cp .env.example .env.local   # fill in values
npm install
npm run dev
```

The database schema is in `web/db/schema.sql`.

There is no automated test suite yet; `npm run lint` runs ESLint.
