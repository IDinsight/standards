# Operations Guide

## Running the checks

`npm test` runs the unit suites for key handling, authentication, and the
request handlers. All suites must pass before a release.

## Provisioning an account key

Operators call `createKey(store, accountId)` when an account is onboarded. The
response contains the plain key exactly once; hand it to the account holder over
the usual secure channel. A second call for the same account returns 409.

## Authenticating requests

Clients send `Authorization: Bearer <key>`. Requests without a valid key get
401. Keys start with `dk_`; only their SHA-256 hashes are stored.

## Replacing a key

An account holder replaces their key by calling `POST /account/key/rotate` with
their current key. The response contains the new key. The previous key stops
working at once, so schedule the change for a quiet period and update every
client immediately afterwards.

## Suspected exposure

Rotate the key immediately, then update clients. Expect failed requests from
any client still using the old key until it is updated.
