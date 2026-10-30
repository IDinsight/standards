export function canView(user, report) {
  if (!user) return false;
  return user.role === 'admin' || user.teamId === report.teamId;
}

export function canEdit(user, report) {
  if (!user) return false;
  return user.role === 'admin' || user.id === report.ownerId;
}
