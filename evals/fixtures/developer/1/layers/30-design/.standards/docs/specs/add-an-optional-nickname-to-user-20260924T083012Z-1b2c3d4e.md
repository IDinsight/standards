<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-an-optional-nickname-to-user-20260924T083012Z-1b2c3d4e
-->

# Technical Design

## Context

The scope adds an optional nickname to profiles, returned by the profile
handlers and limited to 32 characters, while existing stored profiles keep
loading. Project context establishes that `ProfileStore` owns the schema and
creates it on open with no migrations framework, `ProfileService` owns
normalization and validation (raising `ValueError` before saving), and
`put_profile` is a full replacement that maps `ValueError` to status 400.

## Decision

Store the nickname as a nullable column on the existing `profiles` table, carry
it on the `Profile` model, validate it in `ProfileService`, and expose it in
both handler responses. Existing databases gain the column when a store opens.

## Acceptance Coverage

- `AC-001`: `nickname` field on `Profile`, nullable `profiles.nickname` column, service normalization and length rule, optional `nickname` key in the `put_profile` body.
- `AC-002`: the shared response body built in `app/api.py` always includes `nickname`.
- `AC-003`: `ProfileService.update_profile` raises `ValueError` before `ProfileStore.save`; `put_profile` keeps its existing 400 mapping.
- `AC-004`: `ProfileStore` adds the missing column on open; existing rows read as NULL and load with `nickname` set to `None`.

## Components

- `app/models.py` — `Profile` gains `nickname: str | None = None` as its last
  field, so existing three-argument constructor calls stay valid.
- `app/store.py` — schema includes the column; column upgrade on open; `get`
  and `save` read and write `nickname`.
- `app/service.py` — `update_profile(user_id, display_name, email,
  nickname=None)` normalizes and validates the nickname.
- `app/api.py` — reads the optional `nickname` key from the PUT body and
  includes `nickname` in every 200 response body.

## Interfaces and Contracts

- Persistence: `profiles.nickname TEXT` (nullable, no default). New databases
  create it in `CREATE TABLE`. When opening an existing database whose
  `profiles` table lacks the column (detected with
  `PRAGMA table_info(profiles)`), run
  `ALTER TABLE profiles ADD COLUMN nickname TEXT` once. Existing rows are NULL.
- PUT body: `nickname` is optional. Absent or `null` means no nickname (stored
  NULL), consistent with PUT being a full replacement. A string is trimmed; an
  empty result is stored as NULL. Length is counted in characters after
  trimming and must be at most 32. Any other type is invalid.
- Errors: a nickname longer than 32 characters raises
  `ValueError("nickname must be at most 32 characters")`; a non-string,
  non-null value raises `ValueError("nickname must be a string")`. Both reach
  the client as status 400 with `{"error": "<message>"}` through the existing
  handler mapping.
- Responses: GET 200 and PUT 200 bodies contain exactly `user_id`,
  `display_name`, `email`, and `nickname` (string or `null`). 404 and 400
  bodies keep their current shape.

## Data and Control Flow

`put_profile` reads the body and calls `ProfileService.update_profile`, which
applies the existing `display_name` and `email` rules first, then the nickname
rules, then builds the `Profile` and calls `ProfileStore.save`. Every
`ValueError` is raised before `save`, so a rejected update leaves the stored row
unchanged.

## Technical Acceptance Criteria

- `AC-001`: A PUT with a nickname of 1 to 32 characters after trimming stores and returns the trimmed value; a PUT without `nickname`, with `null`, or with a whitespace-only string stores NULL and returns `null`.
- `AC-002`: Every 200 response body from `get_profile` and `put_profile` has exactly the keys `user_id`, `display_name`, `email`, and `nickname`.
- `AC-003`: A nickname of 33 or more characters after trimming returns 400 and `ProfileStore.get` returns the previously stored profile unchanged.
- `AC-004`: Opening a database file created with the three-column schema succeeds, adds the column, and loads existing profiles with `nickname` `None`; reopening the upgraded file does not try to add the column again.

## Build Plan

1. Model and store: field, schema, and column upgrade on open.
2. Service: nickname normalization and validation.
3. Handlers: request field and response shape.

## Risks and Follow-up

- Clients that send PUT without `nickname` clear an existing nickname. Accepted:
  this matches the established full-replacement semantics.

## Alternatives

- A separate partial-update handler for the nickname: rejected because the
  project has no partial-update convention.
