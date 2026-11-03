import type { InvoiceStore } from './invoices.ts';

export type Context = { store: InvoiceStore };
export type Reply = { status: number; body: unknown };

const notFound = (): Reply => ({ status: 404, body: { error: 'not found' } });

export function handle(ctx: Context, method: string, path: string, body: unknown = undefined): Reply {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'invoices') return invoiceRoutes(ctx, method, parts, body);
  return notFound();
}

function invoiceRoutes(ctx: Context, method: string, parts: string[], body: unknown): Reply {
  if (parts.length === 1 && method === 'GET') return { status: 200, body: ctx.store.list() };
  if (parts.length === 1 && method === 'POST') return createInvoice(ctx, body);
  const invoice = parts.length === 2 ? ctx.store.get(parts[1]) : undefined;
  if (invoice && method === 'GET') return { status: 200, body: invoice };
  return notFound();
}

function createInvoice(ctx: Context, body: unknown): Reply {
  const input = (body ?? {}) as { customer?: unknown; amountCents?: unknown; issuedOn?: unknown };
  if (typeof input.customer !== 'string' || !input.customer.trim()) {
    return { status: 400, body: { error: 'customer is required' } };
  }
  if (!Number.isInteger(input.amountCents) || (input.amountCents as number) <= 0) {
    return { status: 400, body: { error: 'amountCents must be a positive integer' } };
  }
  const issuedOn = typeof input.issuedOn === 'string' ? input.issuedOn : new Date().toISOString().slice(0, 10);
  const invoice = ctx.store.create({ customer: input.customer.trim(), amountCents: input.amountCents as number, issuedOn });
  return { status: 201, body: invoice };
}
