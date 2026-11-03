<!-- STANDARDS
Artifact: SCOPE
Cycle: build-a-small-command-line-tool-for-20260924T090000Z-3f9a1c6e
-->

# Reading List CLI

## Goal

Give one person a quick way to keep track of books they want to read and books
they have finished, from the terminal, without an account or an online service.

## Constraints

- Runs on the user's own machine; reading-list data stays local.

## Non-goals

- Syncing a list between devices or sharing it with other people.
- Looking up book details from external catalogues.

## Work

### 1. Keep a reading list

**Intent:** Let the user record what they plan to read and see it at a glance.

**Done when:**

- `AC-001`: A user can add a book by title, with an optional author, and the
  book appears in the list.
- `AC-002`: A user can mark a listed book as read, and the list shows unread and
  read books separately.

**Depends on:** None

### 2. Keep the list between sessions

**Intent:** The list is only useful if it survives closing the terminal.

**Done when:**

- `AC-003`: Books added in one run of the tool are still listed in the next run.

**Depends on:** 1

## Assumptions

- One user per machine; the tool does not need to tell people apart.
