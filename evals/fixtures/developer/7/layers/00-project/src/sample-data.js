export const sampleOrders = [
  {
    id: 1041,
    status: 'paid',
    customer: { name: 'Ana Ruiz', email: 'ana.ruiz@example.com', phone: '555-0101', address: '12 Elm St, Springfield' },
    items: [{ name: 'Stoneware mug', quantity: 2, priceCents: 900 }],
  },
  {
    id: 1042,
    status: 'shipped',
    customer: { name: 'Lee Park', email: 'lee.park@example.com', phone: '555-0144', address: '7 Harbor Rd, Shelbyville' },
    items: [
      { name: 'Linen apron', quantity: 1, priceCents: 2400 },
      { name: 'Tea towel', quantity: 3, priceCents: 650 },
    ],
  },
];
