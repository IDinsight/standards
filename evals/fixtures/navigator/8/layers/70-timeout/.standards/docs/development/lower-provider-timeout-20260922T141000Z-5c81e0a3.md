<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: lower-provider-timeout-20260922T141000Z-5c81e0a3
-->

# Development Plan

`Cycle`: `lower-provider-timeout-20260922T141000Z-5c81e0a3` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/lower-provider-timeout-20260922T141000Z-5c81e0a3.md`
- `Architecture`: `.standards/docs/specs/lower-provider-timeout-20260922T141000Z-5c81e0a3.md`
- `Request`: `Lower the rates provider request timeout to 10 seconds and log provider timeouts.`

## Build Steps

### DEV-001 — Provider requests use a 10-second timeout

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Apply the design's 10-second request timeout.

**Affected Area**

`src/config.py` (`REQUEST_TIMEOUT_SECONDS`). `src/client.py` already passes the
constant to the opener and needs no change for this step.

**Expected Outcome**

`fetch_rates` passes `timeout=10` to the opener; behavior is otherwise
unchanged.

**Self-Check**

Ran `python3 -m pytest tests` from the project root on the working tree with
`REQUEST_TIMEOUT_SECONDS = 10` in `src/config.py`, before committing: exit 0,
3 passed. Inspected `fetch_rates` in `src/client.py`: it passes
`config.REQUEST_TIMEOUT_SECONDS` unchanged as `timeout`. Developer feedback
only, not formal verification.

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

## Plan Notes

- DEV-001 is committed; DEV-002 is next.
