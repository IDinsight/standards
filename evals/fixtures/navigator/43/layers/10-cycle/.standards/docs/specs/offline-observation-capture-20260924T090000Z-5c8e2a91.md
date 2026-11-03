<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: offline-observation-capture-20260924T090000Z-5c8e2a91
-->

# Technical Design

## Context

`recordObservation` (src/app.js) validates input, sends it to the project
server through `postObservation` (src/client.js), and keeps the server's copy
in the on-device `ObservationStore`. The server contract
(`POST /api/observations`, `201` with the stored observation and its `id`) is
shared with other tools and must not change.

## Decision

Keep the server as the source of observation identity. Saving an observation
awaits `POST /api/observations`; only after the server answers `201` is the
returned observation, with its server-assigned `id`, written to the local
store. If the request fails or returns any other status, the save is rejected
with the client's error and nothing is stored; the form keeps the entered
values so the worker can retry. Listing reads the local store only.

This keeps a single identity for every observation and avoids client-side id
generation and duplicate uploads.

## Acceptance Coverage

- `AC-001`: `recordObservation` validates site, species, count, and note, then
  saves through the server round trip described in Decision.
- `AC-002`: The local `ObservationStore` keeps every confirmed observation on
  the device; `listObservations` reads only the local store and makes no
  network request.
- `AC-003`: Observations are sent to the server at save time, so every
  observation in the local store already exists on the server.

## Components

- `src/observations.js` — validation and the on-device store (unchanged
  responsibility).
- `src/client.js` — the only module that talks to the server.
- `src/app.js` — save and list flows.

## Interfaces and Contracts

- `POST /api/observations` with `{ site, species, count, note }`; `201`
  returns the stored observation including `id`. Any other status is a failed
  save.
- `recordObservation({ store, client }, input)` resolves to the stored
  observation or rejects with the validation or client error.
- `listObservations({ store })` returns the stored observations in recording
  order.

## Data and Control Flow

Input -> `validate` -> `client.postObservation` -> on `201`, `store.add(server
copy)` -> resolved observation. On failure: rejection, store unchanged.

## Technical Acceptance Criteria

- `AC-001`: A valid input with a `201` response resolves to the server copy
  with its `id`, and the copy is in the local store.
- `AC-002`: `listObservations` returns the local store's contents without
  calling the client.
- `AC-003`: No observation is in the local store without a server-assigned
  `id`.

## Build Plan

1. Keep the form values on a rejected save so the worker can retry.
2. Make `listObservations` independent of client availability.
3. Extend tests with the fake fetch for success, rejection, and listing.

## Alternatives

- Client-generated ids with a background upload: rejected to keep a single
  identity source and avoid duplicate observations on the server.
