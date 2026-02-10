'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { usePermissions } from '@/hooks/use-permissions';

interface ProtectedRouteProps {
  /**
   * Single permission required to access route
   */
  permission?: string;
  
  /**
   * Multiple permissions to check
   */
  permissions?: string[];
  
  /**
   * If true, requires ALL permissions. If false (default), requires ANY permission.
   */
  requireAll?: boolean;
  
  /**
   * Custom redirect path (default: /unauthorized)
   */
  redirectTo?: string;
  
  /**
   * Redirect to login if not authenticated (default: false)
   */
  requireAuth?: boolean;
  
  /**
   * Login redirect path (default: /login)
   */
  loginPath?: string;
  
  /**
   * Content to render if authorized
   */
  children: ReactNode;
}

/**
 * Protected Route Component
 * Redirects user if they lack required permissions or authentication
 * 
 * @example
 * ```tsx
 * // In a page component
 * export default function AccountsPage() {
 *   return (
 *     <ProtectedRoute permission="ACCOUNT:READ">
 *       <AccountsList />
 *     </ProtectedRoute>
 *   );
 * }
 * 
 * // Require authentication + permission
 * export default function DishCreatePage() {
 *   return (
 *     <ProtectedRoute 
 *       permission="DISH:CREATE"
 *       requireAuth
 *     >
 *       <CreateDishForm />
 *     </ProtectedRoute>
 *   );
 * }
 * 
 * // Require multiple permissions (ANY)
 * export default function EditPage() {
 *   return (
 *     <ProtectedRoute permissions={['ACCOUNT:EDIT', 'ACCOUNT:UPDATE']}>
 *       <EditForm />
 *     </ProtectedRoute>
 *   );
 * }
 * 
 * // Require multiple permissions (ALL)
 * export default function AdminPage() {
 *   return (
 *     <ProtectedRoute 
 *       permissions={['ACCOUNT:READ', 'ROLE:READ']}
 *       requireAll
 *     >
 *       <AdminDashboard />
 *     </ProtectedRoute>
 *   );
 * }
 * 
 * // Custom redirect paths
 * export default function SettingsPage() {
 *   return (
 *     <ProtectedRoute 
 *       permission="SYSTEM_SETTING:READ"
 *       redirectTo="/forbidden"
 *       requireAuth
 *       loginPath="/auth/login"
 *     >
 *       <SystemSettings />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export function ProtectedRoute({
  permission,
  permissions,
  requireAll = false,
  redirectTo = '/unauthorized',
  requireAuth = false,
  loginPath = '/login',
  children,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { can, canAny, canAll } = usePermissions();

  useEffect(() => {
    // Check authentication first
    if (requireAuth && !isAuthenticated) {
      router.push(loginPath);
      return;
    }

    // Check permissions
    let hasAccess = true;

    if (permission) {
      hasAccess = can(permission);
    } else if (permissions && permissions.length > 0) {
      hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
    }

    if (!hasAccess) {
      router.push(redirectTo);
    }
  }, [
    isAuthenticated,
    requireAuth,
    permission,
    permissions,
    requireAll,
    can,
    canAny,
    canAll,
    router,
    redirectTo,
    loginPath,
  ]);

  // Determine if user has access
  let hasAccess = true;

  if (requireAuth && !isAuthenticated) {
    hasAccess = false;
  }

  if (permission && !can(permission)) {
    hasAccess = false;
  }

  if (permissions && permissions.length > 0) {
    if (requireAll && !canAll(permissions)) {
      hasAccess = false;
    } else if (!requireAll && !canAny(permissions)) {
      hasAccess = false;
    }
  }

  // Don't render until we know user has access
  // This prevents flash of unauthorized content
  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}

// NOTE: Frontend permissions are UX only - always validate on backend
