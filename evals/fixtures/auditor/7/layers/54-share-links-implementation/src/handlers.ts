import type { InvoiceStore } from './invoices.ts';
import type { ShareLinks } from './share-links.ts';

export type Context = { store: InvoiceStore; links?: ShareLinks; now?: () => number };
export type Reply = { status: number; body: unknown };

const notFound = (): Reply => ({ status: 404, body: { error: 'not found' } });
const clock = (ctx: Context): number => (ctx.now ? ctx.now() : Date.now());

export function handle(ctx: Context, method: string, path: string, body: unknown = undefined): Reply {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'invoices') return invoiceRoutes(ctx, method, parts, body);
  if (parts[0] === 'shared' && parts.length === 2 && ctx.links) return sharedRoutes(ctx, method, parts[1]);
  return notFound();
}

function invoiceRoutes(ctx: Context, method: string, parts: string[], body: unknown): Reply {
  if (parts.length === 1 && method === 'GET') return { status: 200, body: ctx.store.list() };
  if (parts.length === 1 && method === 'POST') return createInvoice(ctx, body);
  const invoice = parts[1] ? ctx.store.get(parts[1]) : undefined;
  if (!invoice) return notFound();
  if (parts.length === 2 && method === 'GET') return { status: 200, body: invoice };
  if (parts.length === 3 && parts[2] === 'share' && method === 'POST' && ctx.links) {
    const link = ctx.links.create(invoice.id, clock(ctx));
    return { status: 201, body: { token: link.token, expiresAt: new Date(link.expiresAt).toISOString() } };
  }
  return notFound();
}

function sharedRoutes(ctx: Context, method: string, token: string): Reply {
  const links = ctx.links as ShareLinks;
  if (method === 'GET') {
    const invoice = links.resolve(token, clock(ctx));
    return invoice ? { status: 200, body: invoice } : notFound();
  }
  if (method === 'DELETE') return links.revoke(token) ? { status: 204, body: null } : notFound();
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
