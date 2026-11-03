# Operations

## Production database

- Engine: Amazon RDS for PostgreSQL 14, Multi-AZ deployment in `eu-west-1`.
- Size: about 40 GB of data.
- Backups: automated backups kept for 7 days.
- History: the instance was created on PostgreSQL 11 in 2019 and upgraded in
  place to PostgreSQL 14 in 2023. That upgrade kept the database unavailable
  for about 12 minutes.
- Clients: the API is the only client of the production database. Nothing else
  reads from or writes to it.
- Connection: the application reads `DATABASE_URL` from the deployment's
  secrets. The value is never committed.

## Releases

- Each release runs `alembic upgrade head` against production before the new
  application version starts serving traffic.
- Database changes outside migrations, such as instance settings or engine
  versions, are made by a team member with AWS access through the console or
  CLI and noted in this file.
