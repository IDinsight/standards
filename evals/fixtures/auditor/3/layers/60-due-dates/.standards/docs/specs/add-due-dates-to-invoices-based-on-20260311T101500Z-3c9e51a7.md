<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-due-dates-to-invoices-based-on-20260311T101500Z-3c9e51a7
-->

# Technical Design

## Context

Invoices are built by `createInvoice` in `services/billing/src/invoice.js`.
Dates are ISO `YYYY-MM-DD` strings in UTC (`.standards/CONTEXT.md`).

## Decision

Add an optional `termsDays` input to `createInvoice`, defaulting to 30, and a
`dueOn` field computed as `issuedOn` plus `termsDays` whole days at UTC
midnight. No new workspace or dependency.

## Acceptance Coverage

- `AC-001`: `dueOn` defaults to `issuedOn` + 30 days.
- `AC-002`: `termsDays` overrides the default.
- `AC-003`: No architectural impact — Documenter updates the README.

## Interfaces and Contracts

- `createInvoice({ customerId, planId, issuedOn, termsDays = 30 })` returns the
  existing fields plus `dueOn` (`YYYY-MM-DD`, UTC).

## Technical Acceptance Criteria

- `AC-001`, `AC-002`: the date arithmetic uses UTC midnight, so the result does
  not depend on the host time zone.
