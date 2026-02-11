// src/features/auth/role-edit/hooks/useRoleEdit.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { updateRole, getRoleForEdit } from "../services/role-edit.service";
import { UpdateRoleRequest, PermissionGroupDto } from "../types/role-edit.types";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export const useRoleEdit = (roleId: number) => {
  const router = useRouter();
  const t = useTranslations("Role.Edit");

  const [roleCode, setRoleCode] = useState("");
  const [roleName, setRoleName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroupDto[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ roleCode?: string; roleName?: string }>({});

  // Load role data
  useEffect(() => {
    const loadRoleData = async () => {
      try {
        setIsLoadingData(true);
        const data = await getRoleForEdit(roleId);
        
        setRoleCode(data.roleCode);
        setRoleName(data.roleName);
        setIsActive(data.isActive);
        setPermissionGroups(data.permissionGroups);
      } catch (error: any) {
        console.error("Failed to load role data:", error);
        toast.error(t("loadError"));
      } finally {
        setIsLoadingData(false);
      }
    };

    loadRoleData();
  }, [roleId, t]);

  // Calculate selected permissions
  const selectedPermissionIds = useMemo(() => {
    return permissionGroups.flatMap((group) =>
      group.permissions.filter((p) => p.isAssigned).map((p) => p.permissionId)
    );
  }, [permissionGroups]);

  // Calculate all permissions selected
  const allPermissionsSelected = useMemo(() => {
    return permissionGroups.every((group) =>
      group.permissions.every((p) => p.isAssigned)
    );
  }, [permissionGroups]);

  // Calculate total selected
  const totalSelected = useMemo(() => {
    return permissionGroups.reduce(
      (acc, group) => acc + group.permissions.filter((p) => p.isAssigned).length,
      0
    );
  }, [permissionGroups]);

  // Calculate total permissions
  const totalPermissions = useMemo(() => {
    return permissionGroups.reduce((acc, group) => acc + group.permissions.length, 0);
  }, [permissionGroups]);

  // Validation
  const validate = useCallback((): boolean => {
    const newErrors: { roleCode?: string; roleName?: string } = {};

    if (!roleCode.trim()) {
      newErrors.roleCode = t("validation.roleCodeRequired");
    } else if (roleCode.length > 50) {
      newErrors.roleCode = t("validation.roleCodeMaxLength");
    }

    if (!roleName.trim()) {
      newErrors.roleName = t("validation.roleNameRequired");
    } else if (roleName.length > 100) {
      newErrors.roleName = t("validation.roleNameMaxLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [roleCode, roleName, t]);

  // Toggle single permission
  const handleTogglePermission = useCallback((permissionId: number) => {
    setPermissionGroups((prev) =>
      prev.map((group) => ({
        ...group,
        permissions: group.permissions.map((p) =>
          p.permissionId === permissionId ? { ...p, isAssigned: !p.isAssigned } : p
        ),
      }))
    );
  }, []);

  // Toggle all permissions in a group
  const handleToggleGroup = useCallback((group: PermissionGroupDto) => {
    const allSelected = group.permissions.every((p) => p.isAssigned);
    setPermissionGroups((prev) =>
      prev.map((g) =>
        g.screenCode === group.screenCode
          ? {
              ...g,
              permissions: g.permissions.map((p) => ({ ...p, isAssigned: !allSelected })),
            }
          : g
      )
    );
  }, []);

  // Toggle all permissions
  const handleToggleAll = useCallback(() => {
    const allSelected = allPermissionsSelected;
    setPermissionGroups((prev) =>
      prev.map((group) => ({
        ...group,
        permissions: group.permissions.map((p) => ({ ...p, isAssigned: !allSelected })),
      }))
    );
  }, [allPermissionsSelected]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      toast.error(t("validation.failed"));
      return;
    }

    try {
      setIsSubmitting(true);

      const request: UpdateRoleRequest = {
        roleCode: roleCode.trim(),
        roleName: roleName.trim(),
        isActive,
        permissionIds: selectedPermissionIds,
      };

      await updateRole(roleId, request);

      toast.success(t("success"));
      router.push(`/dashboard/roles/${roleId}`);
    } catch (error: any) {
      console.error("Failed to update role:", error);
      
      const errorMessage = error?.response?.data?.userMessage || t("error");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, roleCode, roleName, isActive, selectedPermissionIds, roleId, router, t]);

  // Cancel
  const handleCancel = useCallback(() => {
    router.push(`/dashboard/roles/${roleId}`);
  }, [router, roleId]);

  return {
    roleCode,
    setRoleCode,
    roleName,
    setRoleName,
    isActive,
    setIsActive,
    permissionGroups,
    allPermissionsSelected,
    totalSelected,
    totalPermissions,
    isLoadingData,
    isSubmitting,
    errors,
    handleTogglePermission,
    handleToggleGroup,
    handleToggleAll,
    handleSubmit,
    handleCancel,
  };
};
