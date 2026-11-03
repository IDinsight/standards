export function serializeInvoice(invoice) {
  return {
    id: invoice.id,
    customer: invoice.customer,
    issued_at: invoice.issuedAt.toISOString(),
    amount_cents: invoice.amountCents,
    currency: invoice.currency,
    status: invoice.status,
  };
}
