const EDITABLE_FIELDS = ['displayName', 'email', 'role', 'suspendedReason'];
const ROLES = ['member', 'admin', 'owner'];

function requireText(value, name) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${name} must be a non-empty string`);
  }
  return value.trim();
}

function optionalText(value, name) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') throw new TypeError(`${name} must be a string or null`);
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function requireRole(value) {
  if (!ROLES.includes(value)) throw new RangeError(`role must be one of ${ROLES.join(', ')}`);
  return value;
}

export function createAdminRecord({ id, displayName, email, role = 'member' }) {
  return {
    id,
    displayName: requireText(displayName, 'displayName'),
    email: requireText(email, 'email').toLowerCase(),
    role: requireRole(role),
    suspendedReason: null,
    updatedAt: null,
  };
}

export function applyAdminUpdate(record, patch, now = new Date()) {
  const unknown = Object.keys(patch).filter((key) => !EDITABLE_FIELDS.includes(key));
  if (unknown.length > 0) throw new RangeError(`Unknown field: ${unknown.join(', ')}`);
  const next = { ...record };
  if ('displayName' in patch) next.displayName = requireText(patch.displayName, 'displayName');
  if ('email' in patch) next.email = requireText(patch.email, 'email').toLowerCase();
  if ('role' in patch) next.role = requireRole(patch.role);
  if ('suspendedReason' in patch) next.suspendedReason = optionalText(patch.suspendedReason, 'suspendedReason');
  next.updatedAt = now.toISOString();
  return next;
}
