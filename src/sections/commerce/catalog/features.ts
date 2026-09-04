export const COMMERCE_CATALOG_FEATURES = {
  items: 'commerce.catalog.items',
  addToCart: 'commerce.catalog.add_to_cart',
  variants: 'commerce.catalog.variants',
  images: 'commerce.catalog.images',
  stockBadge: 'commerce.catalog.stock_badge',
} as const;

export type CommerceCatalogFeatureKey = typeof COMMERCE_CATALOG_FEATURES[keyof typeof COMMERCE_CATALOG_FEATURES];
