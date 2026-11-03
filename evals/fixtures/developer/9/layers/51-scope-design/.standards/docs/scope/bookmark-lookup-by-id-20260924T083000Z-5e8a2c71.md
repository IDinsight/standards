<!-- STANDARDS
Artifact: SCOPE
Cycle: bookmark-lookup-by-id-20260924T083000Z-5e8a2c71
-->

# Bookmark Lookup by Id

## Goal

Clients that already know a bookmark's id can fetch that bookmark directly
instead of listing every bookmark and filtering on their side.

## Constraints

- Existing `GET /bookmarks` and `POST /bookmarks` behavior stays unchanged.
- Responses keep the service's JSON error shape `{ "error": "<code>" }`.

## Non-goals

- Updating or deleting bookmarks.
- Filtering or searching by tag.

## Work

### 1. Single-bookmark lookup

**Intent:** Give clients a direct way to read one bookmark, with predictable
responses for missing bookmarks and for server-side failures.

**Done when:**

- `AC-001`: `GET /bookmarks/:id` for a stored bookmark returns status 200 with
  that bookmark's `id`, `url`, `title`, and `tags`.
- `AC-002`: `GET /bookmarks/:id` for an id that is not stored, or that is not a
  positive integer, returns status 404 with `{ "error": "not_found" }`.
- `AC-003`: When reading the bookmark store fails, `GET /bookmarks/:id` returns
  status 500 with exactly `{ "error": "internal_error" }`; the response never
  contains error messages, file paths, or stack traces, and the failure is
  logged on the server.

**Depends on:** None
