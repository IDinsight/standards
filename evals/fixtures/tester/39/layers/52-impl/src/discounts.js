const CODES = new Map([
  ['SPRING10', { percent: 10, expires: '2026-12-31' }],
  ['STAFF25', { percent: 25, expires: '2027-06-30' }],
  ['WELCOME5', { percent: 5, expires: '2026-03-31' }],
]);

export class DiscountError extends Error {
  constructor(discountCode, reason) {
    super(`Discount code ${discountCode} is ${reason}`);
    this.name = 'DiscountError';
    this.discountCode = discountCode;
  }
}

export function lookupDiscount(discountCode, today) {
  const entry = CODES.get(discountCode.trim().toUpperCase());
  if (!entry) throw new DiscountError(discountCode, 'unknown');
  if (entry.expires <= today) throw new DiscountError(discountCode, 'expired');
  return entry.percent;
}
