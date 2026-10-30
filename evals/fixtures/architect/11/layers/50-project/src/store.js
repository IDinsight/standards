export function createStore() {
  return { invoices: new Map(), payments: [], lastNumber: 0 };
}
