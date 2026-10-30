<!-- STANDARDS
Artifact: SCOPE
Cycle: profile-nickname-20260924T090000Z-1b2c3d4e
-->

# Profile Nickname

## Work

### 1. Nickname field

**Done when:**

- `AC-001`: A user can set an optional nickname of at most 32 characters.
- `AC-002`: The profile API returns the nickname, or null when unset.
- `AC-003`: A nickname longer than 32 characters is rejected with status 400 and the profile is unchanged.
