# Project Context

## Project Baseline

- `dispatch` is the core of a message-dispatch API: account API keys, bearer
  authentication, and request handlers. The HTTP adapter that mounts the
  handlers lives in the deployment repository and is not part of this project.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no third-party
  dependencies. Key generation and hashing use `node:crypto`; tests use
  `node:test`.

## Structure and Boundaries

- `src/credentials.js` — `CredentialStore`: issues, rotates, and looks up API
  keys. In-memory maps keyed by the SHA-256 hash of the key and by account id;
  exactly one key per account.
- `src/auth.js` — `authenticate()`: parses the `Authorization: Bearer <key>`
  header and resolves the account through `store.lookup`; throws `AuthError`.
- `src/routes.js` — handlers returning `{ status, body }`: `createKey`
  (operator provisioning, unauthenticated), `rotateKey` and `getAccount`
  (authenticated with the caller's key).
- `docs/operations.md` — project-facing operations guide for provisioning,
  authentication, and key replacement.
- `test/` — `node:test` suites for credentials, authentication, and handlers.

## Commands

- `npm test` — runs `node --test` on the three suites; all pass at the audited
  commit.

## Conventions and Constraints

- Plain keys are never stored; only SHA-256 hashes. Key format: `dk_` followed
  by 48 lowercase hex characters.
- Handlers map `AuthError` to 401 and return `{ status, body }` objects; they do
  not throw for client errors.
- No external dependencies are used or expected.

## External Systems and Data

- Credential storage is the in-memory `CredentialStore`; durable persistence is
  outside this repository.

## Testing and Verification Baseline

- `test/credentials.test.js`, `test/auth.test.js`, `test/routes.test.js` cover
  issuing, duplicate refusal, rotation, lookup, header parsing, and handler
  status codes.

## Relevant Existing Behavior

- An account has exactly one active key; `issue` refuses a second.
- `rotate` deletes the current key's hash before storing the new one, so the old
  key is rejected immediately after rotation (`test/credentials.test.js`, "rotate
  replaces the previous key"; `test/routes.test.js`).
- `rotateKey` is authenticated with the key being replaced and returns the new
  key once.

## Evidence

- `src/credentials.js`, `src/auth.js`, `src/routes.js` — behavior above.
- `npm test` — all suites pass.
- `docs/operations.md` — current key replacement procedure.
