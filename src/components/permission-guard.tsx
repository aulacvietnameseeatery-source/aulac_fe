'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionGuardProps {
  /**
   * Single permission to check
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
   * Content to show when user lacks permission
   */
  fallback?: ReactNode;
  
  /**
   * Content to show when user has permission
   */
  children: ReactNode;
}

/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 * 
 * @example
 * ```tsx
 * // Single permission check
 * <PermissionGuard permission="ACCOUNT:CREATE">
 *   <CreateAccountButton />
 * </PermissionGuard>
 * 
 * // Any permission (OR logic)
 * <PermissionGuard permissions={['ACCOUNT:EDIT', 'ACCOUNT:UPDATE']}>
 *   <EditButton />
 * </PermissionGuard>
 * 
 * // All permissions (AND logic)
 * <PermissionGuard 
 *   permissions={['ACCOUNT:READ', 'ACCOUNT:DELETE']} 
 *   requireAll
 * >
 *   <AdminPanel />
 * </PermissionGuard>
 * 
 * // With fallback
 * <PermissionGuard 
 *   permission="DISH:READ"
 *   fallback={<div>You need DISH:READ permission</div>}
 * >
 *   <DishList />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { can, canAny, canAll } = usePermissions();

  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = can(permission);
  } else if (permissions && permissions.length > 0) {
    // Multiple permissions check
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  } else {
    // No permission specified - allow access
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// NOTE: Frontend permissions are UX only - always validate on backend
