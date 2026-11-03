<!-- STANDARDS
Artifact: SCOPE
Cycle: security-headers-20260924T090000Z-8d40a3f6
-->

# Baseline Security Headers

## Goal

Browsers that call notes-api should receive a consistent set of baseline
security headers on every response, so clients handle the API's per-user data
conservatively.

## Constraints

- Existing endpoints keep their current behavior apart from the added headers.

## Non-goals

- Changes to authentication, authorization, or the gateway identity header.
- Changes to the allowed CORS origins.
- Load balancer or hosting configuration.

## Work

### 1. Baseline security headers

**Intent:** Give every API response the same baseline protections in the
browser.

**Done when:**

- `AC-001`: Every API response carries baseline security headers.

**Depends on:** None
