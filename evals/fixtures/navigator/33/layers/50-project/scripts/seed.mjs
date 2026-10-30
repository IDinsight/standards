export function seedInvoices() {
  return [
    {
      id: 'INV-1001',
      customer: 'Harbor Supply Co.',
      currency: 'USD',
      lines: [
        { description: 'Pallet wrap', quantity: 4, unitCents: 1250 },
        { description: 'Delivery', quantity: 1, unitCents: 3000 },
      ],
    },
    {
      id: 'INV-1002',
      customer: 'Northgate Bakery',
      currency: 'USD',
      lines: [{ description: 'Flour, 25 kg', quantity: 3, unitCents: 2199 }],
    },
  ];
}
