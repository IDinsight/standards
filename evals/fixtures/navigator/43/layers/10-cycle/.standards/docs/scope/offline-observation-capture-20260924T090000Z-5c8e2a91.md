<!-- STANDARDS
Artifact: SCOPE
Cycle: offline-observation-capture-20260924T090000Z-5c8e2a91
-->

# Offline Observation Capture

## Goal

Field workers record species counts at survey sites where mobile coverage is
often missing. Today an observation can only be saved while the device can
reach the project server, so workers fall back to paper and re-enter counts
later. Workers need to keep recording through a survey day and have their
observations reach the shared project data afterwards.

## Constraints

- Survey sites can be without mobile coverage for a full working day.
- The project server's `POST /api/observations` contract stays as it is; other
  project tools already use it.

## Non-goals

- Editing or deleting observations after they are recorded.
- Reconciling observations of the same site recorded on different devices.

## Work

### 1. Record observations in the field

**Intent:** Let workers capture counts at the site, whatever the coverage, so
nothing has to be written on paper and typed in later.

**Done when:**

- `AC-001`: A field worker can record an observation with site, species, count, and an optional note.
- `AC-002`: Recording and listing observations work while the device has no network connection; observations recorded offline stay on the device.

**Depends on:** None

### 2. Share observations with the project

**Intent:** Make field observations available to the rest of the project
without extra work from the field worker.

**Done when:**

- `AC-003`: Observations recorded on a device reach the project server once the device can connect, without the worker entering them again.

**Depends on:** 1

## Assumptions

- Devices are not shared between workers during a survey day.
