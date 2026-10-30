# Ticket access

Ticket responses are built by `serializeTicket` (`src/serialize.js`), which
includes a field only when `canRead(role, field)` allows it. Updates go through
`TicketStore.update`, which checks `canEdit(role, field)` for every changed
field. Both rules live in `src/visibility.js`.

## Roles

- `customer`: the person who opened the ticket.
- `agent`: support staff employed by us.
- `admin`: support leads. Same ticket field access as agents.

## Tiers

- `EVERYONE`: customer, agent, admin.
- `STAFF`: agent, admin.

Changing a tier, adding a tier, or moving a role between tiers is an
access-policy change. Agree it with the support lead and record the decision
in this file.
