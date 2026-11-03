# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `DEVELOPING` `CycleMode`: `STANDARD` `PendingCycleMode`:
`UNSET` `PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE` `Id`:
`quantity-discounts-20260921T140512Z-6e2b9a41` `Request`:
`Add quantity discount tiers to order line pricing.` `Scope`:
`.standards/docs/scope/quantity-discounts-20260921T140512Z-6e2b9a41.md`
`Architecture`:
`.standards/docs/specs/quantity-discounts-20260921T140512Z-6e2b9a41.md`
`Development`:
`.standards/docs/development/quantity-discounts-20260921T140512Z-6e2b9a41.md`
`PromotionReason`:
`Discount and promo-code stacking and rounding rules are undefined; formal scope, design, and Tester verification are required.`
`AuditTarget`: `NONE` `BlockedOn`:
`Approve the revised development plan (new DEV-003, integer-cent line totals) before the rounding correction is implemented.`
`PendingVerificationCadence`: `INCREMENTAL`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FAILURE` `From`: `TESTING` `FailureType`: `IMPLEMENTATION` `Reason`:
`Discounted line totals are rounded per unit, not once per line (AC-003).`

## Recovery

`Active`: `true`

### Frame 1

`From`: `TESTING` `Owner`: `DEVELOPING` `FailureType`: `IMPLEMENTATION`
`Reason`: `Discounted line totals are rounded per unit, not once per line (AC-003).`
`ResumeAt`: `TESTING` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `true`

### Obligation 1

`Owner`: `REVIEWING_IMPLEMENTATION` `FailureType`: `REVIEW` `Reason`:
`Implementation review did not assess how quantity discounts combine with promo codes.`
