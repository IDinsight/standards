<!-- STANDARDS
Artifact: SCOPE
Cycle: credential-persistence-20260925T090000Z-2b3c4d5e
-->

# Stored API Token for ledgerctl

## Goal

Users currently pass an API token on every `ledgerctl` command, through
`--token` or `LEDGERCTL_TOKEN`. Let them log in once so later commands
authenticate on their own, and log out again, without weakening how the token
is protected or changing how existing configuration behaves.

## Constraints

- `ledgerctl` uses only the Python standard library; this change adds no
  third-party dependency.
- `--token` and `LEDGERCTL_TOKEN` remain supported with their current meaning.
- The existing not-authenticated message and exit statuses (2 for no token, 1
  for API errors) stay as they are.

## Non-goals

- Integration with an operating-system keychain or secret service.
- Storing more than one token per API base URL, or switching between named
  accounts.
- Token refresh, expiry tracking, or encryption of the stored token beyond file
  permissions.
- Changes to the `whoami`, `balances`, or `config` output.

## Work

### 1. Log in once

**Intent:** Remove the need to supply a token on every command.

**Done when:**

- `AC-001`: After `ledgerctl login` succeeds with a token the API accepts, later `whoami` and `balances` commands authenticate without `--token` or `LEDGERCTL_TOKEN`.
- `AC-002`: When the API rejects the token given to `ledgerctl login`, the command prints the API error, exits with status 1, and leaves any previously stored token unchanged.
- `AC-003`: A stored token is sent only to the `base_url` it was stored for; after `base_url` changes, commands without an explicit token report the not-authenticated error until the user logs in again.

**Depends on:** None

### 2. Keep explicit tokens and allow logout

**Intent:** Preserve current scripted usage and let users remove a stored
token.

**Done when:**

- `AC-004`: `--token` takes precedence over `LEDGERCTL_TOKEN`, and both take precedence over a stored token.
- `AC-005`: `ledgerctl logout` removes the stored token for the current `base_url`; a later command without an explicit token exits with status 2 and the existing not-authenticated message. Logging out when nothing is stored succeeds.

**Depends on:** 1

### 3. Protect the token and existing settings

**Intent:** Keep the stored secret private and avoid disturbing current
configuration.

**Done when:**

- `AC-006`: On POSIX systems, every file that holds a stored token is readable and writable only by its owner.
- `AC-007`: Existing `config.json` files load unchanged, and `config` get and set behave as before, including after `login` and `logout`.

**Depends on:** 1

## Assumptions

- Users run `ledgerctl` as a single local user; concurrent logins from several
  processes at once are not expected.
