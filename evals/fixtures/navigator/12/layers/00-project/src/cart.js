export function lineTotal(item) {
  if (!Number.isInteger(item.unitPrice) || item.unitPrice < 0) {
    throw new RangeError(`invalid price for ${item.sku}`);
  }
  if (!Number.isInteger(item.quantity) || item.quantity < 1) {
    throw new RangeError(`invalid quantity for ${item.sku}`);
  }
  return item.unitPrice * item.quantity;
}
