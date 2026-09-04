export const COMMERCE_ORDERS_FEATURES = {
  takeaway: 'commerce.orders.takeaway',
  delivery: 'commerce.orders.delivery',
  splitBill: 'commerce.orders.split_bill',
  fiscalReceipt: 'commerce.orders.fiscal_receipt',
  realtime: 'commerce.orders.realtime',
} as const;

export type CommerceOrdersFeatureKey = typeof COMMERCE_ORDERS_FEATURES[keyof typeof COMMERCE_ORDERS_FEATURES];
