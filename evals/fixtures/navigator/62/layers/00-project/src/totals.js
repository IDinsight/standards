export function lineTotal(item) {
  return Math.round(item.quantity * item.unitPrice * 100) / 100;
}

export function invoiceTotal(items, { taxRate = 0 } = {}) {
  const subtotal = Math.round(items.reduce((sum, item) => sum + lineTotal(item), 0) * 100) / 100;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  return { subtotal, tax, total: Math.round((subtotal + tax) * 100) / 100 };
}
