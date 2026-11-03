// Which roles may read or change each ticket field. See docs/access.md.
const EVERYONE = ['customer', 'partner', 'agent', 'admin'];
const STAFF = ['partner', 'agent', 'admin'];

export const FIELD_ACCESS = {
  id: EVERYONE,
  subject: EVERYONE,
  status: EVERYONE,
  createdAt: EVERYONE,
  assignee: STAFF,
  priority: STAFF,
};

const EDIT_ACCESS = {
  subject: EVERYONE,
  status: STAFF,
  assignee: STAFF,
  priority: STAFF,
};

export function canRead(role, field) {
  return Boolean(FIELD_ACCESS[field]?.includes(role));
}

export function canEdit(role, field) {
  return Boolean(EDIT_ACCESS[field]?.includes(role));
}
