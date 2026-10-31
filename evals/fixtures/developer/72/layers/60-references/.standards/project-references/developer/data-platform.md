# Internal data platform

Read when work reads from or writes to the internal data platform.

visits-api reads visit rows from the platform's `visits` dataset. Some
deployments also write daily summaries to `visit_summaries`.

## Sessions

- Open platform access with `dp_session()` from `app/data/platform.py` and keep
  the `with` block around the reads; do not hold a session across requests.

## Reads

- Always pass `visit_date` when reading `visits`; unfiltered reads scan the
  whole dataset and time out.
- Partition keys use `visit_date` as a UTC calendar date. Convert local dates
  before querying.

## Writes

- Send writes in batches of at most 500 rows per request.
- Tag every written row with `source_system="visits-api"` so the platform team
  can trace it.
