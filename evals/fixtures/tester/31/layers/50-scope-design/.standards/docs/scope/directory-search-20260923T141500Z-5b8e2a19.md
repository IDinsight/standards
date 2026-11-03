<!-- STANDARDS
Artifact: SCOPE
Cycle: directory-search-20260923T141500Z-5b8e2a19
-->

# Staff Directory Search

## Goal

Let callers of the staff directory find people from part of a name or email address instead of needing an exact id, and page through long result lists.

## Constraints

- Search works on the records `loadUsers` already returns; the data file format does not change.
- No new runtime dependencies.

## Non-goals

- Fuzzy or typo-tolerant matching.
- An HTTP endpoint or command-line interface for search.

## Work

### 1. Name search

**Intent:** People are usually looked up by name, often from a fragment typed in any case.

**Done when:**

- `AC-001`: Searching with part of a person's name, in any letter case, returns every person whose name contains it.

**Depends on:** None

### 2. Email search

**Intent:** Some callers only have an address or part of one.

**Done when:**

- `AC-002`: Searching with part of an email address, in any letter case, returns every person whose email address contains it, and each result shows whether it matched on name or email.

**Depends on:** 1

### 3. Paged results

**Intent:** Broad queries can match many people; callers need a page at a time.

**Done when:**

- `AC-003`: A caller can ask for one page of results by page number and page size and is told the total number of matches.

**Depends on:** 1, 2
