/**
 * Common Authentication Patterns
 * Reusable patterns and utilities for auth implementation
 */

import { useAuth } from '@/components/providers/auth-provider';
import { usePermissions } from '@/hooks/use-permissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// ============================================================================
// Pattern 1: Require Authentication
// ============================================================================

/**
 * Hook to require authentication, redirects to login if not authenticated
 * 
 * @param redirectTo - Path to redirect to (default: /login)
 * 
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   useRequireAuth(); // Redirects if not authenticated
 *   
 *   return <div>Protected content</div>;
 * }
 * ```
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after auth is initialized to prevent false negatives
    if (isInitialized && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isInitialized, router, redirectTo]);

  return isAuthenticated;
}

// ============================================================================
// Pattern 2: Require Specific Permission
// ============================================================================

/**
 * Hook to require a specific permission, redirects if missing
 * 
 * @param permission - Required permission
 * @param redirectTo - Path to redirect to (default: /unauthorized)
 * 
 * @example
 * ```tsx
 * function AccountsPage() {
 *   useRequirePermission('ACCOUNT:READ');
 *   
 *   return <div>Accounts list</div>;
 * }
 * ```
 */
export function useRequirePermission(
  permission: string,
  redirectTo: string = '/unauthorized'
) {
  const { isAuthenticated, isInitialized } = useAuth();
  const { can } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to initialize before checking
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!can(permission)) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isInitialized, can, permission, router, redirectTo]);

  return can(permission);
}

// ============================================================================
// Pattern 3: Require Any of Multiple Permissions
// ============================================================================

/**
 * Hook to require ANY of the specified permissions
 * 
 * @param permissions - Array of permissions (OR logic)
 * @param redirectTo - Path to redirect to (default: /unauthorized)
 * 
 * @example
 * ```tsx
 * function EditAccountPage() {
 *   useRequireAnyPermission(['ACCOUNT:EDIT', 'ACCOUNT:UPDATE']);
 *   
 *   return <div>Edit form</div>;
 * }
 * ```
 */
export function useRequireAnyPermission(
  permissions: string[],
  redirectTo: string = '/unauthorized'
) {
  const { isAuthenticated, isInitialized } = useAuth();
  const { canAny } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to initialize before checking
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!canAny(permissions)) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isInitialized, canAny, permissions, router, redirectTo]);

  return canAny(permissions);
}

// ============================================================================
// Pattern 4: Require All Permissions
// ============================================================================

/**
 * Hook to require ALL of the specified permissions
 * 
 * @param permissions - Array of permissions (AND logic)
 * @param redirectTo - Path to redirect to (default: /unauthorized)
 * 
 * @example
 * ```tsx
 * function AdminPanel() {
 *   useRequireAllPermissions(['ACCOUNT:READ', 'ROLE:READ']);
 *   
 *   return <div>Admin panel</div>;
 * }
 * ```
 */
export function useRequireAllPermissions(
  permissions: string[],
  redirectTo: string = '/unauthorized'
) {
  const { isAuthenticated, isInitialized } = useAuth();
  const { canAll } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to initialize before checking
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!canAll(permissions)) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isInitialized, canAll, permissions, router, redirectTo]);

  return canAll(permissions);
}

// ============================================================================
// Pattern 5: Guest Only (redirect authenticated users)
// ============================================================================

/**
 * Hook for guest-only pages (login, register, etc.)
 * Redirects authenticated users to dashboard
 * 
 * @param redirectTo - Path to redirect to (default: /dashboard)
 * 
 * @example
 * ```tsx
 * function LoginPage() {
 *   useGuestOnly(); // Redirects to dashboard if already logged in
 *   
 *   return <LoginForm />;
 * }
 * ```
 */
export function useGuestOnly(redirectTo: string = '/dashboard') {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after auth is initialized
    if (isInitialized && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isInitialized, router, redirectTo]);

  return !isAuthenticated;
}

// ============================================================================
// Pattern 6: Role-Based Access
// ============================================================================

