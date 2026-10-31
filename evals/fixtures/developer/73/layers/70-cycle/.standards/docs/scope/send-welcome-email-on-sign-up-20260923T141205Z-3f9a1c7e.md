<!-- STANDARDS
Artifact: SCOPE
Cycle: send-welcome-email-on-sign-up-20260923T141205Z-3f9a1c7e
-->

# Welcome Email on Sign-up

## Goal

New users get no message after they sign up, and support hears from people who
are unsure whether their account was created. Send every new account a welcome
email, and make sure it actually arrives even when the mail server is briefly
unavailable.

## Constraints

- The sign-up endpoint keeps its current request and response contract.
- Email goes out through the project's existing SMTP configuration.

## Non-goals

- Changes to the password-reset email.
- Marketing, digest, or other non-welcome emails.
- Email open or click tracking.

## Work

### 1. Welcome email for new accounts

**Intent:** Confirm to new users that their account exists and point them to
the start page.

**Done when:**

- `AC-001`: After a successful sign-up, a welcome email is sent to the new
  account's email address, greeting the user by display name.
- `AC-002`: The welcome email for a new sign-up is retried until it is
  delivered, including after the service restarts.
- `AC-003`: Sign-up returns 201 with its existing response body without
  waiting for the welcome email, and a failure to send it never fails or undoes
  the sign-up.

**Depends on:** None
