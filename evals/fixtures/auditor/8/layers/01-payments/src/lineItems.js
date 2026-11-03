export function editLineItem(service, invoiceId, index, changes) {
  const invoice = service.store.get(invoiceId);
  if (!invoice) throw new Error('unknown invoice ' + invoiceId);
  const item = invoice.lineItems[index];
  if (!item) throw new RangeError('invoice ' + invoiceId + ' has no line item ' + index);
  invoice.lineItems[index] = { ...item, ...changes };
  service.store.put(invoice);
  return invoice.lineItems[index];
}
