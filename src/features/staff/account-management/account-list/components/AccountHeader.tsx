import { useTranslations } from "next-intl";
import React from "react";
import { Plus } from "lucide-react";
import { KeywordSearch } from "@/components/ui/keyword-search/keyword-search";
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';
import { Button } from "@/components/ui/button";
import { Role, AccountStatus } from '../types/staff-account.types';

interface AccountHeaderProps {
  searchTerm: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  // Filter props
  roleId?: number;
  status?: number;
  roles: Role[];
  statuses: AccountStatus[];
  isLoadingFilters: boolean;
  onRoleChange: (roleId?: number) => void;
  onStatusChange: (status?: number) => void;
}

export const AccountHeader = ({
  searchTerm,
  isLoading,
  onSearchChange,
  onCreateClick,
  roleId,
  status,
  roles,
  statuses,
  isLoadingFilters,
  onRoleChange,
  onStatusChange,
}: AccountHeaderProps) => {
  const t = useTranslations("Account.List");

  return (
    <div className="flex flex-col gap-6 mb-2 w-full">
      {/* 1. Title Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("description")}
        </p>
      </div>

      {/* 2. Toolbar Section (Search + Filters + Add Button) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
        {/* Left group: Search + Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 flex-1">
          {/* Search Component */}
          <div className="w-full lg:w-[420px]">
            <KeywordSearch
              value={searchTerm}
              onChange={onSearchChange}
              placeholder={t("searchPlaceholder")}
              loading={isLoading}
            />
          </div>

          {/* Role Filter */}
          <div className="w-full lg:w-44">
            <div className="relative">
              <select
                value={roleId || ''}
                onChange={(e) => onRoleChange(e.target.value ? Number(e.target.value) : undefined)}
                disabled={isLoadingFilters}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <option value="">{t("filters.allRoles")}</option>
                {roles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-44">
            <div className="relative">
              <select
                value={status || ''}
                onChange={(e) => onStatusChange(e.target.value ? Number(e.target.value) : undefined)}
                disabled={isLoadingFilters}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <option value="">{t("filters.allStatuses")}</option>
                {statuses.map((status) => (
                  <option key={status.valueId} value={status.valueId}>
                    {status.valueName}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <PermissionGuard permission={Permissions.CreateAccount} showDisabled={true}>
          <Button
            onClick={onCreateClick}
            variant="outline"
            className="w-full lg:w-auto shadow-md whitespace-nowrap"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("addNew")}
          </Button>
        </PermissionGuard>
      </div>
    </div>
  );
};
