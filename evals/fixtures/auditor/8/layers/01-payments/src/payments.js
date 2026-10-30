export function recordPayment(service, invoiceId, amountCents) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new RangeError('payment amount must be a positive number of cents');
  }
  const invoice = service.store.get(invoiceId);
  if (!invoice) throw new Error('unknown invoice ' + invoiceId);
  if (invoice.status === 'void') throw new Error('invoice ' + invoiceId + ' is void');
  invoice.paidCents += amountCents;
  service.store.put(invoice);
  return invoice.paidCents;
}
