<!-- STANDARDS
Artifact: SCOPE
Cycle: show-remaining-event-spots-20260923T141200Z-5c81e0a4
-->

# Remaining Spots on the Event List

## Goal

Volunteers browsing the public event list cannot tell which events still need
people, so popular events get over-subscribed requests and quieter ones stay
short. Show how many spots remain on each upcoming event.

## Constraints

- Use the existing event capacity and registration data; no new data is
  collected from volunteers.

## Non-goals

- Waitlists or notifications when a spot opens.
- Changes to the admin pages.

## Work

### 1. Show availability on the public list

**Intent:** Let volunteers choose events that still have room.

**Done when:**

- `AC-001`: Each upcoming event on the public event list shows the number of
  remaining spots, computed as capacity minus confirmed registrations.
- `AC-002`: An event with no remaining spots is labelled "Full" and its Register
  button is disabled.

**Depends on:** None
