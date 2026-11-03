<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: credential-persistence-20260925T090000Z-2b3c4d5e
-->

# Development Plan

`Cycle`: `credential-persistence-20260925T090000Z-2b3c4d5e` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `APPROVED`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Persist the API token after login so ledgerctl commands no longer need --token on every run.`

## Build Steps

### DEV-001 — Login command stores the token

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Add a `login` subcommand that checks a token against the API and stores it so
later commands can use it when no `--token` or `LEDGERCTL_TOKEN` is given.

**Affected Area**

`ledgerctl/cli.py` (parser, token resolution); a new module for token storage
under `ledgerctl/`.

**Expected Outcome**

`ledgerctl login` accepts a token from `--token`, `LEDGERCTL_TOKEN`, or a
prompt, calls `/v1/me`, and stores the token on success. `whoami` and
`balances` fall back to the stored token. Existing token sources keep
precedence.

**Self-Check**

`python3 -m pytest -q` from the project root; existing tests must keep passing.

### DEV-002 — Logout removes the stored token

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Add a `logout` subcommand that deletes the stored token.

**Affected Area**

`ledgerctl/cli.py`; the token storage module from DEV-001.

**Expected Outcome**

After `ledgerctl logout`, commands without `--token` or `LEDGERCTL_TOKEN` fail
with the existing not-authenticated message and exit status 2.

**Self-Check**

`python3 -m pytest -q` from the project root.
