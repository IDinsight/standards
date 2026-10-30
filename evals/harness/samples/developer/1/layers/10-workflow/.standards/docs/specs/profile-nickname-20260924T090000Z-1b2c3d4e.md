<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: profile-nickname-20260924T090000Z-1b2c3d4e
-->

# Technical Design

## Decisions

- Persistence: add a nullable `nickname TEXT` column to `profiles`; add it
  with `ALTER TABLE` when missing so existing databases keep working.
- API contract: `PUT` accepts an optional `nickname`; `GET` and `PUT`
  responses always include `nickname` (string or null).
- Boundaries: validation lives in `ProfileService`; `api.py` maps a
  `ValueError` to status 400. `ProfileStore` only persists.

## Acceptance Coverage

- `AC-001`: nullable column plus service validation (length <= 32).
- `AC-002`: response shape in api.py includes nickname.
- `AC-003`: service raises ValueError before saving; api.py returns 400.
