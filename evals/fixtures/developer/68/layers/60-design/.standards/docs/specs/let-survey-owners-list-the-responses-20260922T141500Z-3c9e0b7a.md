<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: let-survey-owners-list-the-responses-20260922T141500Z-3c9e0b7a
-->

# Technical Design

## Context

The scope asks for an owner-only, paginated read of the responses submitted to a survey. The service already has what this needs (see `.standards/CONTEXT.md`): the `get_current_user` bearer-token dependency, owner-scoped survey queries in `app/surveys/service.py`, the `ResponseRead` schema returned by anonymous submission, and the `GET /surveys/` list with its pagination bounds. No project references apply.

## Decision

- Add `GET /surveys/{survey_id}/responses/` to the existing responses router in `app/responses/router.py`. Protect this route with `Depends(get_current_user)`. The router's `POST` stays anonymous, so authentication is applied per route, not on the router.
- Add `list_survey_responses(session, owner, survey_id, offset, limit) -> list[SurveyResponse] | None` to `app/responses/service.py`. It returns `None` when no survey with `survey_id` is owned by `owner`, so a missing survey and another owner's survey are indistinguishable; otherwise it returns the requested page. The router maps `None` to 404 with detail `Survey not found`.
- Ownership is decided on the server from the authenticated `User` against `Survey.owner_id`; the request carries no owner value.
- Items use the existing `ResponseRead` schema; the body is a plain JSON array, matching `GET /surveys/`.
- Pagination: query parameters `offset` (integer, at least 0, default 0) and `limit` (integer, 1 to 100, default 50), validated by FastAPI so out-of-range values return 422. Ordering is `submitted_at` ascending, then `id` ascending for ties; ordering, offset, and limit are applied in the database query.
- Persistence: a composite index on `survey_responses (survey_id, submitted_at)` replaces the single-column `survey_id` index, added through an Alembic revision.

## Acceptance Coverage

- `AC-001`: New `GET /surveys/{survey_id}/responses/` route on the responses router, backed by `list_survey_responses` in the responses service; items are serialized with the existing `ResponseRead` schema.
- `AC-002`: Route-level `Depends(get_current_user)` provides the 401; the owner-scoped survey check in the service returns `None` for missing or unowned surveys, which the router maps to 404.
- `AC-003`: `offset` and `limit` query parameters with validated bounds; ordering and paging in the database query, supported by the `(survey_id, submitted_at)` index.

## Components

- `app/responses/router.py` — the HTTP route, auth dependency, parameter validation, and the `None` to 404 mapping.
- `app/responses/service.py` — the owner check and the page query; no HTTP types.
- `app/responses/model.py` and a new Alembic revision — the composite index.

## Interfaces and Contracts

- `GET /surveys/{survey_id}/responses/?offset=<int>&limit=<int>` with `Authorization: Bearer <token>`:
  - 200: JSON array of `ResponseRead` objects (`id`, `survey_id`, `respondent_ref`, `answers`, `submitted_at`), possibly empty.
  - 401: missing, invalid, or expired token, or inactive user, raised by `get_current_user`.
  - 404: detail `Survey not found` when the survey does not exist or belongs to another user.
  - 422: `offset` below 0, `limit` below 1 or above 100, or non-integer values.
- `list_survey_responses(session: Session, owner: User, survey_id: int, offset: int, limit: int) -> list[SurveyResponse] | None`.
- `POST /surveys/{survey_id}/responses/` is unchanged and remains anonymous.

## Data and Control Flow

The router authenticates the caller through `get_current_user` and validates `offset` and `limit`, then calls the service with the authenticated `User`. The service confirms that a survey with `id = survey_id` and `owner_id = owner.id` exists and returns `None` if not. Otherwise it selects that survey's responses ordered by `submitted_at`, then `id`, with offset and limit applied in SQL, and returns the page, which the router serializes through `ResponseRead`.

## Technical Acceptance Criteria

- `AC-001`: An owner's request returns 200 with that survey's responses as `ResponseRead` items, oldest first, and no responses from other surveys.
- `AC-002`: Requests without a valid token return 401; requests for a missing or another owner's survey return 404 with no response data, and the two cases cannot be told apart.
- `AC-003`: Defaults are `offset=0` and `limit=50`; `limit` above 100 or below 1 and a negative `offset` return 422; consecutive pages neither skip nor repeat responses while no new responses arrive.

## Build Plan

1. Index: `MODIFY app/responses/model.py` to replace the `survey_id` index with a composite `(survey_id, submitted_at)` index; `CREATE` the matching Alembic revision under `migrations/versions/`.
2. Listing: `MODIFY app/responses/service.py` to add `list_survey_responses` and `MODIFY app/responses/router.py` to add the `GET` route.

## Risks and Follow-up

- Offset paging slows on very large surveys; keyset paging can replace it later without changing the ownership rule.
