# Ticket access

Ticket responses are built by `serializeTicket` (`src/serialize.js`), which
includes a field only when `canRead(role, field)` allows it. Updates go through
`TicketStore.update`, which checks `canEdit(role, field)` for every changed
field. Both rules live in `src/visibility.js`.

## Roles

- `customer`: the person who opened the ticket.
- `agent`: support staff employed by us.
- `admin`: support leads. Same ticket field access as agents.
- `partner`: agents at external support vendors under contract. They work the
  tickets routed to their vendor's queue.

## Tiers

- `EVERYONE`: customer, partner, agent, admin.
- `STAFF`: partner, agent, admin.

Changing a tier, adding a tier, or moving a role between tiers is an
access-policy change. Agree it with the support lead and record the decision
in this file.

## Decisions

- Partners join `STAFF` so vendor queues can triage tickets (assign and
  reprioritize). Agreed with the support lead when vendor queues launched.
