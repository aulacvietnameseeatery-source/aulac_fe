// src/features/auth/role-create/hooks/useRoleCreate.ts
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createRole, getAllPermissions } from "../services/role-create.service";
import { CreateRoleRequest, PermissionGroupDto } from "../types/role-create.types";

export const useRoleCreate = () => {
  const router = useRouter();
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroupDto[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [roleCode, setRoleCode] = useState("");
  const [roleName, setRoleName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());

  // Validation errors
  const [errors, setErrors] = useState<{
    roleCode?: string;
    roleName?: string;
  }>({});

  // Load all permissions on mount
  useEffect(() => {
    const fetchPermissions = async () => {
      setIsLoadingPermissions(true);
      try {
        const response = await getAllPermissions();
        if (response?.permissionGroups) {
          // Set all permissions as unassigned initially
          const unassignedGroups = response.permissionGroups.map((group: PermissionGroupDto) => ({
            ...group,
            permissions: group.permissions.map((p) => ({ ...p, isAssigned: false }))
          }));
          setPermissionGroups(unassignedGroups);
        }
      } catch (error: any) {
        console.error("Failed to load permissions:", error);
        toast.error("Failed to load permissions");
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, []);

  // Update permission groups when selections change
  const updatedPermissionGroups = useMemo(() => {
    return permissionGroups.map(group => ({
      ...group,
      permissions: group.permissions.map(p => ({
        ...p,
        isAssigned: selectedPermissions.has(p.permissionId)
      }))
    }));
  }, [permissionGroups, selectedPermissions]);

  // Check if all permissions are selected
  const allPermissionsSelected = useMemo(() => {
    const totalPermissions = permissionGroups.reduce((acc, g) => acc + g.permissions.length, 0);
    return selectedPermissions.size === totalPermissions && totalPermissions > 0;
  }, [permissionGroups, selectedPermissions]);

  // Toggle individual permission
  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  // Toggle all permissions in a group
  const toggleGroupPermissions = (group: PermissionGroupDto) => {
    const groupPermissionIds = group.permissions.map(p => p.permissionId);
    const allSelected = groupPermissionIds.every(id => selectedPermissions.has(id));
    
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        groupPermissionIds.forEach(id => newSet.delete(id));
      } else {
        groupPermissionIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  // Toggle all permissions
  const toggleAllPermissions = () => {
    if (allPermissionsSelected) {
      setSelectedPermissions(new Set());
    } else {
      const allIds = permissionGroups.flatMap(g => g.permissions.map(p => p.permissionId));
      setSelectedPermissions(new Set(allIds));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!roleCode.trim()) {
      newErrors.roleCode = "Role code is required";
    } else if (roleCode.length > 50) {
      newErrors.roleCode = "Role code must not exceed 50 characters";
    }
    
    if (!roleName.trim()) {
      newErrors.roleName = "Role name is required";
    } else if (roleName.length > 100) {
      newErrors.roleName = "Role name must not exceed 100 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const request: CreateRoleRequest = {
      roleCode: roleCode.trim(),
      roleName: roleName.trim(),
      isActive,
      permissionIds: Array.from(selectedPermissions)
    };

    setIsSubmitting(true);
    try {
      const createdRole = await createRole(request);
      toast.success("Role created successfully");
      router.push(`/dashboard/roles/${createdRole.roleId}`);
    } catch (error: any) {
      console.error("Failed to create role:", error);
      const errorMessage = error.response?.data?.userMessage || "Failed to create role";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/roles");
  };

  return {
    // Form fields
    roleCode,
    setRoleCode,
    roleName,
    setRoleName,
    isActive,
    setIsActive,
    
    // Permissions
    permissionGroups: updatedPermissionGroups,
    selectedPermissions,
    allPermissionsSelected,
    togglePermission,
    toggleGroupPermissions,
    toggleAllPermissions,
    
    // State
    isLoadingPermissions,
    isSubmitting,
    errors,
    
    // Actions
    handleSubmit,
    handleCancel
  };
};
