'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { useTranslations } from 'next-intl';

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
   * If true, renders children in a visually disabled/blurred state instead of hiding them when unauthorized.
   */
  showDisabled?: boolean;

  /**
   * Content to show when user has permission
   */
  children: ReactNode;
}

/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 */
export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  showDisabled = false,
  children,
}: PermissionGuardProps) {
  const { can, canAny, canAll } = usePermissions();
  const t = useTranslations('common.permission');

  let hasAccess = false;

  if (permission) {
    hasAccess = can(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    if (showDisabled) {
      return (
        <span
          className="inline-block opacity-50 grayscale blur-[0.5px] cursor-not-allowed"
          title={t('noAccess')}
        >
          <span className="pointer-events-none">
            {children}
          </span>
        </span>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// NOTE: Frontend permissions are UX only - always validate on backend
