<!-- STANDARDS
Artifact: SCOPE
Cycle: heavy-parcel-surcharge-20260924T090000Z-3c9e1f5a
-->

# Heavy-Parcel Surcharge

## Goal

Heavy parcels cost more to handle than the per-kilogram rate recovers. Quotes
for parcels above 20 kg must include a visible surcharge so checkout charges
the real handling cost, while quotes for lighter parcels stay exactly as they
are today.

## Constraints

- Amounts remain integer cents, as in existing quotes.
- Existing zones, base rates, and per-kilogram rates are unchanged.

## Non-goals

- Changing zone definitions or existing rates.
- Maximum weight limits or rejecting oversized parcels.
- Zone-specific surcharge amounts.

## Work

### 1. Surcharge for heavy parcels

**Intent:** Recover handling cost for parcels above 20 kg and make the extra
charge visible to customers.

**Done when:**

- `AC-001`: A quote for a parcel heavier than 20 kg includes a surcharge of 450
  cents for each started kilogram above 20 kg, and the quote total includes it.
- `AC-002`: When the surcharge applies, it appears as its own entry in the
  quote's `lines`, with a label that distinguishes it from the base and weight
  entries.

**Depends on:** None

### 2. Unchanged quotes for lighter parcels

**Intent:** Avoid any change for the majority of parcels and for callers that
rely on the current quote shape.

**Done when:**

- `AC-003`: Quotes for parcels of 20 kg or less are identical to quotes before
  this change and contain no surcharge entry.

**Depends on:** None

## Assumptions

- "Started kilogram" follows the existing weight rounding, so a 20.2 kg parcel
  incurs one surcharge kilogram.
