export type Role = 'admin' | 'editor' | 'viewer';

export type User = {
  id: number;
  name: string;
  role: Role;
};

export const ROLES: readonly Role[] = ['admin', 'editor', 'viewer'];
