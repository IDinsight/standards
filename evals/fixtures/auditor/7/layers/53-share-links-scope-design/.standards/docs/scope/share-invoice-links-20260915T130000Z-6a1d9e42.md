<!-- STANDARDS
Artifact: SCOPE
Cycle: share-invoice-links-20260915T130000Z-6a1d9e42
-->

# Share Invoice Links

## Goal

Let the owner of an invoice give a customer read-only access to that invoice
through a link, without exposing anything else, and keep that access bounded in
time and revocable.

## Constraints

- A link grants read access to exactly one invoice.

## Non-goals

- Authentication or user accounts.
- Editing or paying an invoice through a link.
- Persisting links across restarts.

## Work

### 1. Shareable read-only links

**Intent:** Customers can view an invoice without access to the rest of the
service.

**Done when:**

- `AC-001`: A share link can be created for an existing invoice, and requesting
  the link returns that invoice; creating a link for an unknown invoice fails
  with not found.
- `AC-002`: A share link stops returning the invoice seven days after it was
  created.
- `AC-003`: A share link can be revoked, after which it stops returning the
  invoice immediately.

**Depends on:** None

### 2. Documentation

**Intent:** Developers using the handlers know how share links behave.

**Done when:**

- `AC-004`: The README describes the share routes, the seven-day expiry, and
  revocation.

**Depends on:** 1
