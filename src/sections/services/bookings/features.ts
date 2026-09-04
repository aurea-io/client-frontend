export const SERVICES_BOOKINGS_FEATURES = {
  create: 'services.bookings.create',
  reschedule: 'services.bookings.reschedule',
  photoUpload: 'services.bookings.photo_upload',
  staffAssignment: 'services.bookings.staff_assignment',
  notifications: 'services.bookings.notifications',
} as const;

export type ServicesBookingsFeatureKey = typeof SERVICES_BOOKINGS_FEATURES[keyof typeof SERVICES_BOOKINGS_FEATURES];
