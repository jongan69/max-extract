export const STRIPE_PRODUCTS = {
  REMOVE_ACCOUNT: {
    priceId: 'price_1RKq81BMOs3y3wqZ4h2HBF2I',
    name: 'Remove Account',
    description: 'User is paying to have their account removed from the app',
    mode: 'payment' as const,
    price: 49.99,
  },
} as const;