/**
 * Hook to check if user has specific role
 * 
 * @param role - Required role
 * 
 * @example
 * ```tsx
 * function AdminDashboard() {
 *   const isAdmin = useHasRole('Admin');
 *   
 *   if (!isAdmin) {
 *     return <div>Admin access only</div>;
 *   }
 *   
 *   return <div>Admin dashboard</div>;
 * }
 * ```
 */
export function useHasRole(role: string): boolean {
  const { roles } = usePermissions();
  return roles.includes(role);
}

/**
 * Hook to check if user has ANY of the specified roles
 * 
 * @param rolesToCheck - Array of roles
 * 
 * @example
 * ```tsx
 * const isManager = useHasAnyRole(['Admin', 'Manager']);
 * ```
 */
export function useHasAnyRole(rolesToCheck: string[]): boolean {
  const { roles } = usePermissions();
  return rolesToCheck.some((role) => roles.includes(role));
}

/**
 * Hook to check if user has ALL of the specified roles
 * 
 * @param rolesToCheck - Array of roles
 * 
 * @example
 * ```tsx
 * const isSuperAdmin = useHasAllRoles(['Admin', 'SuperUser']);
 * ```
 */
export function useHasAllRoles(rolesToCheck: string[]): boolean {
  const { roles } = usePermissions();
  return rolesToCheck.every((role) => roles.includes(role));
}

// ============================================================================
// Pattern 7: User Info Helpers
// ============================================================================

/**
 * Hook to get current user ID
 * 
 * @example
 * ```tsx
 * const userId = useUserId();
 * ```
 */
export function useUserId(): string | null {
  const { userInfo } = useAuth();
  return userInfo?.userId || null;
}

/**
 * Hook to get current username
 * 
 * @example
 * ```tsx
 * const username = useUsername();
 * ```
 */
export function useUsername(): string | null {
  const { userInfo } = useAuth();
  return userInfo?.username || null;
}

/**
 * Hook to check if current user is the owner of a resource
 * 
 * @param ownerId - Resource owner ID
 * 
 * @example
 * ```tsx
 * function PostActions({ post }) {
 *   const isOwner = useIsOwner(post.authorId);
 *   
 *   return (
 *     <div>
 *       {isOwner && <EditButton />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIsOwner(ownerId: string | number): boolean {
  const { userInfo } = useAuth();
  if (!userInfo) return false;
  
  return String(userInfo.userId) === String(ownerId);
}

// ============================================================================
// Pattern 8: Combined Auth & Permission Check
// ============================================================================

/**
 * Hook combining authentication and permission check
 * 
 * @param permission - Required permission
 * 
 * @example
 * ```tsx
 * function CreateDishButton() {
 *   const canCreate = useAuthAndPermission('DISH:CREATE');
 *   
 *   if (!canCreate) return null;
 *   
 *   return <button>Create Dish</button>;
 * }
 * ```
 */
export function useAuthAndPermission(permission: string): boolean {
  const { isAuthenticated } = useAuth();
  const { can } = usePermissions();
  
  return isAuthenticated && can(permission);
}

// ============================================================================
// Pattern 9: Token Expiration Warning
// ============================================================================

/**
 * Hook to get remaining time until token expiration
 * 
 * @returns Seconds until expiration, or null if not authenticated
 * 
 * @example
 * ```tsx
 * function TokenExpirationWarning() {
 *   const timeRemaining = useTokenExpiration();
 *   
 *   if (!timeRemaining) return null;
 *   
 *   if (timeRemaining < 300) { // Less than 5 minutes
 *     return <div>Session expiring soon!</div>;
 *   }
 *   
 *   return null;
 * }
 * ```
 */
export function useTokenExpiration(): number | null {
  const { token } = useAuth();
  
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const remaining = Math.floor((exp - now) / 1000); // Convert to seconds
    
    return remaining > 0 ? remaining : 0;
  } catch {
    return null;
  }
}

// ============================================================================
// Export all patterns
// ============================================================================

export const authPatterns = {
  useRequireAuth,
  useRequirePermission,
  useRequireAnyPermission,
  useRequireAllPermissions,
  useGuestOnly,
  useHasRole,
  useHasAnyRole,
  useHasAllRoles,
  useUserId,
  useUsername,
  useIsOwner,
  useAuthAndPermission,
  useTokenExpiration,
};
