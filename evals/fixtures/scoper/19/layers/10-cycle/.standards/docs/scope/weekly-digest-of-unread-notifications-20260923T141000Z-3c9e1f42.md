<!-- STANDARDS
Artifact: SCOPE
Cycle: weekly-digest-of-unread-notifications-20260923T141000Z-3c9e1f42
-->

# Weekly Notification Digest

## Goal

Give each user one weekly email that summarizes the notifications they have
not read, so that people who rarely open the app still see what needs their
attention.

## Non-goals

- Daily or real-time notification emails.
- Changing how notifications are created or marked as read.

## Work

### 1. Weekly digest email

**Intent:** Bring unread notifications to users who are not checking the app.

**Done when:**

- `AC-001`: Each user with at least one unread notification receives exactly
  one digest email per week listing those notifications.
- `AC-002`: A user with no unread notifications receives no digest that week.
- `AC-003`: Every digest email contains a link that turns the digest off for
  that user.

**Depends on:** None

## Assumptions

- Every user account has a verified email address.
