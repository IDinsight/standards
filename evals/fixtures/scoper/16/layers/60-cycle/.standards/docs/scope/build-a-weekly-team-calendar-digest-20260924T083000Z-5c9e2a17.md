<!-- STANDARDS
Artifact: SCOPE
Cycle: build-a-weekly-team-calendar-digest-20260924T083000Z-5c9e2a17
-->

# Weekly Team Calendar Digest

## Goal

Give the team one weekly summary of the shared calendar, so members can see the
coming week without opening the calendar itself.

## Constraints

- The only input is the iCalendar (`.ics`) export the team already produces; there
  is no access to live calendar accounts.

## Non-goals

- Creating, editing, or deleting calendar events.
- Sending the digest by email or chat.

## Work

### 1. Weekly summary

**Intent:** Members see every commitment in the coming week in one place.

**Done when:**

- `AC-001`: Given a calendar export and a start date, the digest lists every
  event that starts in the seven days from that date, grouped by day in
  chronological order.
- `AC-002`: A recurring event appears once for each of its occurrences in that
  week.

**Depends on:** None
