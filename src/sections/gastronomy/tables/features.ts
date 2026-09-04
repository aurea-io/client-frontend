export const GASTRONOMY_TABLES_FEATURES = {
  status: 'gastronomy.tables.status',
  qrGenerator: 'gastronomy.tables.qr_generator',
  bookings: 'gastronomy.tables.bookings',
} as const;

export type GastronomyTablesFeatureKey = typeof GASTRONOMY_TABLES_FEATURES[keyof typeof GASTRONOMY_TABLES_FEATURES];
