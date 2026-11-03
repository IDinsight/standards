export class ForbiddenError extends Error {
  constructor(message = 'forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export function requireSignedIn(actor) {
  if (!actor) throw new ForbiddenError('sign-in required');
}

export function requireAdmin(actor) {
  requireSignedIn(actor);
  if (actor.role !== 'admin') throw new ForbiddenError('admin role required');
}
