# Project Context

## Project Baseline

- `notify` is a small Node.js library that hands outgoing messages to a
  caller-supplied transport. It exposes `sendMessage(transport, message)` in
  `src/send.js`, which makes one `transport.send` call and throws a plain
  `Error` for any status of 300 or above. There is no input validation and no
  retry.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`type: module`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/send.js` — the public entry point.
- `test/` — `node:test` suites.

## Commands

- `npm test` — runs `node --test test/*.test.js` from the project root.

## Conventions and Constraints

- The transport is any object with an async `send(message)` that resolves to
  an object with a numeric `status`; the library never constructs one.
- Callers pass `(transport, message)`; that call shape is relied on by users.

## Testing and Verification Baseline

- `test/send.test.js` covers one successful delivery through a recording
  transport.

## Evidence

- `src/send.js`, `test/send.test.js`, `package.json`, `README.md`.
