# Project Context

## Project Baseline

- `fieldlog` records species counts from field survey sites and sends them to
  the shared project server.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules, no external dependencies.

## Structure and Boundaries

- `src/observations.js` — input validation and the in-memory on-device
  `ObservationStore`.
- `src/client.js` — project server client; `postObservation` sends
  `POST /api/observations` and expects `201` with the stored observation,
  including its server-assigned `id`.
- `src/app.js` — `recordObservation` and `listObservations`.

## Commands

- `npm test` — runs `node --test test/observations.test.js`.

## Conventions and Constraints

- The server's `POST /api/observations` contract is shared with other project
  tools.

## Relevant Existing Behavior

- `recordObservation` posts to the server first and stores the server's copy;
  a failed request rejects the save and stores nothing.
- `listObservations` reads the local store only.

## Testing and Verification Baseline

- `test/observations.test.js` uses a fake `fetch`; tests need no network.

## Evidence

- `src/app.js`, `src/client.js`, `src/observations.js`,
  `test/observations.test.js`.
