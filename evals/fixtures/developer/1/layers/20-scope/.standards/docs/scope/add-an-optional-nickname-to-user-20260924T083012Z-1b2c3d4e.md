<!-- STANDARDS
Artifact: SCOPE
Cycle: add-an-optional-nickname-to-user-20260924T083012Z-1b2c3d4e
-->

# Profile Nickname

## Goal

Let users choose an optional nickname, separate from their display name, that
other parts of the account service can read from the profile API.

## Constraints

- Existing stored profiles must keep working without manual data changes.
- Existing `display_name` and `email` behavior is unchanged.

## Non-goals

- Nickname uniqueness across users.
- Content filtering or moderation of nicknames.
- Searching or listing profiles by nickname.

## Work

### 1. Nickname on the profile

**Intent:** Users want a short informal name without changing the display name
used on official correspondence.

**Done when:**

- `AC-001`: A user can set an optional nickname of at most 32 characters when updating their profile, and can clear it.
- `AC-002`: Profile read and update responses always include `nickname`, with `null` when no nickname is set.
- `AC-003`: A profile update with a nickname longer than 32 characters is rejected with status 400 and the stored profile is unchanged.

**Depends on:** None

### 2. Existing profiles

**Intent:** Profiles stored before this change must stay readable.

**Done when:**

- `AC-004`: Profiles stored before this change load without manual migration and report a `null` nickname.

**Depends on:** 1
