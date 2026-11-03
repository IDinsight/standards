export type Role = 'admin' | 'editor' | 'viewer';

// Every user belongs to exactly one tenant.
export type User = {
  id: number;
  name: string;
  role: Role;
  tenantId: string;
};

export const ROLES: readonly Role[] = ['admin', 'editor', 'viewer'];
