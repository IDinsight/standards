export function canViewAuditLog(user) {
  return Boolean(user) && user.role === 'admin';
}
