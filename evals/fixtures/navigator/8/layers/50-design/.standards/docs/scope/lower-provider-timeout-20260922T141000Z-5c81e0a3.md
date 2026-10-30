<!-- STANDARDS
Artifact: SCOPE
Cycle: lower-provider-timeout-20260922T141000Z-5c81e0a3
-->

# Shorter Provider Timeout

## Goal

Callers of `fetch_rates` stall for a long time when the rates provider hangs.
Give up sooner so a stalled provider is detected quickly, and make provider
timeouts visible in logs.

## Constraints

- The `fetch_rates` call signature and the `ProviderTimeout` exception stay
  unchanged for existing callers.

## Non-goals

- Retrying timed-out requests.
- Making the timeout configurable per call.

## Work

### 1. Shorter provider timeout

**Intent:** Detect a hung provider quickly instead of blocking callers.

**Done when:**

- `AC-001`: A provider request that has not completed within 10 seconds is
  abandoned and `fetch_rates` raises `ProviderTimeout`.

**Depends on:** None

### 2. Timeout logging

**Intent:** Let operators see when and how often the provider times out.

**Done when:**

- `AC-002`: Each provider timeout is logged at warning level with the request
  URL and the timeout that applied.

**Depends on:** Work item 1.
