# Internal auth service

Read when work calls the internal auth service or handles its tokens.

The internal auth service issues access and refresh tokens for staff apps.
visits-api talks to it only through `app/auth/client.py`.

## Getting a client

- In route handlers and dependencies, take the client with
  `Depends(get_auth_client)`. Do not construct `InternalAuthClient` in a route:
  the cached instance carries the service key and timeout settings, and tests
  override the dependency.

## Errors

- The client raises `AuthRejected` for tokens the service refuses and
  `AuthUnavailable` for timeouts, connection errors, and 5xx responses. Catch
  those two by name; do not wrap client calls in `except Exception`.

## Refresh tokens

- Refresh tokens are single-use. The service revokes a refresh token as soon as
  it accepts it, so never retry `refresh()` after a timeout or error: a second
  attempt with the same token is treated as reuse and revokes the whole
  session.
- Return the new refresh token to the caller unchanged. visits-api never stores
  access or refresh tokens.

## Logging

- Never log a raw access or refresh token, even at DEBUG. When a log line needs
  to identify a token, log `token_fingerprint(token)` from
  `app/auth/tokens.py`.

## Local checks

- The auth service is not reachable from laptops or CI. Exercise client code
  with `FakeAuthTransport` from `tests/fakes.py`.
