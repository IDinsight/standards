const TAX_RATE = 0.08;

function cents(amount) {
  return Math.round(amount * 100) / 100;
}

export function orderTotals(items) {
  const subtotal = cents(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const tax = cents(subtotal * TAX_RATE);
  return { subtotal, tax, total: cents(subtotal + tax) };
}
