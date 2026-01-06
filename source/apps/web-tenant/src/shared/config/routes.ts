// Centralized route paths for web-tenant (Admin/Staff portal)
// Use these constants across features and app router wrappers.

export const ROUTES = {
  home: '/',
  login: '/auth/login',
  signup: '/auth/signup',
  // Admin routes - all prefixed with /admin
  dashboard: '/admin/dashboard',
  menu: '/admin/menu',
  menuModifiers: '/admin/menu?tab=modifiers', // Canonical: /admin/menu with tab param
  menuItemModifiers: '/admin/menu-item-modifiers',
  tables: '/admin/tables',
  tableQRDetail: (tableId: string) => `/admin/tables/${tableId}/qr`,
  orders: '/admin/orders',
  analytics: '/admin/analytics',
  staff: '/admin/staff',
  accountSettings: '/admin/account-settings',
  tenantProfile: '/admin/tenant-profile',
  // KDS routes
  kds: '/kds',
  // Waiter routes
  waiter: '/waiter',
  waiterServiceBoard: '/waiter',
  // Public menu preview
  menuPreview: '/menu',
  // Auth routes
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  emailVerification: '/auth/email-verification',
  staffInvitationSignup: '/auth/staff-invitation-signup',
  onboardingWizard: '/auth/onboarding-wizard',
  accessRestricted: '/auth/access-restricted',
} as const;

export type RouteKey = keyof typeof ROUTES;
