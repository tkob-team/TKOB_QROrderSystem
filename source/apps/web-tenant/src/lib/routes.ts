// Centralized route paths for web-tenant (Admin/Staff portal)
// Use these constants across features and app router wrappers.

export const ROUTES = {
  home: '/',
  login: '/auth/login',
  signup: '/auth/signup',
  // Admin routes - all prefixed with /admin
  dashboard: '/admin/dashboard',
  menu: '/admin/menu',
  menuModifiers: '/admin/menu/modifiers',
  menuItemModifiers: '/admin/menu-item-modifiers',
  tables: '/admin/tables',
  tableQRDetail: '/admin/table-qr-detail',
  orders: '/admin/orders',
  analytics: '/admin/analytics',
  staff: '/admin/staff',
  accountSettings: '/admin/account-settings',
  tenantProfile: '/admin/tenant-profile',
  // KDS routes
  kds: '/kds',
  // Waiter routes
  waiter: '/waiter',
  waiterServiceBoard: '/waiter/service-board',
  // Auth routes
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  emailVerification: '/auth/email-verification',
  staffInvitationSignup: '/auth/staff-invitation-signup',
  onboardingWizard: '/auth/onboarding-wizard',
  accessRestricted: '/auth/access-restricted',
  // Legacy admin routes (redirect to KDS/Waiter)
  adminKds: '/admin/kds',
  adminServiceBoard: '/admin/service-board',
} as const;

export type RouteKey = keyof typeof ROUTES;
