# SQL Development Style

Apply with `universal.md` for SQL, migrations, and query implementation.

- Follow the project's database engine, migration tool, naming conventions, and
  supported compatibility level.
- Use parameterized queries or the established query builder. Never interpolate
  untrusted values into SQL text.
- Name columns explicitly in production queries and data movement. Avoid
  `SELECT *` across durable or external boundaries.
- Make null semantics intentional in predicates, joins, constraints, and writes.
- Use transactions when multiple writes must succeed or fail as one logical
  operation; keep transaction scope no broader than necessary.
- Add or change constraints when they represent an established invariant, not as
  an incidental guess about product behavior.
- Treat destructive schema changes, migration compatibility, online rollout,
  backfills, locking risk, and cross-version coexistence as architecture when
  they are consequential and not already designed.
- Add indexes only when the access pattern and project constraints justify them;
  consider write cost and existing indexes rather than indexing reflexively.
- Specify ordering whenever result order is part of observable behavior.
- Keep migrations deterministic and compatible with the repository's deployment
  and rollback expectations.
