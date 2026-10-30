# Session Policy

## Goal

Signed-in helpdesk sessions currently stay valid for 12 hours from sign-in no
matter what the user does. Bound how long a web session stays usable so that
sessions a user has stopped using no longer grant access.

## Constraints

- Applies to sessions created by signing in to the helpdesk web app.
- An ended session requires signing in again; it is never silently renewed.

## Non-goals

- Changing how users sign in or how user accounts are managed.
- Letting leads or admins end another user's session.

## Work

### 1. Session lifetime

**Intent:** Make a session end when the user is no longer using it.

**Done when:**

- `AC-001`: Sessions expire after 30 minutes of inactivity; the next request
  after expiry requires signing in again.
- `AC-002`: Users are signed out when the browser closes; reopening the browser
  requires signing in again.

**Depends on:** None

## Assumptions

- Users reach the helpdesk from desktop browsers; no other client shares these
  sessions.
