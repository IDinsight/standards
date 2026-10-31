<!-- STANDARDS
Artifact: SCOPE
Cycle: survey-response-api-for-field-staff-20260924T083000Z-5c1e9a7b
-->

# Field Survey Response API

## Goal

The field coordination team needs a service that accepts survey responses
collected by field staff and keeps them safely, so responses are no longer lost
on individual devices. This first cycle delivers an API that the internal team
can exercise in a shared staging environment.

## Constraints

- Target maturity: Level 3 (internally testable). The service is used by the
  internal team in staging and is not opened to the public.
- Only authenticated field staff may submit or read responses. Field-staff
  accounts are issued by a project administrator.
- Responses can contain personal information about respondents. That
  information must not be written to application logs.
- One shared staging environment, reachable by the field coordination team, is
  required. No hosting platform has been chosen yet.

## Non-goals

- Public production readiness, such as alerting, service-level objectives,
  autoscaling, restore drills, or an on-call rotation.
- Survey authoring or per-survey answer schemas. Any survey identifier is
  accepted.
- A mobile or web client, and offline collection.
- Reporting, export, or analyst access to stored responses.
- Self-service registration and password reset.

## Work

### 1. Response submission

**Intent:** Field staff can hand in what they collected and know it was kept.

**Done when:**

- `AC-001`: An authenticated field-staff user can submit a survey response
  consisting of a survey identifier, a respondent reference, the time the
  response was collected, and one or more question-answer pairs, and receives an
  identifier for the stored response.
- `AC-002`: A submission missing any of those fields, or with no answers, is
  rejected with an error that names the problem, and nothing is stored.
- `AC-003`: A stored response is still retrievable after the service restarts.

**Depends on:** Work item 2.

### 2. Access control

**Intent:** Only people the team has issued accounts to can reach response data,
and each person sees only their own submissions.

**Done when:**

- `AC-004`: Requests without valid field-staff credentials are rejected and
  neither store nor return any response data.
- `AC-005`: A field-staff user can list and read only the responses they
  submitted.
- `AC-006`: A project administrator can create a field-staff account and
  deactivate it; requests from a deactivated account are rejected like requests
  without valid credentials.

**Depends on:** None.

### 3. Staging and testability

**Intent:** The internal team can run, test, and try the service in one shared
place.

**Done when:**

- `AC-007`: The service can be deployed to the shared staging environment from
  the repository's default branch, and a health check reports whether the
  service and its response storage are available.
- `AC-008`: An automated test suite covering submission, validation, access
  control, and persistence runs with one documented command.
- `AC-009`: The README explains how to run the service locally, run the tests,
  create a field-staff account, and deploy to staging.

**Depends on:** Work items 1 and 2.

## Assumptions

- Field staff submit responses after collection, when a network connection is
  available.
- Staging volume is small: tens of field-staff users and a few hundred
  responses per day.
