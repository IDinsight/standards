export const STATUSES = ['pending', 'paid', 'shipped', 'cancelled'];

export function createStore(orders = []) {
  const rows = orders.map((order) => ({ ...order }));
  return {
    list({ status } = {}) {
      return rows
        .filter((order) => status === undefined || order.status === status)
        .sort((a, b) => a.id - b.id);
    },
    add(order) {
      if (!STATUSES.includes(order.status)) throw new Error(`unknown status: ${order.status}`);
      rows.push({ ...order });
    },
  };
}
