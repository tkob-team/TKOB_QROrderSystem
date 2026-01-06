// Role-based routing and navigation utilities
// Extracted from Admin-screens-v3 App.tsx patterns

export type UserRole = 'admin' | 'waiter' | 'kds' | null;

type RoleRoutes = {
  [K in Exclude<UserRole, null>]: string;
} & { null: string };

type RoleAllowedRoutes = {
  [K in Exclude<UserRole, null>]: string[];
} & { null: string[] };

export const ROLE_HOME_ROUTES: RoleRoutes = {
  admin: '/admin/dashboard',
  waiter: '/waiter',
  kds: '/kds',
  null: '/auth/login',
};

export const ROLE_ALLOWED_ROUTES: RoleAllowedRoutes = {
  admin: ['/admin/*', '/admin/account-settings'],
  waiter: ['/waiter/*', '/admin/account-settings'],
  kds: ['/kds/*'],
  null: ['/auth/*'],
};

/**
 * Get the home route for a given user role
 * @param role User role (admin, waiter, kds, or null)
 * @returns Home route path for the role
 */
export function getHomeRouteForRole(role: UserRole): string {
  console.log('[navigation.ts] getHomeRouteForRole called with role:', role);
  console.log('[navigation.ts] ROLE_HOME_ROUTES:', JSON.stringify(ROLE_HOME_ROUTES));
  
  if (role === null) {
    console.log('[navigation.ts] Returning for null role:', ROLE_HOME_ROUTES.null);
    return ROLE_HOME_ROUTES.null;
  }
  
  const route = ROLE_HOME_ROUTES[role];
  console.log('[navigation.ts] Returning route for role', role, ':', route);
  return route;
}

/**
 * Check if a user role can access a given route path
 * @param role User role (admin, waiter, kds, or null)
 * @param path Route path to check (e.g., '/admin/dashboard')
 * @returns True if role can access the path
 */
export function canAccessRoute(role: UserRole, path: string): boolean {
  const allowed = role === null ? ROLE_ALLOWED_ROUTES.null : ROLE_ALLOWED_ROUTES[role];
  return allowed.some((pattern: string) => {
    if (pattern.endsWith('/*')) {
      return path.startsWith(pattern.slice(0, -2));
    }
    return path === pattern;
  });
}

/**
 * Get the default redirect route after login based on user role
 * @param role User role (admin, waiter, kds)
 * @returns Redirect path
 */
export function getDefaultRedirectAfterLogin(role: UserRole): string {
  if (!role) return '/auth/login';
  return getHomeRouteForRole(role);
}
