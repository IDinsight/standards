export type User = { id: number; role: 'admin' | 'member' };

export function requireAdmin(user: User): void {
  if (user.role !== 'admin') throw new Error('forbidden');
}
