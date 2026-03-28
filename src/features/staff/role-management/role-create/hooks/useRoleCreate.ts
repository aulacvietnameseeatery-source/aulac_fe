
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createRole, getAllPermissions } from "../services/role-create.service";
import { CreateRoleRequest, PermissionGroupDto } from "../types/role-create.types";

export const useRoleCreate = () => {
  const router = useRouter();
  const t = useTranslations("Role.Create");
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroupDto[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());

  // Validation errors
  const [errors, setErrors] = useState<{
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
        toast.error(t("notifications.loadPermissionsError"));
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
    
    if (!roleName.trim()) {
      newErrors.roleName = t("validation.roleNameRequired");
    } else if (roleName.length > 100) {
      newErrors.roleName = t("validation.roleNameMaxLength");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setRoleName("");
    setSelectedPermissions(new Set());
    setErrors({});
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const request: CreateRoleRequest = {
      roleName: roleName.trim(),
      permissionIds: Array.from(selectedPermissions)
    };

    setIsSubmitting(true);
    try {
      const newRole = await createRole(request);
      toast.success(t("notifications.createSuccess"));
      router.push(`/dashboard/roles/${newRole.roleId}`);
    } catch (error: any) {
      console.error("Failed to create role:", error);
      const status = error.response?.status || error.status;
      const errorMessage = status === 409
        ? t("notifications.roleAlreadyExists")
        : t("notifications.createError");
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
    roleName,
    setRoleName,
    
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
