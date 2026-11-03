export function nextInvoiceNumber(store, year) {
  store.lastNumber += 1;
  return 'INV-' + year + '-' + String(store.lastNumber).padStart(5, '0');
}
