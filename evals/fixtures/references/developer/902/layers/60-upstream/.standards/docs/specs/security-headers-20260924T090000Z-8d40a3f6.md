<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: security-headers-20260924T090000Z-8d40a3f6
-->

# Technical Design

## Context

notes-api is a FastAPI JSON API. `app/main.py` creates the app and registers
`CORSMiddleware` with the origins from settings; it is the only middleware, and
no project code sets response headers. API responses carry per-user note data.
Production serves the API over HTTPS behind a load balancer; development and CI
use plain HTTP. `Settings.environment` in `app/config.py` is `development` by
default and `production` in production.

## Decision

Add one middleware module, `app/utils/security_headers.py`, registered in
`app/main.py`, that adds the baseline browser security headers to every
response, CORS preflight responses included. It only adds headers: it changes no
status code and no response body.

Which headers and values make up the baseline, where the middleware sits in the
middleware stack, and how the server software name is kept out of responses are
implementation details for Developer, within the criteria below. Developer may
change any project file needed to meet them.

## Acceptance Coverage

- `AC-001`: the middleware in `app/utils/security_headers.py`, registered in
  `app/main.py`, applied to every response including CORS preflight responses;
  see Technical Acceptance Criteria.

## Components

- `app/utils/security_headers.py` — new middleware that adds the baseline
  headers to each response.
- `app/main.py` — registers the middleware.

## Interfaces and Contracts

- Responses carry per-user data.
- Transport: HTTPS in production, behind a load balancer; plain HTTP in
  development and CI.
- Status codes and response bodies are part of the existing API contract and do
  not change.

## Technical Acceptance Criteria

- `AC-001`: Every response, including error responses and CORS preflight
  responses, carries the baseline browser security headers.
- `AC-001`: No status code or response body changes.
- `AC-001`: No response names the server software.
- `AC-001`: Nothing in the change is hard to undo, such as a browser preload
  list.

## Build Plan

1. CREATE `app/utils/security_headers.py` with the middleware.
2. MODIFY `app/main.py` to register it.
3. Change other project files only as the criteria above require.

## Risks and Follow-up

- Load balancer configuration is outside this cycle.
