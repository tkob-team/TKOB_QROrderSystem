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
  profile: '/admin/profile',
  settings: '/admin/settings',
  // KDS routes - Owner views in admin panel, Kitchen staff uses standalone
  kds: '/admin/kds',
  kdsStandalone: '/kds', // For kitchen staff only
  // Waiter routes - Owner views in admin panel, Waiter staff uses standalone  
  waiter: '/waiter',
  waiterServiceBoard: '/admin/service-board', // Owner view with sidebar
  waiterStandalone: '/waiter', // For waiter staff only
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
