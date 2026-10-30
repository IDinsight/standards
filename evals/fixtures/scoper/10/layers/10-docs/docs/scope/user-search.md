<!-- STANDARDS
Artifact: SCOPE
Cycle: user-search-v1-old
-->

# User Search

## Goal

Let support staff find a user record in the directory by name or email
without scrolling the full list.

## Non-goals

- Fuzzy or typo-tolerant matching.
- Ranking of results; results keep directory order.
- Searching by team.

## Work

### 1. Search endpoint

**Intent:** Staff can look up a colleague from a single query parameter.

**Done when:**

- `AC-001`: A search with `q` returns every user whose name contains the query.
- `AC-002`: A search with `q` equal to a user's email, in any letter case,
  returns that user.
- `AC-003`: A search request without `q` is rejected with status 400.

**Depends on:** None.
