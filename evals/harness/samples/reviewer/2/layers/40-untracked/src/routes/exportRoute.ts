import { requireAdmin, type User } from '../auth/authorize.ts';
import { toCsv, type Row } from '../export.ts';

export function exportRoute(actor: User, rows: Row[]): { status: number; body: string } {
  requireAdmin(actor);
  return { status: 200, body: toCsv(rows) };
}
