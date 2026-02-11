'use client';

import { useAuth } from '@/components/providers/auth-provider';
import {
  getPermissions,
  getRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@/lib/jwt-utils';

/**
 * Hook for permission checks
 * Provides convenient permission checking functions based on current auth token
 * 
 * @returns Object with permission checking functions
 * 
 * @example
 * ```tsx
 * function AccountManager() {
 *   const { can, canAny, canAll, permissions } = usePermissions();
 *   
 *   if (!can('ACCOUNT:READ')) {
 *     return <div>Access denied</div>;
 *   }
 *   
 *   return (
 *     <div>
 *       <h1>Accounts</h1>
 *       {can('ACCOUNT:CREATE') && <CreateButton />}
 *       {canAny(['ACCOUNT:EDIT', 'ACCOUNT:UPDATE']) && <EditButton />}
 *       {canAll(['ACCOUNT:READ', 'ACCOUNT:DELETE']) && <AdminPanel />}
 *       
 *       <p>Your permissions: {permissions.join(', ')}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions() {
  const { token } = useAuth();

  return {
    /**
     * Check if user has a specific permission
     * 
     * @param permission - Permission to check (e.g., "ACCOUNT:READ")
     * @returns true if user has the permission
     * 
     * @example
     * ```tsx
     * if (can('DISH:CREATE')) {
     *   // Show create dish button
     * }
     * ```
     */
    can: (permission: string) => hasPermission(token, permission),

    /**
     * Check if user has ANY of the specified permissions
     * 
     * @param permissionsToCheck - Array of permissions
     * @returns true if user has at least one
     * 
     * @example
     * ```tsx
     * if (canAny(['ACCOUNT:EDIT', 'ACCOUNT:UPDATE'])) {
     *   // User can edit OR update
     * }
     * ```
     */
    canAny: (permissionsToCheck: string[]) => hasAnyPermission(token, permissionsToCheck),

    /**
     * Check if user has ALL of the specified permissions
     * 
     * @param permissionsToCheck - Array of permissions
     * @returns true if user has all permissions
     * 
     * @example
     * ```tsx
     * if (canAll(['ACCOUNT:READ', 'ACCOUNT:DELETE'])) {
     *   // User has both permissions
     * }
     * ```
     */
    canAll: (permissionsToCheck: string[]) => hasAllPermissions(token, permissionsToCheck),

    /**
     * Get all user permissions as array
     */
    permissions: getPermissions(token),

    /**
     * Get all user roles as array
     */
    roles: getRoles(token),
  };
}

// NOTE: Frontend permissions are UX only - always validate on backend

/**
 * TanStack Query example - protecting API calls
 * 
 * @example
 * ```tsx
 * import { useQuery } from '@tanstack/react-query';
 * import { usePermissions } from '@/hooks/use-permissions';
 * 
 * function AccountsList() {
 *   const { can } = usePermissions();
 *   
 *   // Only fetch if user has permission
 *   const { data, isLoading } = useQuery({
 *     queryKey: ['accounts'],
 *     queryFn: fetchAccounts,
 *     enabled: can('ACCOUNT:READ'), // Don't fetch without permission
 *   });
 *   
 *   if (!can('ACCOUNT:READ')) {
 *     return <div>You don't have permission to view accounts</div>;
 *   }
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   
 *   return (
 *     <div>
 *       {data?.map(account => (
 *         <AccountCard key={account.id} account={account} />
 *       ))}
 *     </div>
 *   );
 * }
 * 
 * // Using mutation with permission check
 * function CreateAccountButton() {
 *   const { can } = usePermissions();
 *   
 *   const mutation = useMutation({
 *     mutationFn: createAccount,
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: ['accounts'] });
 *     },
 *   });
 *   
 *   if (!can('ACCOUNT:CREATE')) {
 *     return null; // Hide button if no permission
 *   }
 *   
 *   return (
 *     <button onClick={() => mutation.mutate(newAccountData)}>
 *       Create Account
 *     </button>
 *   );
 * }
 * ```
 */
