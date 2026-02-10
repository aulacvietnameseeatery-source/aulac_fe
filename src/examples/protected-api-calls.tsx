/**
 * Protected API Call Examples
 * Demonstrates how to integrate permissions with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuth } from '@/components/providers/auth-provider';
import { Permissions } from '@/types/const';
import { api } from '@/lib/http';

// ============================================================================
// Example 1: Protected Query - Only fetch if user has permission
// ============================================================================

interface Account {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export function useAccountsList() {
  const { can } = usePermissions();
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.get<Account[]>('/api/accounts'),
    // Only fetch if authenticated AND has permission
    enabled: isAuthenticated && can(Permissions.ViewAccount),
    // Optional: Show error if no permission
    retry: (failureCount, error) => {
      // Don't retry if it's a permission error
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Usage in component:
function AccountsListExample() {
  const { can } = usePermissions();
  const { data, isLoading, error } = useAccountsList();

  // Guard clause for permission check
  if (!can(Permissions.ViewAccount)) {
    return <div>You don&apos;t have permission to view accounts</div>;
  }

  if (isLoading) return <div>Loading accounts...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map((account) => (
        <div key={account.id}>{account.username}</div>
      ))}
    </div>
  );
}

// ============================================================================
// Example 2: Protected Mutation - Create account
// ============================================================================

interface CreateAccountRequest {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

export function useCreateAccount() {
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountRequest) => 
      api.post<Account>('/api/accounts', data),
    onSuccess: () => {
      // Invalidate accounts list to refetch
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    // Optional: Prevent mutation if no permission (extra safety)
    onMutate: async () => {
      if (!can(Permissions.CreateAccount)) {
        throw new Error('Insufficient permissions to create accounts');
      }
    },
  });
}

// Usage in component:
function CreateAccountButtonExample() {
  const { can } = usePermissions();
  const { mutate: createAccount, isPending } = useCreateAccount();

  // Don't render if no permission
  if (!can(Permissions.CreateAccount)) {
    return null;
  }

  const handleCreate = () => {
    createAccount({
      username: 'newuser',
      email: 'user@example.com',
      password: 'password123',
      roles: ['User'],
    });
  };

  return (
    <button onClick={handleCreate} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Account'}
    </button>
  );
}

// ============================================================================
// Example 3: Multi-Permission Check - Edit OR Update
// ============================================================================

interface UpdateAccountRequest {
  username?: string;
  email?: string;
}

export function useUpdateAccount(accountId: number) {
  const { canAny } = usePermissions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAccountRequest) =>
      api.put<Account>(`/api/accounts/${accountId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts', accountId] });
    },
    onMutate: async () => {
      // Require EITHER edit OR update permission
      if (!canAny([Permissions.EditAccount, Permissions.UpdateAccount])) {
        throw new Error('Insufficient permissions to modify accounts');
      }
    },
  });
}

// ============================================================================
// Example 4: All Permissions Required - Admin Action
// ============================================================================

export function useDeleteAccount() {
  const { canAll } = usePermissions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: number) =>
      api.delete(`/api/accounts/${accountId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onMutate: async () => {
      // Require BOTH read AND delete permissions
      if (!canAll([Permissions.ViewAccount, Permissions.DeleteAccount])) {
        throw new Error('Insufficient permissions. Requires both READ and DELETE.');
      }
    },
  });
}

// ============================================================================
// Example 5: Conditional Query Parameters Based on Permissions
// ============================================================================

interface DishesQueryParams {
  includeHidden?: boolean; // Only admins can see hidden dishes
  includeDeleted?: boolean; // Only admins can see deleted dishes
}

export function useDishes() {
  const { can } = usePermissions();

  // Adjust query params based on permissions
  const params: DishesQueryParams = {
    includeHidden: can(Permissions.EditDish),
    includeDeleted: can(Permissions.DeleteDish),
  };

  return useQuery({
    queryKey: ['dishes', params],
    queryFn: () => api.get('/api/dishes', { 
      headers: { 
        'X-Include-Hidden': params.includeHidden ? 'true' : 'false',
        'X-Include-Deleted': params.includeDeleted ? 'true' : 'false',
      } 
    }),
    enabled: can(Permissions.ViewDish),
  });
}

// ============================================================================
// Example 6: Optimistic Updates with Permission Checks
// ============================================================================

export function useToggleDishStatus(dishId: number) {
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isActive: boolean) =>
      api.patch(`/api/dishes/${dishId}`, { isActive }),
    
    // Optimistic update
    onMutate: async (isActive) => {
      if (!can(Permissions.EditDish)) {
        throw new Error('Insufficient permissions');
      }

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['dishes', dishId] });

      // Snapshot previous value
      const previousDish = queryClient.getQueryData(['dishes', dishId]);

      // Optimistically update
      queryClient.setQueryData(['dishes', dishId], (old: any) => ({
        ...old,
        isActive,
      }));

      return { previousDish };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousDish) {
        queryClient.setQueryData(['dishes', dishId], context.previousDish);
      }
    },

    // Refetch on success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes', dishId] });
    },
  });
}

// ============================================================================
// Example 7: Role-Based Query Filtering
// ============================================================================

export function useMyTasks() {
  const { userInfo } = useAuth();
  const { roles } = usePermissions();

  return useQuery({
    queryKey: ['tasks', { userId: userInfo?.userId, roles }],
    queryFn: () => {
      // Admins see all tasks, others see only their own
      const isAdmin = roles.includes('Admin');
      const endpoint = isAdmin 
        ? '/api/tasks' 
        : `/api/tasks/user/${userInfo?.userId}`;
      
      return api.get(endpoint);
    },
    enabled: !!userInfo,
  });
}

// ============================================================================
// Export all hooks for easy import
// ============================================================================

export {
  AccountsListExample,
  CreateAccountButtonExample,
};
