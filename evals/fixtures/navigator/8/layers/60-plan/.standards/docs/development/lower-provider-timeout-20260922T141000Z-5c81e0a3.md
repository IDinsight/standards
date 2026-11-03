<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: lower-provider-timeout-20260922T141000Z-5c81e0a3
-->

# Development Plan

`Cycle`: `lower-provider-timeout-20260922T141000Z-5c81e0a3` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/lower-provider-timeout-20260922T141000Z-5c81e0a3.md`
- `Architecture`: `.standards/docs/specs/lower-provider-timeout-20260922T141000Z-5c81e0a3.md`
- `Request`: `Lower the rates provider request timeout to 10 seconds and log provider timeouts.`

## Build Steps

### DEV-001 — Provider requests use a 10-second timeout

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Apply the design's 10-second request timeout.

**Affected Area**

`src/config.py` (`REQUEST_TIMEOUT_SECONDS`). `src/client.py` already passes the
constant to the opener and needs no change for this step.

**Expected Outcome**

`fetch_rates` passes `timeout=10` to the opener; behavior is otherwise
unchanged.

**Self-Check**

`python3 -m pytest tests` from the project root after the change, plus
inspection of the value `fetch_rates` passes to the opener.

### DEV-002 — Log provider timeouts

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

Emit one WARNING record from the `ratesync.client` logger for each provider
timeout.

**Affected Area**

`src/client.py`, both timeout branches of `fetch_rates`.

**Expected Outcome**

A timed-out request logs the URL and timeout in seconds before
`ProviderTimeout` is raised; successful requests and other errors log nothing.

**Self-Check**

`python3 -m pytest tests` from the project root, plus a manual call with an
opener that raises `TimeoutError` while logging is captured.
