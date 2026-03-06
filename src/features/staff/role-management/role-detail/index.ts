// src/features/auth/role-detail/index.ts

// Components
export { RoleDetailForm } from './components/RoleDetailForm';

// Hooks
export { useRoleDetail } from './hooks/useRoleDetail';

// Types
export type {
  RoleDetailDto,
  PermissionGroupDto,
  PermissionItemDto
} from './types/role-detail.types';

// Services
export { getRoleDetail } from './services/role-detail.service';
