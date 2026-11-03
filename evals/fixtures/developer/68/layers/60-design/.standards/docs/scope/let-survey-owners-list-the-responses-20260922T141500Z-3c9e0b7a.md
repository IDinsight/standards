<!-- STANDARDS
Artifact: SCOPE
Cycle: let-survey-owners-list-the-responses-20260922T141500Z-3c9e0b7a
-->

# Owner Response Listing

## Goal

Survey owners can send surveys to the field but cannot see what respondents sent back without direct database access. Give owners a way to read the responses to their own surveys through the API, a page at a time.

## Constraints

- Only a survey's owner may read its responses; the responses of other owners' surveys must not be disclosed, and their existence must not be confirmed.
- Anonymous response submission keeps working unchanged.
- The existing bearer-token authentication is reused.

## Non-goals

- Exporting responses (CSV or other formats).
- Filtering, searching, or reporting a total count of responses.
- Giving users other than the owner access to a survey.
- Editing or deleting responses.

## Work

### 1. Owner reads survey responses

**Intent:** Owners can review what has been collected for a survey while fieldwork is running and after it closes.

**Done when:**

- `AC-001`: An authenticated survey owner can retrieve the responses submitted to one of their surveys, each with its identifier, survey identifier, respondent reference, answers, and submission time.
- `AC-002`: A request without valid credentials is rejected with status 401, and a request for a survey that does not exist or belongs to another user returns status 404 with no response data.
- `AC-003`: Responses are returned a page at a time, oldest first; the caller can set the starting offset and the page size, the page size defaults to 50 and may not exceed 100, and out-of-range values are rejected with status 422.

**Depends on:** None

## Assumptions

- Response volumes per survey are in the low thousands, so offset-based pages are acceptable.
