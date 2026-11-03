<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: show-remaining-event-spots-20260923T141200Z-5c81e0a4
-->

# Technical Design

## Context

The public list in `web/app/page.tsx` renders `listUpcomingEvents()` from
`web/lib/events.ts`, which currently returns capacity but no registration
count. The admin events page already counts confirmed registrations per event.

## Decision

Extend `listUpcomingEvents()` to return a `remaining` count computed in SQL, and
render it in the public list. Keep the computation in one query so the page does
not issue a query per event.

## Acceptance Coverage

- `AC-001`: `listUpcomingEvents()` joins registrations and returns
  `remaining = greatest(capacity - confirmed, 0)`; `web/app/page.tsx` renders it.
- `AC-002`: `web/app/page.tsx` shows "Full" and renders the Register button
  disabled when `remaining` is 0.

## Interfaces and Contracts

- `EventSummary` gains `remaining: number` (integer, never negative).
- Confirmed means `registrations.status = 'confirmed'`; cancelled registrations
  do not count.

## Technical Acceptance Criteria

- `AC-001`: An event with capacity 10 and 3 confirmed plus 2 cancelled
  registrations reports 7 remaining.
- `AC-002`: An event whose confirmed registrations equal or exceed capacity
  reports 0 remaining.

## Build Plan

1. MODIFY `web/lib/events.ts`: add the `LEFT JOIN` count and `remaining` field.
2. MODIFY `web/app/page.tsx`: render remaining spots and the full state.

## Risks and Follow-up

- The disabled button is a display state only; server-side capacity
  enforcement in `registerForEvent` is outside this request.
