<!-- STANDARDS
Artifact: SCOPE
Cycle: add-contact-search-by-name-and-email-20260923T141200Z-5c81e2fa
-->

# Contact Search

## Goal

Let API clients find contacts without listing the whole directory: by part of
a name, or by an exact email address.

## Constraints

- Existing `GET /contacts` and `GET /contacts/:id` behavior stays unchanged.

## Non-goals

- Pagination, ranking, or fuzzy matching.
- Searching by fields other than name and email.

## Work

### 1. Search by name

**Intent:** Clients can find a contact from a fragment of the name a user
remembers.

**Done when:**

- `AC-001`: Searching contacts by name returns every contact whose name
  contains the query text, ignoring letter case. A name query shorter than 2
  characters, after surrounding spaces are trimmed, is rejected with status 400
  and returns no contacts.

**Depends on:** None

### 2. Search by email

**Intent:** Clients holding an email address can resolve it to the contact
record.

**Done when:**

- `AC-002`: Searching contacts by email returns the contact whose email equals
  the query, ignoring letter case, or an empty result when none matches.

**Depends on:** None
