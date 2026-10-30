import type { User } from '../auth/users.ts';

export type AppRequest = {
  method: 'GET' | 'POST';
  path: string;
  query: Record<string, string>;
  user: User | null;
};

export type AppResponse = {
  status: number;
  headers: Record<string, string>;
  body: string;
};

export function json(status: number, data: unknown): AppResponse {
  return { status, headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(data) };
}
